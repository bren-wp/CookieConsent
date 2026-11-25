<?php
/**
 * Optional private backend connector. No public REST route, cookie, or hook.
 * Only a trusted caller may supply a validated visitor decision and token.
 */
namespace Brendigo\CookieConsent;

defined('ABSPATH') || exit;

/**
 * Explicit server-to-server submission. Configure only in wp-config.php or
 * another trusted server configuration. Never expose secrets to JavaScript.
 *
 * @return array|\WP_Error
 */
function record_ledger_event(array $event) {
    if (!defined('BCC_LEDGER_ENDPOINT') || !defined('BCC_LEDGER_API_KEY')) {
        return new \WP_Error('bcc_ledger_disabled', 'Consent ledger is not configured.');
    }
    $endpoint = BCC_LEDGER_ENDPOINT;
    $key = BCC_LEDGER_API_KEY;
    if (!is_string($endpoint) || !is_string($key) || !preg_match('/^[0-9a-f]{64}$/D', $key)) {
        return new \WP_Error('bcc_ledger_config', 'Invalid ledger configuration.');
    }
    $url = wp_parse_url($endpoint);
    if (!is_array($url) || ($url['scheme'] ?? '') !== 'https' || empty($url['host']) ||
        ($url['path'] ?? '') !== '/v1/events' || isset($url['user'], $url['pass']) ||
        isset($url['user']) || isset($url['pass']) || isset($url['query']) || isset($url['fragment']) ||
        (isset($url['port']) && $url['port'] !== 443)) {
        return new \WP_Error('bcc_ledger_config', 'Invalid ledger endpoint.');
    }
    $fields = ['subject_token','request_id','kind','categories','services','gpc','revision'];
    if (count($event) !== count($fields) || array_diff($fields, array_keys($event)) ||
        !is_string($event['subject_token']) || !preg_match('/^[0-9a-f]{64}$/D', $event['subject_token']) ||
        !is_string($event['request_id']) || !preg_match('/^[0-9a-f]{32}$/D', $event['request_id']) ||
        !is_string($event['revision']) || $event['revision'] !== (string) options()['revision'] ||
        !in_array($event['kind'], ['decision','withdrawal','gpc_optout'], true) ||
        !is_array($event['categories']) || !is_array($event['services']) || !is_bool($event['gpc'])) {
        return new \WP_Error('bcc_ledger_event', 'Invalid ledger event.');
    }
    $categories = ['necessary','preferences','analytics','marketing'];
    if (count($event['categories']) !== count($categories) ||
        array_diff($categories, array_keys($event['categories'])) ||
        $event['categories']['necessary'] !== true || count($event['services']) > 24) {
        return new \WP_Error('bcc_ledger_event', 'Invalid ledger event.');
    }
    foreach ($event['categories'] as $value) {
        if (!is_bool($value)) return new \WP_Error('bcc_ledger_event', 'Invalid ledger event.');
    }
    foreach ($event['services'] as $id => $value) {
        if (!is_string($id) || !preg_match('/^[A-Za-z0-9._-]{1,64}$/D', $id) || !is_bool($value)) {
            return new \WP_Error('bcc_ledger_event', 'Invalid ledger event.');
        }
    }
    // Empty PHP arrays must serialize as JSON objects for the strict API.
    $event['services'] = (object) $event['services'];
    $body = wp_json_encode($event);
    if (!is_string($body) || strlen($body) > 8192) {
        return new \WP_Error('bcc_ledger_event', 'Invalid ledger event.');
    }
    $response = wp_safe_remote_post($endpoint, [
        'timeout' => 5,
        'redirection' => 0,
        'sslverify' => true,
        'limit_response_size' => 1024,
        'headers' => ['Authorization' => 'Bearer ' . $key, 'Content-Type' => 'application/json'],
        'body' => $body,
    ]);
    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        return new \WP_Error('bcc_ledger_unavailable', 'Consent ledger unavailable.');
    }
    $data = json_decode(wp_remote_retrieve_body($response), true);
    if (!is_array($data) || count($data) !== 1 || !isset($data['event_id']) ||
        !is_string($data['event_id']) || !preg_match('/^[0-9a-f]{32}$/D', $data['event_id'])) {
        return new \WP_Error('bcc_ledger_unavailable', 'Invalid ledger response.');
    }
    return ['event_id' => $data['event_id']];
}

/**
 * An explicitly enabled, logged-in visitor ingestion route. The operator
 * must provide a random subject token through a trusted server-side resolver.
 * The browser never supplies a subject token or the private API credential.
 */
function ledger_route_permission(\WP_REST_Request $request) {
    if (!defined('BCC_LEDGER_VISITOR_ROUTE') || BCC_LEDGER_VISITOR_ROUTE !== true ||
        !defined('BCC_LEDGER_ENDPOINT') || !defined('BCC_LEDGER_API_KEY')) {
        return new \WP_Error('bcc_ledger_disabled', 'Consent ledger is disabled.', ['status'=>403]);
    }
    if (!is_user_logged_in() || !wp_verify_nonce($request->get_header('X-WP-Nonce'), 'wp_rest')) {
        return new \WP_Error('bcc_ledger_auth', 'Authentication required.', ['status'=>403]);
    }
    $origin = $request->get_header('origin');
    $site = wp_parse_url(home_url('/'));
    if (!is_array($site) || empty($site['scheme']) || empty($site['host'])) {
        return new \WP_Error('bcc_ledger_origin', 'Invalid site origin.', ['status'=>403]);
    }
    $expected = $site['scheme'] . '://' . $site['host'] .
        (isset($site['port']) ? ':' . $site['port'] : '');
    // Browser fetches must originate from the configured public site origin.
    if (is_string($origin) && $origin !== '' && $origin !== $expected) {
        return new \WP_Error('bcc_ledger_origin', 'Invalid origin.', ['status'=>403]);
    }
    return true;
}

function ledger_route_submit(\WP_REST_Request $request) {
    $permission = ledger_route_permission($request);
    if (is_wp_error($permission)) return $permission;
    $body = $request->get_body();
    $type = strtolower(trim(explode(';', $request->get_header('content-type'), 2)[0]));
    if ($type !== 'application/json' || strlen($body) > 8192 || $body === '') {
        return new \WP_Error('bcc_ledger_event', 'Invalid ledger request.', ['status'=>400]);
    }
    $event = json_decode($body, true);
    $fields = ['request_id','kind','categories','services','gpc','revision'];
    if (!is_array($event) || count($event) !== count($fields) || array_diff($fields, array_keys($event))) {
        return new \WP_Error('bcc_ledger_event', 'Invalid ledger request.', ['status'=>400]);
    }
    $subject = apply_filters('bcc_ledger_subject_token', null, get_current_user_id());
    if (!is_string($subject) || !preg_match('/^[0-9a-f]{64}$/D', $subject)) {
        return new \WP_Error('bcc_ledger_subject', 'Consent ledger subject unavailable.', ['status'=>403]);
    }
    $event['subject_token'] = $subject;
    if ($request->get_header('sec-gpc') === '1') $event['gpc'] = true;
    if ($event['gpc'] === true && (!is_array($event['categories']) ||
        ($event['categories']['marketing'] ?? null) !== false)) {
        return new \WP_Error('bcc_ledger_event', 'GPC conflicts with marketing permission.', ['status'=>400]);
    }
    $result = record_ledger_event($event);
    if (is_wp_error($result)) {
        return new \WP_Error('bcc_ledger_submission', 'Consent ledger submission failed.',
            ['status'=>$result->get_error_code() === 'bcc_ledger_event' ? 400 : 503]);
    }
    $response = new \WP_REST_Response($result, 200);
    $response->header('Cache-Control', 'no-store');
    return $response;
}

function register_ledger_route(): void {
    if (!defined('BCC_LEDGER_VISITOR_ROUTE') || BCC_LEDGER_VISITOR_ROUTE !== true ||
        !defined('BCC_LEDGER_ENDPOINT') || !defined('BCC_LEDGER_API_KEY')) return;
    register_rest_route('brendigo-cookieconsent/v1', '/ledger-events', [
        'methods' => 'POST',
        'permission_callback' => __NAMESPACE__ . '\\ledger_route_permission',
        'callback' => __NAMESPACE__ . '\\ledger_route_submit',
    ]);
}
add_action('rest_api_init', __NAMESPACE__ . '\\register_ledger_route');
