<?php
/**
 * Live WordPress tests via WP-CLI eval-file, real DB and active plugin.
 */
if (!defined('ABSPATH') || !function_exists('do_shortcode')) {
    fwrite(STDERR, "Missing WordPress runtime.\n");
    exit(1);
}
function bcc_live_verify($value, $message) {
    if (!$value) {
        fwrite(STDERR, "FAIL: " . $message . "\n");
        exit(1);
    }
}
$active = get_option('active_plugins', []);
bcc_live_verify(in_array('brendigo-cookieconsent/brendigo-cookieconsent.php', $active, true),
    'plugin must be active');
bcc_live_verify(function_exists('Brendigo\\CookieConsent\\sanitize_options'),
    'plugin API loaded');
bcc_live_verify(shortcode_exists('brendigo_cookie_catalog'), 'catalog shortcode registered');
bcc_live_verify(shortcode_exists('brendigo_consent_video'), 'video shortcode registered');
bcc_live_verify(strpos(do_shortcode('[brendigo_consent_video provider="youtube" id="dQw4w9WgXcQ"]'), '<iframe') === false,
    'no third-party iframe before consent');

$settings = \Brendigo\CookieConsent\sanitize_options([
    'language'=>'hr','theme'=>'dark','position'=>'bottom-left',
    'services_catalog'=>'analytics|Statistics|Site measurements|_stats|90 days|https://example.org/privacy|site-statistics',
    'policy_url'=>'https://example.org/cookies'
]);
bcc_live_verify($settings['theme']==='dark','WP sanitizer');
update_option(\Brendigo\CookieConsent\OPTION,$settings);
$catalog=do_shortcode('[brendigo_cookie_catalog language="en"]');
bcc_live_verify(strpos($catalog,'Statistics')!==false,'catalog uses stored services');
bcc_live_verify(strpos($catalog,'<th scope="col">')!==false,'semantic catalog');
bcc_live_verify(strpos($catalog,'https://example.org/privacy')!==false,'policy link');

do_action('wp_enqueue_scripts');
bcc_live_verify(wp_script_is('brendigo-cookieconsent','enqueued'),'script enqueued');
bcc_live_verify(wp_script_is('brendigo-cookieconsent-wp-config','enqueued'),
    'CSP-safe config script enqueued');

ob_start();
\Brendigo\CookieConsent\frontend_config_meta();
$head_config = ob_get_clean();
bcc_live_verify(strpos($head_config, '<meta name="brendigo-cookieconsent-config"') !== false,
    'escaped inert config meta emitted');
bcc_live_verify(strpos($head_config, 'Statistics') !== false,
    'real WP config contains stored provider name');
bcc_live_verify(strpos($head_config, '<script') === false,
    'frontend config contains no executable script');
bcc_live_verify(strpos($head_config, 'site-statistics') !== false,
    'granular service survives PHP -> meta transport');

bcc_live_verify(wp_style_is('brendigo-cookieconsent','enqueued'),'style enqueued');
bcc_live_verify(wp_script_is('brendigo-cookieconsent-video','enqueued'),'video adapter enqueued');
$script=wp_scripts()->registered['brendigo-cookieconsent'];
bcc_live_verify(strpos((string)$script->src,'brendigo-cookieconsent.js')!==false,'JS URL');
bcc_live_verify(strpos((string)$script->src,'cookie.brendigo.com')===false,'local default');
if (class_exists('WooCommerce')) {
    bcc_live_verify(\Brendigo\CookieConsent\protected_woocommerce_script('wc-checkout'),
        'WooCommerce checkout not blocked');
    bcc_live_verify(count(\Brendigo\CookieConsent\woocommerce_services())===1,
        'WooCommerce catalog');
}
fwrite(STDOUT,"PASS real WP version ".get_bloginfo('version')."\n");
