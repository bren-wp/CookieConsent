<?php
/**
 * Plugin Name: CookieConsent by Brendigo
 * Plugin URI: https://brendigo.com
 * Description: Self-hosted, privacy-first cookie consent banner and preference manager.
 * Version: 0.4.0
 * Requires at least: 6.2
 * Requires PHP: 7.4
 * Author: Brendigo
 * Author URI: https://brendigo.com
 * License: MIT
 * Text Domain: brendigo-cookieconsent
 */

namespace Brendigo\CookieConsent;

defined('ABSPATH') || exit;

const VERSION = '0.4.0';
const OPTION = 'brendigo_cookieconsent_options';

function defaults(): array {
    return [
        'language' => 'auto',
        'accent_color' => '#4357e8',
        'surface_color' => '#ffffff',
        'text_color' => '#17223e',
        'position' => 'bottom-center',
        'banner_style' => 'standard',
        'asset_source' => 'local',
        'policy_url' => '',
        'consent_days' => 180,
        'revision' => '1',
        'blocked_handles' => '',
        'services_catalog' => '',
        'google_basic' => 0,
    ];
}

function options(): array {
    $saved = get_option(OPTION, []);
    // Never re-export old, deleted or undocumented option keys.
    return array_merge(defaults(), is_array($saved) ? array_intersect_key($saved, defaults()) : []);
}

function sanitize_options($input): array {
    $input = is_array($input) ? $input : [];
    $language = isset($input['language']) ? sanitize_text_field($input['language']) : 'auto';
    $accent = isset($input['accent_color']) ? sanitize_hex_color($input['accent_color']) : false;
    $surface = isset($input['surface_color']) ? sanitize_hex_color($input['surface_color']) : false;
    $text_color = isset($input['text_color']) ? sanitize_hex_color($input['text_color']) : false;
    $position = isset($input['position']) ? sanitize_key($input['position']) : 'bottom-center';
    $positions = ['bottom-center','bottom-left','bottom-right','bottom-bar','top-center','top-left','top-right','top-bar','center'];
    $asset_source = isset($input['asset_source']) ? sanitize_key($input['asset_source']) : 'local';
    $style = isset($input['banner_style']) ? sanitize_key($input['banner_style']) : 'standard';
    $policy = isset($input['policy_url']) ? esc_url_raw($input['policy_url'], ['http', 'https']) : '';
    $handles = isset($input['blocked_handles']) ? sanitize_textarea_field($input['blocked_handles']) : '';
    return [
        'language' => in_array($language, ['auto', 'hr', 'en', 'de', 'it'], true) ? $language : 'auto',
        'accent_color' => $accent ?: '#4357e8',
        'surface_color' => $surface ?: '#ffffff',
        'text_color' => $text_color ?: '#17223e',
        'position' => in_array($position, $positions, true) ? $position : 'bottom-center',
        'banner_style' => in_array($style, ['standard', 'compact', 'minimal'], true) ? $style : 'standard',
        'asset_source' => in_array($asset_source, ['local','cdn'], true) ? $asset_source : 'local',
        'policy_url' => $policy,
        'consent_days' => isset($input['consent_days']) ? max(1, min(365, absint($input['consent_days']))) : 180,
        'revision' => isset($input['revision']) ? substr(sanitize_text_field($input['revision']), 0, 40) : '1',
        'blocked_handles' => substr($handles, 0, 4000),
        'services_catalog' => sanitize_service_catalog(isset($input['services_catalog']) ? $input['services_catalog'] : ''),
        'google_basic' => empty($input['google_basic']) ? 0 : 1,
    ];
}

/**
 * Expected line format: category|name|purpose|cookies|duration|https://provider.example/privacy
 * Invalid entries are omitted; this inventory never authorizes script loading.
 */
function parse_services($raw): array {
    if (!is_string($raw)) return [];
    $services = [];
    foreach (preg_split('/\\r\\n|\\r|\\n/', $raw) as $line) {
        if (count($services) >= 50) break;
        $parts = array_map('trim', explode('|', $line, 6));
        if (count($parts) !== 6) continue;
        [$category, $name, $purpose, $cookies, $duration, $privacy] = $parts;
        $category = sanitize_key($category);
        if (!in_array($category, ['necessary', 'preferences', 'analytics', 'marketing'], true)) continue;
        $name = substr(sanitize_text_field($name), 0, 120);
        if ($name === '') continue;
        $purpose = substr(sanitize_text_field($purpose), 0, 350);
        $cookies = substr(sanitize_text_field($cookies), 0, 300);
        $duration = substr(sanitize_text_field($duration), 0, 120);
        $privacy = $privacy === '' ? '' : esc_url_raw($privacy, ['http', 'https']);
        $services[] = [
            'category' => $category, 'name' => $name, 'purpose' => $purpose,
            'cookies' => $cookies, 'duration' => $duration, 'privacyUrl' => $privacy,
        ];
    }
    return $services;
}
function sanitize_service_catalog($raw): string {
    $items = parse_services(is_string($raw) ? substr($raw, 0, 18000) : '');
    $lines = [];
    foreach ($items as $service) {
        $lines[] = implode('|', array_map(static function ($part) {
            return str_replace('|', ' ', $part);
        }, [
            $service['category'], $service['name'], $service['purpose'],
            $service['cookies'], $service['duration'], $service['privacyUrl'],
        ]));
    }
    return implode("\n", $lines);
}
function register_settings(): void {
    register_setting('brendigo_cookieconsent', OPTION, [
        'sanitize_callback' => __NAMESPACE__ . '\\sanitize_options',
        'default' => defaults(),
    ]);
}
add_action('admin_init', __NAMESPACE__ . '\\register_settings');

function add_settings_page(): void {
    add_options_page(
        __('CookieConsent', 'brendigo-cookieconsent'),
        __('CookieConsent', 'brendigo-cookieconsent'),
        'manage_options',
        'brendigo-cookieconsent',
        __NAMESPACE__ . '\\render_settings'
    );
}
add_action('admin_menu', __NAMESPACE__ . '\\add_settings_page');

/**
 * All import/export endpoints are wp-admin authenticated, capability-gated,
 * nonce-verified, and use the same sanitization callback as Settings API.
 */
function export_settings(): void {
    if (!current_user_can('manage_options')) {
        wp_die(esc_html__('You are not allowed to export these settings.', 'brendigo-cookieconsent'), '', ['response' => 403]);
    }
    check_admin_referer('bcc_export_settings');
    $payload = [
        'schema' => 'brendigo-cookieconsent-options-v1',
        'plugin_version' => VERSION,
        'settings' => options(),
    ];
    $json = wp_json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP);
    if (!is_string($json)) {
        wp_die(esc_html__('Could not serialize settings.', 'brendigo-cookieconsent'));
    }
    nocache_headers();
    header('Content-Type: application/json; charset=utf-8');
    header('Content-Disposition: attachment; filename="cookieconsent-by-brendigo-settings.json"');
    header('X-Content-Type-Options: nosniff');
    echo $json; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON export, not HTML.
    exit;
}
add_action('admin_post_bcc_export_settings', __NAMESPACE__ . '\\export_settings');

function import_settings(): void {
    if (!current_user_can('manage_options')) {
        wp_die(esc_html__('You are not allowed to import settings.', 'brendigo-cookieconsent'), '', ['response' => 403]);
    }
    check_admin_referer('bcc_import_settings');
    $value = isset($_POST['bcc_settings_json']) && is_string($_POST['bcc_settings_json'])
        ? wp_unslash($_POST['bcc_settings_json'])
        : '';
    $decoded = strlen($value) <= 65536 ? json_decode($value, true) : null;
    $valid = is_array($decoded) && ($decoded['schema'] ?? null) === 'brendigo-cookieconsent-options-v1'
        && isset($decoded['settings']) && is_array($decoded['settings']);
    if (!$valid) {
        wp_safe_redirect(add_query_arg(['page' => 'brendigo-cookieconsent', 'bcc_import' => 'invalid'], admin_url('options-general.php')));
        exit;
    }
    $sanitized = sanitize_options($decoded['settings']);
    update_option(OPTION, $sanitized);
    wp_safe_redirect(add_query_arg(['page' => 'brendigo-cookieconsent', 'bcc_import' => 'ok'], admin_url('options-general.php')));
    exit;
}
add_action('admin_post_bcc_import_settings', __NAMESPACE__ . '\\import_settings');

function render_settings(): void {
    if (!current_user_can('manage_options')) {
        wp_die(esc_html__('You do not have permission to view this page.', 'brendigo-cookieconsent'));
    }
    $o = options();
    ?>
    <div class="wrap">
        <h1><?php echo esc_html__('CookieConsent by Brendigo', 'brendigo-cookieconsent'); ?></h1>
        <?php if (isset($_GET['bcc_import']) && $_GET['bcc_import'] === 'ok') : ?>
            <div class="notice notice-success is-dismissible"><p><?php esc_html_e('CookieConsent settings imported successfully.', 'brendigo-cookieconsent'); ?></p></div>
        <?php elseif (isset($_GET['bcc_import']) && $_GET['bcc_import'] === 'invalid') : ?>
            <div class="notice notice-error"><p><?php esc_html_e('Invalid or oversized settings JSON. No settings were changed.', 'brendigo-cookieconsent'); ?></p></div>
        <?php endif; ?>
        <p><?php echo esc_html__('Privacy choices with a self-hosted banner. Integrations must be classified and gated separately.', 'brendigo-cookieconsent'); ?></p>
        <form action="options.php" method="post">
            <?php settings_fields('brendigo_cookieconsent'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="bcc-language"><?php esc_html_e('Language', 'brendigo-cookieconsent'); ?></label></th>
                    <td><select id="bcc-language" name="<?php echo esc_attr(OPTION); ?>[language]">
                        <?php foreach (['auto' => 'Auto (site language)', 'hr' => 'Hrvatski', 'en' => 'English', 'de' => 'Deutsch', 'it' => 'Italiano'] as $code => $label) : ?>
                            <option value="<?php echo esc_attr($code); ?>" <?php selected($o['language'], $code); ?>><?php echo esc_html($label); ?></option>
                        <?php endforeach; ?>
                    </select></td>
                </tr>
                <tr>
                    <th scope="row"><label for="bcc-color"><?php esc_html_e('Accent color', 'brendigo-cookieconsent'); ?></label></th>
                    <td><input id="bcc-color" type="color" name="<?php echo esc_attr(OPTION); ?>[accent_color]" value="<?php echo esc_attr($o['accent_color']); ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="bcc-surface"><?php esc_html_e('Banner background', 'brendigo-cookieconsent'); ?></label></th>
                    <td><input id="bcc-surface" type="color" name="<?php echo esc_attr(OPTION); ?>[surface_color]" value="<?php echo esc_attr($o['surface_color']); ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="bcc-text"><?php esc_html_e('Banner text color', 'brendigo-cookieconsent'); ?></label></th>
                    <td><input id="bcc-text" type="color" name="<?php echo esc_attr(OPTION); ?>[text_color]" value="<?php echo esc_attr($o['text_color']); ?>"><p class="description"><?php esc_html_e('Low-contrast colors are corrected automatically for readability.', 'brendigo-cookieconsent'); ?></p></td>
                </tr>
                <tr>
                    <th scope="row"><label for="bcc-position"><?php esc_html_e('Banner position', 'brendigo-cookieconsent'); ?></label></th>
                    <td><select id="bcc-position" name="<?php echo esc_attr(OPTION); ?>[position]">
                        <?php foreach (['bottom-center','bottom-left','bottom-right','bottom-bar','top-center','top-left','top-right','top-bar','center'] as $position) : ?>
                            <option value="<?php echo esc_attr($position); ?>" <?php selected($o['position'], $position); ?>><?php echo esc_html(ucwords(str_replace('-', ' ', $position))); ?></option>
                        <?php endforeach; ?>
                    </select></td>
                </tr>
                <tr>
                    <th scope="row"><label for="bcc-style"><?php esc_html_e('Banner style', 'brendigo-cookieconsent'); ?></label></th>
                    <td><select id="bcc-style" name="<?php echo esc_attr(OPTION); ?>[banner_style]">
                        <?php foreach (['standard' => 'Standard', 'compact' => 'Compact', 'minimal' => 'Minimal'] as $value => $label) : ?>
                            <option value="<?php echo esc_attr($value); ?>" <?php selected($o['banner_style'], $value); ?>><?php echo esc_html($label); ?></option>
                        <?php endforeach; ?>
                    </select></td>
                </tr>
                <tr>
                    <th scope="row"><label for="bcc-assets"><?php esc_html_e('Asset delivery', 'brendigo-cookieconsent'); ?></label></th>
                    <td><select id="bcc-assets" name="<?php echo esc_attr(OPTION); ?>[asset_source]">
                        <option value="local" <?php selected($o['asset_source'], 'local'); ?>><?php esc_html_e('Local files (recommended)', 'brendigo-cookieconsent'); ?></option>
                        <option value="cdn" <?php selected($o['asset_source'], 'cdn'); ?>><?php esc_html_e('cookie.brendigo.com CDN (after deployment)', 'brendigo-cookieconsent'); ?></option>
                    </select><p class="description"><?php esc_html_e('CDN mode requires the assets to be deployed and reachable. A third-party request may disclose visitor IP data to the CDN operator.', 'brendigo-cookieconsent'); ?></p></td>
                </tr>
                <tr>
                    <th scope="row"><label for="bcc-policy"><?php esc_html_e('Cookie policy URL', 'brendigo-cookieconsent'); ?></label></th>
                    <td><input id="bcc-policy" class="regular-text" type="url" name="<?php echo esc_attr(OPTION); ?>[policy_url]" value="<?php echo esc_attr($o['policy_url']); ?>" placeholder="<?php echo esc_attr(home_url('/cookie-policy/')); ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e('Attribution', 'brendigo-cookieconsent'); ?></th>
                    <td><p><strong>CookieConsent by Brendigo</strong> — <?php esc_html_e('The by Brendigo credit is always displayed and cannot be disabled in settings.', 'brendigo-cookieconsent'); ?></p></td>
                </tr>
                <tr>
                    <th scope="row"><label for="bcc-days"><?php esc_html_e('Consent duration (days)', 'brendigo-cookieconsent'); ?></label></th>
                    <td><input id="bcc-days" type="number" min="1" max="365" name="<?php echo esc_attr(OPTION); ?>[consent_days]" value="<?php echo esc_attr($o['consent_days']); ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="bcc-revision"><?php esc_html_e('Consent policy revision', 'brendigo-cookieconsent'); ?></label></th>
                    <td><input id="bcc-revision" type="text" maxlength="40" name="<?php echo esc_attr(OPTION); ?>[revision]" value="<?php echo esc_attr($o['revision']); ?>">
                        <p class="description"><?php esc_html_e('Change this when your tracking policy changes to request consent again.', 'brendigo-cookieconsent'); ?></p></td>
                </tr>
                <tr>
                    <th scope="row"><label for="bcc-services"><?php esc_html_e('Services and cookie inventory', 'brendigo-cookieconsent'); ?></label></th>
                    <td>
                        <textarea id="bcc-services" class="large-text code" rows="8" name="<?php echo esc_attr(OPTION); ?>[services_catalog]" placeholder="analytics|Example Analytics|Measures page visits|_example_analytics|13 months|https://example.com/privacy"><?php echo esc_textarea($o['services_catalog']); ?></textarea>
                        <p class="description"><?php esc_html_e('One service per line: category|name|purpose|cookie names|duration|privacy policy URL. Maximum 50 entries. Display only: does not activate or automatically block services.', 'brendigo-cookieconsent'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e('Google Consent Mode v2 Basic', 'brendigo-cookieconsent'); ?></th>
                    <td>
                        <label><input type="checkbox" name="<?php echo esc_attr(OPTION); ?>[google_basic]" value="1" <?php checked($o['google_basic'], 1); ?>> <?php esc_html_e('Include local/CDN default-denied Google Basic adapter', 'brendigo-cookieconsent'); ?></label>
                        <p class="description"><?php esc_html_e('Google tags must be blocked separately until permitted. Consent Mode is not a substitute for correctly gating tags. Test ordering with Tag Assistant.', 'brendigo-cookieconsent'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="bcc-handles"><?php esc_html_e('Gate WordPress script handles', 'brendigo-cookieconsent'); ?></label></th>
                    <td><textarea id="bcc-handles" class="large-text code" rows="7" name="<?php echo esc_attr(OPTION); ?>[blocked_handles]" placeholder="analytics:my-analytics&#10;marketing:my-ad-script"><?php echo esc_textarea($o['blocked_handles']); ?></textarea>
                        <p class="description"><?php esc_html_e('One category:registered-script-handle per line. Allowed categories: preferences, analytics, marketing. This only gates registered script tags; audit inline scripts, embeds and other plugins separately.', 'brendigo-cookieconsent'); ?></p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
        <hr>
        <h2><?php esc_html_e('Export / import settings', 'brendigo-cookieconsent'); ?></h2>
        <p><?php esc_html_e('Download a JSON backup or paste a previously exported configuration. Imports are validated and sanitized before saving.', 'brendigo-cookieconsent'); ?></p>
        <?php
        $export_url = wp_nonce_url(
            admin_url('admin-post.php?action=bcc_export_settings'),
            'bcc_export_settings'
        );
        ?>
        <p><a class="button button-secondary" href="<?php echo esc_url($export_url); ?>"><?php esc_html_e('Export JSON configuration', 'brendigo-cookieconsent'); ?></a></p>
        <form action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post">
            <input type="hidden" name="action" value="bcc_import_settings">
            <?php wp_nonce_field('bcc_import_settings'); ?>
            <label for="bcc-settings-json"><strong><?php esc_html_e('Paste JSON configuration', 'brendigo-cookieconsent'); ?></strong></label>
            <textarea id="bcc-settings-json" class="large-text code" rows="5" name="bcc_settings_json" maxlength="65536" required></textarea>
            <p><button type="submit" class="button button-secondary"><?php esc_html_e('Import and replace settings', 'brendigo-cookieconsent'); ?></button></p>
        </form>
        <hr>
        <h2><?php esc_html_e('Integration checklist', 'brendigo-cookieconsent'); ?></h2>
        <p><?php esc_html_e('Identify optional trackers, gate them, test a first visit with rejected consent and add a persistent preferences link using data-bcc-open.', 'brendigo-cookieconsent'); ?></p>
        <p><code>&lt;button type="button" data-bcc-open&gt;Cookie settings&lt;/button&gt;</code></p>
    </div>
    <?php
}

function frontend_assets(): void {
    $o = options();
    $base = $o['asset_source'] === 'cdn'
        ? 'https://cookie.brendigo.com/v' . VERSION . '/'
        : plugin_dir_url(__FILE__) . 'assets/';
    wp_enqueue_style('brendigo-cookieconsent', $base . 'brendigo-cookieconsent.css', [], VERSION);
    if (!empty($o['google_basic'])) {
        // Enqueue this early in <head>. Actual Google tags must remain gated separately.
        wp_enqueue_script('brendigo-cookieconsent-google-basic', $base . 'google-consent-basic.js', [], VERSION, false);
    }
    wp_enqueue_script('brendigo-cookieconsent', $base . 'brendigo-cookieconsent.js', [], VERSION, true);
    $config = [
        'language' => $o['language'],
        'accentColor' => $o['accent_color'],
        'surfaceColor' => $o['surface_color'],
        'textColor' => $o['text_color'],
        'position' => $o['position'],
        'bannerStyle' => $o['banner_style'],
        'services' => parse_services($o['services_catalog']),
        'policyUrl' => $o['policy_url'] ?: home_url('/cookie-policy/'),
        'consentDays' => (int) $o['consent_days'],
        'revision' => (string) $o['revision'],
    ];
    $json = wp_json_encode($config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    if ($json) wp_add_inline_script('brendigo-cookieconsent', 'window.BCC_SITE_CONFIG = ' . $json . ';', 'before');
}
add_action('wp_enqueue_scripts', __NAMESPACE__ . '\\frontend_assets', 20);

/**
 * Change *selected* WP enqueued script tags into inert scripts.
 * Inline snippets, other tags and third-party plugin behavior need separate review.
 */
function gate_enqueued_script(string $tag, string $handle, string $src): string {
    if ($handle === 'brendigo-cookieconsent') return $tag;
    $raw = options()['blocked_handles'];
    if (!$raw || !class_exists('WP_HTML_Tag_Processor')) return $tag;
    foreach (preg_split('/[\r\n,]+/', $raw) as $line) {
        $parts = explode(':', trim($line), 2);
        if (count($parts) !== 2) continue;
        $category = trim($parts[0]);
        $registered_handle = trim($parts[1]);
        if (!in_array($category, ['preferences', 'analytics', 'marketing'], true)) continue;
        if (!preg_match('/^[a-zA-Z0-9_-]+$/', $registered_handle)) continue;
        if ($registered_handle !== $handle) continue;
        $processor = new \WP_HTML_Tag_Processor($tag);
        if (!$processor->next_tag('script')) return $tag;
        $processor->set_attribute('type', 'text/plain');
        $processor->set_attribute('data-bcc-category', $category);
        // Preserve security-relevant attributes when the inert tag is reactivated.
        foreach (['nonce', 'integrity', 'crossorigin', 'referrerpolicy'] as $attribute) {
            $value = $processor->get_attribute($attribute);
            if (is_string($value) && $value !== '') {
                $processor->set_attribute('data-bcc-' . $attribute, $value);
            }
        }
        if ($src !== '') {
            $processor->set_attribute('data-bcc-src', $src);
            $processor->remove_attribute('src');
        }
        return $processor->get_updated_html();
    }
    return $tag;
}
add_filter('script_loader_tag', __NAMESPACE__ . '\\gate_enqueued_script', 20, 3);
