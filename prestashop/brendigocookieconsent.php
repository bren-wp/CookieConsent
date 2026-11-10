<?php
if (!defined('_PS_VERSION_')) {
    exit;
}

class BrendigoCookieConsent extends Module
{
    public function __construct()
    {
        $this->name = 'brendigocookieconsent';
        $this->tab = 'administration';
        $this->version = '0.11.1';
        $this->author = 'Brendigo';
        $this->need_instance = 0;
        $this->bootstrap = true;
        parent::__construct();
        $this->displayName = $this->l('CookieConsent by Brendigo');
        $this->description = $this->l('Privacy preferences and consent banner, with local assets.');
        $this->ps_versions_compliancy = ['min'=>'8.0.0','max'=>_PS_VERSION_];
    }

    public function install()
    {
        return parent::install()
            && $this->registerHook('displayHeader')
            && $this->registerHook('actionFrontControllerSetMedia')
            && Configuration::updateValue('BRENDIGO_BCC_ENABLED', 1)
            && Configuration::updateValue('BRENDIGO_BCC_LANGUAGE', 'auto')
            && Configuration::updateValue('BRENDIGO_BCC_POSITION', 'bottom-center')
            && Configuration::updateValue('BRENDIGO_BCC_POLICY', '/cookie-policy')
            && Configuration::updateValue('BRENDIGO_BCC_REVISION', '1')
            && Configuration::updateValue('BRENDIGO_BCC_COLOR', '#4357e8');
    }

    public function uninstall()
    {
        foreach (['ENABLED','LANGUAGE','POSITION','POLICY','REVISION','COLOR'] as $key) {
            Configuration::deleteByName('BRENDIGO_BCC_' . $key);
        }
        return parent::uninstall();
    }

    public function getContent()
    {
        $output = '';
        if (Tools::isSubmit('submitBrendigoCookieConsent')) {
            $languages = ['auto','hr','en','de','it','es','fr','ar'];
            $positions = ['bottom-center','bottom-left','bottom-right','bottom-bar',
                'top-center','top-left','top-right','top-bar','center'];
            $lang = (string) Tools::getValue('BRENDIGO_BCC_LANGUAGE', 'auto');
            $pos = (string) Tools::getValue('BRENDIGO_BCC_POSITION', 'bottom-center');
            $policy = trim((string) Tools::getValue('BRENDIGO_BCC_POLICY', '/cookie-policy'));
            $color = (string) Tools::getValue('BRENDIGO_BCC_COLOR', '#4357e8');
            $revision = trim((string) Tools::getValue('BRENDIGO_BCC_REVISION', '1'));
            if (!preg_match('~^(https?://|/(?!/))~i', $policy) ||
                !preg_match('/^#[0-9a-f]{6}$/i', $color)) {
                $output = $this->displayError($this->l('Use a valid policy URL/path and HEX color.'));
            } else {
                Configuration::updateValue('BRENDIGO_BCC_ENABLED', (int) Tools::getValue('BRENDIGO_BCC_ENABLED', 0) ? 1 : 0);
                Configuration::updateValue('BRENDIGO_BCC_LANGUAGE', in_array($lang,$languages,true)?$lang:'auto');
                Configuration::updateValue('BRENDIGO_BCC_POSITION', in_array($pos,$positions,true)?$pos:'bottom-center');
                Configuration::updateValue('BRENDIGO_BCC_POLICY', substr($policy,0,500));
                Configuration::updateValue('BRENDIGO_BCC_REVISION', substr($revision,0,40));
                Configuration::updateValue('BRENDIGO_BCC_COLOR', $color);
                $output = $this->displayConfirmation($this->l('Settings saved.'));
            }
        }
        return $output . $this->renderForm();
    }

    private function renderForm()
    {
        $helper = new HelperForm();
        $helper->module = $this;
        $helper->name_controller = $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $helper->currentIndex = AdminController::$currentIndex . '&configure=' . $this->name;
        $helper->submit_action = 'submitBrendigoCookieConsent';
        $helper->default_form_language = (int) Configuration::get('PS_LANG_DEFAULT');
        $helper->fields_value = [
            'BRENDIGO_BCC_ENABLED'=>Configuration::get('BRENDIGO_BCC_ENABLED'),
            'BRENDIGO_BCC_LANGUAGE'=>Configuration::get('BRENDIGO_BCC_LANGUAGE'),
            'BRENDIGO_BCC_POSITION'=>Configuration::get('BRENDIGO_BCC_POSITION'),
            'BRENDIGO_BCC_POLICY'=>Configuration::get('BRENDIGO_BCC_POLICY'),
            'BRENDIGO_BCC_REVISION'=>Configuration::get('BRENDIGO_BCC_REVISION'),
            'BRENDIGO_BCC_COLOR'=>Configuration::get('BRENDIGO_BCC_COLOR'),
        ];
        $select = static function (array $options): array {
            $result = [];
            foreach ($options as $value => $label) $result[]=['id'=>$value,'name'=>$label];
            return $result;
        };
        return $helper->generateForm([['form'=>[
            'legend'=>['title'=>$this->l('CookieConsent by Brendigo')],
            'input'=>[
                ['type'=>'switch','name'=>'BRENDIGO_BCC_ENABLED','label'=>$this->l('Enable'),
                    'is_bool'=>true,'values'=>[
                      ['id'=>'bcc_on','value'=>1,'label'=>$this->l('Yes')],
                      ['id'=>'bcc_off','value'=>0,'label'=>$this->l('No')]
                    ]],
                ['type'=>'select','name'=>'BRENDIGO_BCC_LANGUAGE','label'=>$this->l('Language'),
                    'options'=>['query'=>$select(['auto'=>'Auto','hr'=>'HR','en'=>'EN',
                       'de'=>'DE','it'=>'IT','es'=>'ES','fr'=>'FR','ar'=>'AR']), 'id'=>'id','name'=>'name']],
                ['type'=>'select','name'=>'BRENDIGO_BCC_POSITION','label'=>$this->l('Position'),
                    'options'=>['query'=>$select(array_combine(
                      ['bottom-center','bottom-left','bottom-right','bottom-bar',
                       'top-center','top-left','top-right','top-bar','center'],
                      ['Bottom center','Bottom left','Bottom right','Bottom bar',
                       'Top center','Top left','Top right','Top bar','Center']
                    )), 'id'=>'id','name'=>'name']],
                ['type'=>'text','name'=>'BRENDIGO_BCC_POLICY','label'=>$this->l('Policy URL / path')],
                ['type'=>'text','name'=>'BRENDIGO_BCC_REVISION','label'=>$this->l('Revision')],
                ['type'=>'text','name'=>'BRENDIGO_BCC_COLOR','label'=>$this->l('Accent HEX color')],
            ],
            'submit'=>['title'=>$this->l('Save')]
        ]]]);
    }

    public function hookActionFrontControllerSetMedia($params)
    {
        if (!Configuration::get('BRENDIGO_BCC_ENABLED')) return;
        $base = 'modules/' . $this->name . '/views/';
        $this->context->controller->registerStylesheet('brendigo-cookieconsent-style',
            $base . 'css/brendigo-cookieconsent.css',['media'=>'all','priority'=>30]);
        $this->context->controller->registerJavascript('brendigo-cookieconsent-config',
            $base . 'js/bootstrap.js',['position'=>'bottom','priority'=>10]);
        $this->context->controller->registerJavascript('brendigo-cookieconsent-core',
            $base . 'js/brendigo-cookieconsent.js',['position'=>'bottom','priority'=>20]);
    }

    public function hookDisplayHeader($params)
    {
        if (!Configuration::get('BRENDIGO_BCC_ENABLED')) return '';
        $lang = (string) Configuration::get('BRENDIGO_BCC_LANGUAGE');
        $position = (string) Configuration::get('BRENDIGO_BCC_POSITION');
        $policy = (string) Configuration::get('BRENDIGO_BCC_POLICY');
        $accent = (string) Configuration::get('BRENDIGO_BCC_COLOR');
        $data = [
            'language'=>in_array($lang,['auto','hr','en','de','it','es','fr','ar'],true)?$lang:'auto',
            'position'=>in_array($position,['bottom-center','bottom-left','bottom-right',
                'bottom-bar','top-center','top-left','top-right','top-bar','center'],true)
                ?$position:'bottom-center',
            'policyUrl'=>preg_match('~^(https?://|/(?!/))~i',$policy)?$policy:'/cookie-policy',
            'revision'=>substr((string)Configuration::get('BRENDIGO_BCC_REVISION'),0,40),
            'accentColor'=>preg_match('/^#[0-9a-f]{6}$/i',$accent)?$accent:'#4357e8',
        ];
        $json = json_encode($data, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|
            JSON_HEX_QUOT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
        return '<script type="application/json" id="brendigo-cookieconsent-config">' .
            $json . '</script>';
    }
}
