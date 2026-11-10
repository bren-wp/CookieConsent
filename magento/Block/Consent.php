<?php
declare(strict_types=1);

namespace Brendigo\CookieConsent\Block;

use Magento\Framework\View\Element\Template;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Store\Model\ScopeInterface;

final class Consent extends Template
{
    private const BASE = 'brendigo_cookieconsent/general/';

    public function isEnabled(): bool
    {
        return $this->_scopeConfig->isSetFlag(self::BASE . 'enabled', ScopeInterface::SCOPE_STORE);
    }

    public function getConfigJson(): string
    {
        // Retrieve from the Magento store-scope configuration; never render
        // arbitrary HTML in the template or evaluate configuration as code.
        $read = function (string $key, string $fallback): string {
            $data = $this->_scopeConfig->getValue(
                self::BASE . $key, ScopeInterface::SCOPE_STORE
            );
            return is_scalar($data) && (string) $data !== '' ? (string) $data : $fallback;
        };
        $language = $read('language', 'auto');
        $position = $read('position', 'bottom-center');
        $policy = $read('policy_url', '/cookie-policy');
        $accent = $read('accent_color', '#4357e8');

        $data = [
            'language' => in_array($language, ['auto','hr','en','de','it','es','fr','ar'], true) ? $language : 'auto',
            'position' => in_array($position, ['bottom-center','bottom-left','bottom-right',
                'bottom-bar','top-center','top-left','top-right','top-bar','center'], true)
                ? $position : 'bottom-center',
            'policyUrl' => preg_match('~^(https?://|/(?!/))~i', $policy) ? $policy : '/cookie-policy',
            'revision' => substr($read('revision', '1'), 0, 40),
            'accentColor' => preg_match('/^#[0-9a-f]{6}$/i', $accent) ? $accent : '#4357e8',
            'consentDays' => max(1, min(365, (int) $read('consent_days', '180'))),
        ];
        return (string) json_encode($data,
            JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT |
            JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
}
