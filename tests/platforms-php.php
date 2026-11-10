<?php
/**
 * CookieConsent by Brendigo — isolated platform adapter smoke tests.
 *
 * Executes the PHP adapter methods with minimal platform API stubs, using
 * no network or database. This is not a substitute for a live installation.
 */
declare(strict_types=1);

namespace Joomla\Event {
    interface SubscriberInterface {}
}
namespace Joomla\CMS\Plugin {
    class CMSPlugin {
        protected $params;
        private $application;
        public function __construct($dispatcher = null, $config = []) {
            $this->params = $config['params'] ?? null;
        }
        public function setApplication($application): void { $this->application = $application; }
        public function getApplication() { return $this->application; }
    }
}
namespace Joomla\CMS\Document {
    class HtmlDocument {
        public array $options = [];
        public $assets;
        public function __construct() {
            $this->assets = new class {
                public array $scripts = [];
                public array $styles = [];
                public function registerAndUseStyle($name,$path): void {
                    $this->styles[$name] = $path;
                }
                public function registerAndUseScript($name,$path,$options = [],$attributes = [],$deps = []): void {
                    $this->scripts[$name] = [$path,$attributes,$deps];
                }
            };
        }
        public function addScriptOptions($name,$options): void { $this->options[$name]=$options; }
        public function getWebAssetManager() { return $this->assets; }
    }
}
namespace Joomla\CMS\Event\Application {
    class BeforeCompileHeadEvent {
        private $document;
        public function __construct($document) { $this->document=$document; }
        public function getDocument() { return $this->document; }
    }
}
namespace Magento\Framework\View\Element {
    class Template {
        protected $_scopeConfig;
        public function __construct($scopeConfig=null) { $this->_scopeConfig=$scopeConfig; }
    }
}
namespace Magento\Store\Model {
    interface ScopeInterface { public const SCOPE_STORE = 'stores'; }
}
namespace Opencart\System\Engine {
    class Controller {
        public $config;
        public $request;
    }
}
namespace {
    define('_JEXEC', true);
    define('_PS_VERSION_', '9.0.0');
    define('HTTPS_SERVER', 'https://store.example/base/');
    define('HTTP_SERVER', 'http://store.example/base/');
    $root = dirname(__DIR__);

    function bcc_assert($pass, string $message): void {
        if (!$pass) {
            fwrite(STDERR, "FAILED: $message\n");
            exit(1);
        }
    }

    // JOOMLA: event handler actually creates local asset registrations.
    require $root . '/joomla/src/Extension/CookieConsent.php';
    $params = new class {
        public function get($key,$fallback) {
            return ['position'=>'top-right','language'=>'hr',
                'policy_url'=>'/kolacici','accent_color'=>'#123abc',
                'revision'=>'joomla-test','consent_days'=>90][$key] ?? $fallback;
        }
    };
    $plugin=new \Brendigo\Plugin\System\CookieConsent\Extension\CookieConsent(null,
        ['params'=>$params]);
    $plugin->setApplication(new class {
        public function isClient($name): bool { return $name === 'site'; }
    });
    $doc=new \Joomla\CMS\Document\HtmlDocument();
    $plugin->onBeforeCompileHead(
        new \Joomla\CMS\Event\Application\BeforeCompileHeadEvent($doc));
    bcc_assert($doc->options['brendigoCookieConsent']['position']==='top-right',
        'Joomla page settings');
    bcc_assert(isset($doc->assets->scripts['brendigo.consent.core']),
        'Joomla core JS registered');
    bcc_assert(str_contains($doc->assets->styles['brendigo.consent.style'],'brendigo-cookieconsent.css'),
        'Joomla stylesheet registered');

    // DRUPAL: public route receives assets, admin route is excluded.
    class Drupal {
        public static bool $admin=false;
        public static array $settings=[
            'enabled'=>true,'language'=>'hr','position'=>'bottom-left',
            'revision'=>'drupal-test','policy_url'=>'/kolacici',
            'consent_days'=>180,'accent_color'=>'#123abc'];
        public static function service($name) {
            return new class {
                public function isAdminRoute(): bool { return \Drupal::$admin; }
            };
        }
        public static function config($name) {
            return new class {
                public function get($key) { return \Drupal::$settings[$key] ?? null; }
            };
        }
    }
    require $root . '/drupal/brendigo_cookieconsent.module';
    $attachments=[];
    brendigo_cookieconsent_page_attachments($attachments);
    bcc_assert(in_array('brendigo_cookieconsent/consent',
        $attachments['#attached']['library'] ?? [],true),'Drupal local CSS/JS library');
    bcc_assert($attachments['#attached']['drupalSettings']['brendigoCookieConsent']['language']==='hr',
        'Drupal language in drupalSettings');
    \Drupal::$admin=true;
    $adminAttachments=[];
    brendigo_cookieconsent_page_attachments($adminAttachments);
    bcc_assert($adminAttachments===[],'Drupal does not add banner to admin routes');

    // MAGENTO: safe, scoped JSON, no executable HTML from attacker-controlled config.
    require $root . '/magento/Block/Consent.php';
    $scope=new class {
        public array $values=[
            'brendigo_cookieconsent/general/enabled'=>'1',
            'brendigo_cookieconsent/general/language'=>'ar',
            'brendigo_cookieconsent/general/position'=>'top-bar',
            'brendigo_cookieconsent/general/policy_url'=>'/cookies',
            'brendigo_cookieconsent/general/revision'=>'<script>alert(1)</script>',
            'brendigo_cookieconsent/general/consent_days'=>'999',
            'brendigo_cookieconsent/general/accent_color'=>'javascript:bad',
        ];
        public function isSetFlag($key,$scope): bool { return !empty($this->values[$key]); }
        public function getValue($key,$scope) { return $this->values[$key] ?? null; }
    };
    $magento=new \Brendigo\CookieConsent\Block\Consent($scope);
    bcc_assert($magento->isEnabled(),'Magento store setting activates banner');
    $magentoJSON=$magento->getConfigJson();
    $magentoConfig=json_decode($magentoJSON,true);
    bcc_assert(is_array($magentoConfig),'Magento outputs JSON');
    bcc_assert($magentoConfig['language']==='ar','Magento language');
    bcc_assert($magentoConfig['consentDays']===365,'Magento clamps retention');
    bcc_assert($magentoConfig['accentColor']==='#4357e8','Magento sanitizes color');
    bcc_assert(!str_contains($magentoJSON,'<script>'),'Magento JSON encodes markup');

    // OPENCART: generated JS/CSS links remain store-absolute on nested SEO URLs.
    require $root . '/opencart/catalog/controller/module/cookieconsent.php';
    $open=new \Opencart\Catalog\Controller\Extension\Brendigo\Module\CookieConsent();
    $open->request=(object)['server'=>['HTTPS'=>'on']];
    $open->config=new class {
        public function get($name) {
            return [
                'module_brendigo_cookieconsent_status'=>1,
                'module_brendigo_cookieconsent_position'=>'bottom-right',
                'module_brendigo_cookieconsent_revision'=>'open-test',
                'module_brendigo_cookieconsent_policy_url'=>'/policy',
            ][$name] ?? null;
        }
    };
    $route='common/header';$data=[];$output='<html><head><title>Shop</title></head><body>';
    $open->onHeaderAfter($route,$data,$output);
    bcc_assert(str_contains($output,'https://store.example/base/extension/brendigo/catalog/view/javascript/bootstrap.js'),
        'OpenCart uses rooted asset URL');
    bcc_assert(str_contains($output,'type="application/json"'),'OpenCart inert JSON config');
    bcc_assert(str_contains($output,'brendigo-cookieconsent.js'),'OpenCart core JS');
    bcc_assert(!str_contains($output,'<script>window.BCC_SITE_CONFIG'),
        'OpenCart no executable inline configuration');
    $nullOutput='headless response';
    $open->onHeaderAfter($route,$data,$nullOutput);
    bcc_assert($nullOutput==='headless response','OpenCart leaves non-HTML alone');

    // PRESTASHOP: registered hooks, JSON-safe output and local scripts.
    class Module {
        public $name;
        public $tab;
        public $version;
        public $author;
        public $need_instance;
        public $bootstrap;
        public $ps_versions_compliancy;
        public $displayName;
        public $description;
        public $context;
        public array $hooks=[];
        public function __construct() {
            $this->context=(object)['controller'=>new class {
                public array $styles=[];
                public array $scripts=[];
                public function registerStylesheet($id,$uri,$options) { $this->styles[$id]=$uri; }
                public function registerJavascript($id,$uri,$options) { $this->scripts[$id]=$uri; }
            }];
        }
        public function install() { return true; }
        public function uninstall() { return true; }
        public function registerHook($name) { $this->hooks[]=$name; return true; }
        public function l($text) { return $text; }
    }
    class Configuration {
        public static array $values=['PS_LANG_DEFAULT'=>1];
        public static function updateValue($key,$value) { self::$values[$key]=$value; return true; }
        public static function get($key) { return self::$values[$key] ?? null; }
        public static function deleteByName($key) { unset(self::$values[$key]); return true; }
    }
    require $root . '/prestashop/brendigocookieconsent.php';
    $presta=new \BrendigoCookieConsent();
    bcc_assert($presta->install(),'PrestaShop install hook');
    bcc_assert(in_array('displayHeader',$presta->hooks,true),'PrestaShop head hook');
    bcc_assert(in_array('actionFrontControllerSetMedia',$presta->hooks,true),'PrestaShop assets hook');
    \Configuration::updateValue('BRENDIGO_BCC_REVISION','<script>alert(1)</script>');
    $presta->hookActionFrontControllerSetMedia([]);
    bcc_assert(isset($presta->context->controller->scripts['brendigo-cookieconsent-core']),
        'PrestaShop local core JS');
    $markup=$presta->hookDisplayHeader([]);
    bcc_assert(!str_contains($markup,'<script>alert(1)</script>'),
        'PrestaShop JSON escapes markup');
    bcc_assert(str_contains($markup,'type="application/json"'),'PrestaShop inert JSON');
    bcc_assert($presta->uninstall(),'PrestaShop uninstall');

    fwrite(STDOUT,"PASS five PHP platform adapter smoke tests with API stubs\n");
}
