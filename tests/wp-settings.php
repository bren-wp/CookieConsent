<?php
/**
 * Isolated plugin settings test: WordPress API doubles check OUR validation
 * behavior only. Not a substitute for testing against a real WordPress site.
 */
declare(strict_types=1);
define('ABSPATH', dirname(__DIR__));
$GLOBALS['bcc_fixture'] = [];
function add_action($name, $callback, ...$rest): void {}
function add_filter($name, $callback, ...$rest): void {}
function get_option($name, $default = null) { return $GLOBALS['bcc_fixture'][$name] ?? $default; }
function sanitize_text_field($value): string {
    return is_scalar($value) ? trim(strip_tags((string)$value)) : '';
}
function sanitize_textarea_field($value): string {
    return is_scalar($value) ? trim(strip_tags((string)$value)) : '';
}
function sanitize_hex_color($value) {
    return is_string($value) && preg_match('/^#[0-9a-fA-F]{6}$/', $value) ? $value : false;
}
function sanitize_key($value): string {
    return is_scalar($value) ? strtolower(preg_replace('/[^a-zA-Z0-9_-]/', '', (string)$value)) : '';
}
function esc_url_raw($url, $protocols = ['http','https']): string {
    if (!is_string($url)) return '';
    $scheme = parse_url($url, PHP_URL_SCHEME);
    return in_array(strtolower((string)$scheme), $protocols, true) ? $url : '';
}
function absint($value): int { return abs((int)$value); }

require __DIR__ . '/../wordpress/brendigo-cookieconsent/brendigo-cookieconsent.php';
function verify($condition, string $message): void {
    if (!$condition) {
        fwrite(STDERR, "FAIL: " . $message . PHP_EOL);
        exit(1);
    }
}

$options = \Brendigo\CookieConsent\defaults();
verify($options['language'] === 'auto', 'language defaults to auto');
verify($options['asset_source'] === 'local', 'CDN is not the default');
verify($options['banner_style'] === 'standard', 'banner style default');
verify(!array_key_exists('show_branding', $options), 'brand cannot be disabled in options');

$result = \Brendigo\CookieConsent\sanitize_options([
    'language' => 'ar',
    'direction' => 'rtl',
    'position' => 'top-right',
    'banner_style' => 'compact',
    'accent_color' => '#1177aa',
    'surface_color' => '#ffffff',
    'text_color' => '#151515',
    'consent_days' => 9999,
    'asset_source' => 'cdn',
    'services_catalog' => "analytics|Example Analytics|Statistics|_demo|13 months|https://example.org/privacy",
    'blocked_handles' => "analytics:demo-js",
]);
verify($result['language'] === 'ar' && $result['direction'] === 'rtl', 'RTL config sanitization');
verify($result['consent_days'] === 365, 'consent duration clamped');
verify($result['banner_style'] === 'compact', 'banner style whitelist');
verify($result['asset_source'] === 'cdn', 'CDN option validated');
$services = \Brendigo\CookieConsent\parse_services($result['services_catalog']);
verify(count($services) === 1 && $services[0]['category'] === 'analytics', 'service parser');
verify($services[0]['privacyUrl'] === 'https://example.org/privacy', 'valid privacy URL');
$with_id = \Brendigo\CookieConsent\parse_services('analytics|Example|Metrics|_ga|14 months|https://example.org/privacy|google');
verify($with_id[0]['toggleable'] && $with_id[0]['id'] === 'google', 'service ID enables granular choice');
$rules = \Brendigo\CookieConsent\parse_cleanup_rules("analytics|exact|_gid|google\nmarketing|prefix|_fbp|");
verify(count($rules) === 2 && $rules[0]['serviceId'] === 'google', 'valid cleanup rule parsing');
$bad_rules = \Brendigo\CookieConsent\parse_cleanup_rules("analytics|exact|bad;cookie|\nnecessary|prefix|foo|");
verify(count($bad_rules) === 0, 'invalid cleanup rules excluded');

$bad = \Brendigo\CookieConsent\sanitize_options([
    'language' => 'hacker', 'direction' => 'ltr; display:none',
    'position' => 'absolute', 'banner_style' => 'evil',
    'accent_color' => 'red', 'asset_source' => 'external',
    'services_catalog' => "marketing|Example|Ads|_demo|1 day|javascript:alert(1)",
]);
verify($bad['language'] === 'auto' && $bad['direction'] === 'auto', 'language and direction fallback');
verify($bad['position'] === 'bottom-center', 'invalid position rejected');
verify($bad['banner_style'] === 'standard', 'invalid style rejected');
verify($bad['accent_color'] === '#4357e8', 'invalid color rejected');
verify($bad['asset_source'] === 'local', 'invalid asset source rejected');
verify(\Brendigo\CookieConsent\parse_services($bad['services_catalog'])[0]['privacyUrl'] === '', 'javascript: URLs rejected');

$GLOBALS['bcc_fixture'][\Brendigo\CookieConsent\OPTION] = ['language'=>'de','show_branding'=>0];
$live = \Brendigo\CookieConsent\options();
verify(!array_key_exists('show_branding',$live), 'legacy disabled branding key removed');
verify($live['language'] === 'de', 'known options retained');
verify(!\Brendigo\CookieConsent\protected_woocommerce_script('wc-checkout'), 'no Woo adapter without WooCommerce');
eval('class WooCommerce {}');
verify(\Brendigo\CookieConsent\protected_woocommerce_script('wc-checkout'), 'Woo cart/checkout protected');
verify(!\Brendigo\CookieConsent\protected_woocommerce_script('wc-analytics'), 'Woo analytics not automatically exempt');
verify(count(\Brendigo\CookieConsent\woocommerce_services()) === 1, 'Woo inventory when active');

fwrite(STDOUT, "PASS: WordPress settings validation and WooCommerce adapter smoke test" . PHP_EOL);
