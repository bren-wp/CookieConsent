<?php
/**
 * Plugin Name: CookieConsent by Brendigo
 * Plugin URI: https://brendigo.com
 * Description: Self-hosted, privacy-first cookie consent banner and preference manager.
 * Version: 0.1.0
 * Requires at least: 6.2
 * Requires PHP: 7.4
 * Author: Brendigo
 * Author URI: https://brendigo.com
 * License: MIT
 * Text Domain: brendigo-cookieconsent
 */

namespace Brendigo\CookieConsent;

defined('ABSPATH') || exit;

const VERSION = '0.1.0';
const OPTION = 'brendigo_cookieconsent_options';

function defaults(): array {
    return [
        'language' => 'auto',
        'accent_color' => '#4357e8',
        'policy_url' => '',
        'show_branding' => 1,
        'show_settings_button' => 1,
        'consent_days' => 180,
        'revision' => '1',
        'blocked_handles' => '',
    ];
}

function options(): array {
    $saved = get_option(OPTION, []);
    return array_merge(defaults(), is_array($saved) ? $saved : []);
}

function sanitize_options($input): array {
    $input = is_array($input) ? $input : [];
    $language = isset($input['language']) ? sanitize_text_field($input['language']) : 'auto';
    $accent = isset($input['accent_color']) ? sanitize_hex_color($input['accent_color']) : false;
    $policy = isset($input['policy_url']) ? esc_url_raw($input['policy_url'], ['http', 'https']) : '';
    $handles = isset($input['blocked_handles']) ? sanitize_textarea_field($input['blocked_handles']) : '';
    return [
        'language' => in_array($language, ['auto', 'hr', 'en'], true) ? $language : 'auto',
        'accent_color' => $accent ?: '#4357e8',
        'policy_url' => $policy,
        'show_branding' => empty($input['show_branding']) ? 0 : 1,
        'show_settings_button' => empty($input['show_settings_button']) ? 0 : 1,
        'consent_days' => isset($input['consent_days']) ? max(1, min(365, absint($input['consent_days']))) : 180,
        'revision' => isset($input['revision']) ? substr(sanitize_text_field($input['revision']), 0, 40) : '1',
        'blocked_handles' => substr($handles, 0, 4000),
    ];
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

function render_settings(): void {
    if (!current_user_can('manage_options')) {
        wp_die(esc_html__('You do not have permission to view this page.', 'brendigo-cookieconsent'));
    }
    $o = options();
    ?>
    <div class="wrap">
        <h1><?php echo esc_html__('CookieConsent by Brendigo', 'brendigo-cookieconsent'); ?></h1>
        <p><?php echo esc_html__('Privacy choices with a self-hosted banner. Integrations must be classified and gated separately.', 'brendigo-cookieconsent'); ?></p>
        <form action="options.php" method="post">
            <?php settings_fields('brendigo_cookieconsent'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="bcc-language"><?php esc_html_e('Language', 'brendigo-cookieconsent'); ?></label></th>
                    <td><select id="bcc-language" name="<?php echo esc_attr(OPTION); ?>[language]">
                        <?php foreach (['auto' => 'Auto (site language)', 'hr' => 'Hrvatski', 'en' => 'English'] as $code => $label) : ?>
                            <option value="<?php echo esc_attr($code); ?>" <?php selected($o['language'], $code); ?>><?php echo esc_html($label); ?></option>
                        <?php endforeach; ?>
                    </select></td>
                </tr>
                <tr>
                    <th scope="row"><label for="bcc-color"><?php esc_html_e('Accent color', 'brendigo-cookieconsent'); ?></label></th>
                    <td><input id="bcc-color" type="color" name="<?php echo esc_attr(OPTION); ?>[accent_color]" value="<?php echo esc_attr($o['accent_color']); ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="bcc-policy"><?php esc_html_e('Cookie policy URL', 'brendigo-cookieconsent'); ?></label></th>
                    <td><input id="bcc-policy" class="regular-text" type="url" name="<?php echo esc_attr(OPTION); ?>[policy_url]" value="<?php echo esc_attr($o['policy_url']); ?>" placeholder="<?php echo esc_attr(home_url('/cookie-policy/')); ?>"></td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e('Branding', 'brendigo-cookieconsent'); ?></th>
                    <td><label><input type="checkbox" name="<?php echo esc_attr(OPTION); ?>[show_branding]" value="1" <?php checked($o['show_branding'], 1); ?>> <?php esc_html_e('Display "by Brendigo" in the banner and preferences', 'brendigo-cookieconsent'); ?></label></td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e('Privacy settings button', 'brendigo-cookieconsent'); ?></th>
                    <td><label><input type="checkbox" name="<?php echo esc_attr(OPTION); ?>[show_settings_button]" value="1" <?php checked($o['show_settings_button'], 1); ?>> <?php esc_html_e('Show a permanent button to reopen consent preferences', 'brendigo-cookieconsent'); ?></label></td>
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
                    <th scope="row"><label for="bcc-handles"><?php esc_html_e('Gate WordPress script handles', 'brendigo-cookieconsent'); ?></label></th>
                    <td><textarea id="bcc-handles" class="large-text code" rows="7" name="<?php echo esc_attr(OPTION); ?>[blocked_handles]" placeholder="analytics:my-analytics&#10;marketing:my-ad-script"><?php echo esc_textarea($o['blocked_handles']); ?></textarea>
                        <p class="description"><?php esc_html_e('One category:registered-script-handle per line. Allowed categories: preferences, analytics, marketing. This only gates registered script tags; audit inline scripts, embeds and other plugins separately.', 'brendigo-cookieconsent'); ?></p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
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
    $base = plugin_dir_url(__FILE__) . 'assets/';
    wp_enqueue_style('brendigo-cookieconsent', $base . 'brendigo-cookieconsent.css', [], VERSION);
    wp_enqueue_script('brendigo-cookieconsent', $base . 'brendigo-cookieconsent.js', [], VERSION, true);
    $config = [
        'language' => $o['language'],
        'accentColor' => $o['accent_color'],
        'policyUrl' => $o['policy_url'] ?: home_url('/cookie-policy/'),
        'showBranding' => (bool) $o['show_branding'],
        'showSettingsButton' => (bool) $o['show_settings_button'],
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
        if ($src !== '') {
            $processor->set_attribute('data-bcc-src', $src);
            $processor->remove_attribute('src');
        }
        return $processor->get_updated_html();
    }
    return $tag;
}
add_filter('script_loader_tag', __NAMESPACE__ . '\\gate_enqueued_script', 20, 3);
