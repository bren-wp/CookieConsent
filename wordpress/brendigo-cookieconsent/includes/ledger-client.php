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
