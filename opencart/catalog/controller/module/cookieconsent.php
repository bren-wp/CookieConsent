<?php
namespace Opencart\Catalog\Controller\Extension\Brendigo\Module;

class CookieConsent extends \Opencart\System\Engine\Controller
{
    /**
     * Called via the registered catalog/view/common/header/after event.
     * Only modifies the storefront header; avoids third-party CDN calls.
     */
    public function onHeaderAfter(&$route, &$data, &$output): void
    {
        if (!$this->config->get('module_brendigo_cookieconsent_status') || !is_string($output)) {
            return;
        }
        $languages = ['auto','hr','en','de','it','es','fr','ar'];
        $positions = ['bottom-center','bottom-left','bottom-right','bottom-bar',
            'top-center','top-left','top-right','top-bar','center'];
        $lang = (string) ($this->config->get('module_brendigo_cookieconsent_language') ?: 'auto');
        $pos = (string) ($this->config->get('module_brendigo_cookieconsent_position') ?: 'bottom-center');
        $policy = (string) ($this->config->get('module_brendigo_cookieconsent_policy_url') ?: '/cookie-policy');
        $accent = (string) ($this->config->get('module_brendigo_cookieconsent_accent_color') ?: '#4357e8');
        $config = [
            'language'=>in_array($lang, $languages, true) ? $lang : 'auto',
            'position'=>in_array($pos, $positions, true) ? $pos : 'bottom-center',
            'policyUrl'=>preg_match('~^(https?://|/(?!/))~i', $policy) ? $policy : '/cookie-policy',
            'revision'=>substr((string) ($this->config->get('module_brendigo_cookieconsent_revision') ?: '1'),0,40),
            'accentColor'=>preg_match('/^#[0-9a-f]{6}$/i', $accent) ? $accent : '#4357e8',
            'consentDays'=>max(1,min(365,(int) ($this->config->get('module_brendigo_cookieconsent_consent_days') ?: 180)))
        ];
        $json = json_encode($config,
            JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_SLASHES);
        $base = 'extension/brendigo/catalog/view/javascript/';
        // This event edits only the header template's HTML before it is sent.
        $html = '<link rel="stylesheet" href="' . $base . 'brendigo-cookieconsent.css">' .
            '<script>window.BCC_SITE_CONFIG=' . $json . ';</script>' .
            '<script defer src="' . $base . 'brendigo-cookieconsent.js"></script>';
        if (stripos($output, '</head>') !== false) {
            $output = preg_replace('~</head>~i', $html . '</head>', $output, 1);
        }
    }
}
