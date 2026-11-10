<?php
namespace Brendigo\Plugin\System\CookieConsent\Extension;

defined('_JEXEC') or die;

use Joomla\CMS\Document\HtmlDocument;
use Joomla\CMS\Event\Application\BeforeCompileHeadEvent;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\Event\SubscriberInterface;

final class CookieConsent extends CMSPlugin implements SubscriberInterface
{
    protected $autoloadLanguage = true;

    public static function getSubscribedEvents(): array
    {
        return ['onBeforeCompileHead' => 'onBeforeCompileHead'];
    }

    public function onBeforeCompileHead(BeforeCompileHeadEvent $event): void
    {
        if (!$this->getApplication()->isClient('site')) {
            return;
        }
        $document = $event->getDocument();
        if (!$document instanceof HtmlDocument) {
            return;
        }

        $position = (string) $this->params->get('position', 'bottom-center');
        $positions = ['bottom-center','bottom-left','bottom-right','bottom-bar',
            'top-center','top-left','top-right','top-bar','center'];
        $language = (string) $this->params->get('language', 'auto');
        $languages = ['auto','hr','en','de','it','es','fr','ar'];
        $policy = (string) $this->params->get('policy_url', '/politika-kolacica');
        if (!preg_match('~^(https?://|/(?!/))~i', $policy)) {
            $policy = '/politika-kolacica';
        }
        $accent = (string) $this->params->get('accent_color', '#4357e8');
        if (!preg_match('/^#[a-f0-9]{6}$/i', $accent)) {
            $accent = '#4357e8';
        }

        $document->addScriptOptions('brendigoCookieConsent', [
            'language' => in_array($language, $languages, true) ? $language : 'auto',
            'position' => in_array($position, $positions, true) ? $position : 'bottom-center',
            'accentColor' => $accent,
            'revision' => substr((string) $this->params->get('revision', '1'), 0, 40),
            'consentDays' => max(1, min(365, (int) $this->params->get('consent_days', 180))),
            'policyUrl' => $policy,
        ]);

        $base = 'media/plg_system_brendigocookieconsent/';
        $assets = $document->getWebAssetManager();
        $assets->registerAndUseStyle('brendigo.consent.style',
            $base . 'css/brendigo-cookieconsent.css');
        $assets->registerAndUseScript('brendigo.consent.config',
            $base . 'js/bootstrap.js', [], ['defer' => true]);
        $assets->registerAndUseScript('brendigo.consent.core',
            $base . 'js/brendigo-cookieconsent.js', [], ['defer' => true],
            ['brendigo.consent.config']);
    }
}
