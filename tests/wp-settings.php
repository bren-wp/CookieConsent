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
function add_shortcode($name, $callback): void {}
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
function esc_html($v): string { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); }
function esc_html__($value, $domain = ''): string { return esc_html($value); }
function esc_attr($v): string { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); }
function esc_url($v): string { return is_string($v) && preg_match('~^https?://~', $v) ? esc_attr($v) : ''; }
function determine_locale(): string { return 'hr_HR'; }

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
if (true) { class WooCommerce {} } // Load fixture at runtime; no eval.
verify(\Brendigo\CookieConsent\protected_woocommerce_script('wc-checkout'), 'Woo cart/checkout protected');
verify(!\Brendigo\CookieConsent\protected_woocommerce_script('wc-analytics'), 'Woo analytics not automatically exempt');
verify(count(\Brendigo\CookieConsent\woocommerce_services()) === 1, 'Woo inventory when active');

fwrite(STDOUT, "PASS: WordPress settings validation and WooCommerce adapter smoke test" . PHP_EOL);

$translation_input = json_encode([
    'hr' => ['heading' => 'Privatnost po vašem izboru',
        'accept' => '<img src=x onerror=alert(1)>Prihvati sve', 'unexpected' => 'ignored'],
    'es' => ['reject' => 'Rechazar todo'],
    'xx' => ['heading' => 'Unknown language'],
    'en' => ['intro' => str_repeat('x', 710)],
]);
$translation_safe = \Brendigo\CookieConsent\sanitize_translation_overrides($translation_input);
$translation_data = json_decode($translation_safe, true);
verify(isset($translation_data['hr']['heading']), 'Croatian translation preserved');
verify(strpos($translation_data['hr']['accept'], '<') === false, 'HTML removed from override');
verify(!isset($translation_data['hr']['unexpected']), 'unknown translation keys removed');
verify(!isset($translation_data['xx']), 'unknown locales rejected');
verify(isset($translation_data['es']['reject']), 'Spanish translations supported');
verify(strlen($translation_data['en']['intro']) === 700, 'long descriptions truncated');
verify(\Brendigo\CookieConsent\sanitize_translation_overrides('{invalid-json}') === '', 'invalid JSON rejected');
verify(\Brendigo\CookieConsent\sanitize_translation_overrides(str_repeat('x', 24001)) === '', 'oversized JSON rejected');
verify(\Brendigo\CookieConsent\sanitize_options(['language'=>'fr'])['language'] === 'fr', 'French locale allowed');

$GLOBALS['bcc_fixture'][\Brendigo\CookieConsent\OPTION] = [
 'services_catalog' => "analytics|Statistics & Revenue|Statistics|_stats|90 days|https://example.org/privacy|stats",
];
$catalog = \Brendigo\CookieConsent\render_catalog_shortcode(['language' => 'hr']);
verify(strpos($catalog,'<script') === false, 'catalog does not render user-controlled HTML');
verify(strpos($catalog,'Statistics &amp; Revenue') !== false, 'catalog escapes provider text');
verify(strpos($catalog,'https://example.org/privacy') !== false, 'catalog includes safe policy link');
verify(strpos($catalog,'scope="col"') !== false, 'catalog is semantic table');
verify(strpos(\Brendigo\CookieConsent\render_catalog_shortcode(['language'=>'ar']),'dir="rtl"') !== false,
 'catalog supports RTL direction');

$video = \Brendigo\CookieConsent\render_video_shortcode([
    'provider'=>'youtube','id'=>'dQw4w9WgXcQ','title'=>'<b>Video</b>',
    'category'=>'marketing'
]);
verify(strpos($video, '<iframe') === false, 'video shortcode must not embed before consent');
verify(strpos($video,'data-bcc-video="youtube"') !== false, 'video placeholder declared');
verify(strpos($video,'<b>') === false, 'video title escapes HTML');
verify(\Brendigo\CookieConsent\render_video_shortcode(['provider'=>'youtube','id'=>'javascript:1']) === '',
    'invalid video identifiers rejected');
verify(\Brendigo\CookieConsent\render_video_shortcode(['provider'=>'vimeo','id'=>'12345678',
  'category'=>'necessary']) === '', 'video category must be optional');

$layout = \\Brendigo\\CookieConsent\\sanitize_options([
  'banner_width'=>'920','mobile_width'=>'88','banner_padding'=>'24',
  'banner_radius'=>'0','banner_offset'=>'32','heading_size'=>'26',
  'body_size'=>'16','button_height'=>'48','button_radius'=>'8'
]);
verify($layout['banner_width']===920 && $layout['mobile_width']===88,'layout widths saved');
verify($layout['banner_radius']===0 && $layout['button_radius']===8,'zero radius and button radius');
verify($layout['banner_offset']===32 && $layout['heading_size']===26,'spacing and type saved');
verify($layout['body_size']===16 && $layout['button_height']===48,'text and tap target saved');
$invalid_layout=\\Brendigo\\CookieConsent\\sanitize_options([
  'banner_width'=>'999999','mobile_width'=>'30','banner_padding'=>'calc(1px)',
  'banner_radius'=>'-2','banner_offset'=>'8; background: red',
  'heading_size'=>'9','body_size'=>'50','button_height'=>'41','button_radius'=>'999'
]);
verify($invalid_layout['banner_width']===0 && $invalid_layout['mobile_width']===100,
  'out-of-range widths rejected');
verify($invalid_layout['banner_padding']===0 && $invalid_layout['banner_offset']===0,
  'CSS injection rejected');
verify($invalid_layout['banner_radius']===-1 && $invalid_layout['button_radius']===-1,
  'invalid corner radii fallback to preset');
verify($invalid_layout['heading_size']===0 && $invalid_layout['body_size']===0,
  'font sizes bounded');
verify($invalid_layout['button_height']===0,'undersized button rejected');
