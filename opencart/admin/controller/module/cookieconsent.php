<?php
namespace Opencart\Admin\Controller\Extension\Brendigo\Module;

class CookieConsent extends \Opencart\System\Engine\Controller
{
    private const CODE = 'module_brendigo_cookieconsent';

    public function index(): void
    {
        $this->load->language('extension/brendigo/module/cookieconsent');
        $this->document->setTitle($this->language->get('heading_title'));
        $this->load->model('setting/setting');

        if ($this->request->server['REQUEST_METHOD'] === 'POST') {
            if (!$this->user->hasPermission('modify', 'extension/brendigo/module/cookieconsent')) {
                $this->session->data['error_warning'] = $this->language->get('error_permission');
            } else {
                $data = $this->request->post;
                $langs = ['auto','hr','en','de','it','es','fr','ar'];
                $positions = ['bottom-center','bottom-left','bottom-right','bottom-bar',
                    'top-center','top-left','top-right','top-bar','center'];
                $language = (string) ($data['module_brendigo_cookieconsent_language'] ?? 'auto');
                $position = (string) ($data['module_brendigo_cookieconsent_position'] ?? 'bottom-center');
                $policy = (string) ($data['module_brendigo_cookieconsent_policy_url'] ?? '/cookie-policy');
                $accent = (string) ($data['module_brendigo_cookieconsent_accent_color'] ?? '#4357e8');
                $this->model_setting_setting->editSetting(self::CODE, [
                    'module_brendigo_cookieconsent_status' => empty($data['module_brendigo_cookieconsent_status']) ? 0 : 1,
                    'module_brendigo_cookieconsent_language' => in_array($language, $langs, true) ? $language : 'auto',
                    'module_brendigo_cookieconsent_position' => in_array($position, $positions, true) ? $position : 'bottom-center',
                    'module_brendigo_cookieconsent_policy_url' => preg_match('~^(https?://|/(?!/))~i', $policy) ? substr($policy, 0, 500) : '/cookie-policy',
                    'module_brendigo_cookieconsent_accent_color' => preg_match('/^#[0-9a-f]{6}$/i', $accent) ? $accent : '#4357e8',
                    'module_brendigo_cookieconsent_revision' => substr((string) ($data['module_brendigo_cookieconsent_revision'] ?? '1'), 0, 40),
                    'module_brendigo_cookieconsent_consent_days' => max(1, min(365, (int) ($data['module_brendigo_cookieconsent_consent_days'] ?? 180))),
                ]);
                $this->session->data['success'] = $this->language->get('text_success');
            }
            $this->response->redirect($this->url->link('extension/brendigo/module/cookieconsent',
                'user_token=' . $this->session->data['user_token']));
            return;
        }
        $data = [
            'heading_title' => $this->language->get('heading_title'),
            'save' => $this->language->get('button_save'),
            'cancel' => $this->url->link('marketplace/extension',
                'user_token=' . $this->session->data['user_token'] . '&type=module'),
            'action' => $this->url->link('extension/brendigo/module/cookieconsent',
                'user_token=' . $this->session->data['user_token']),
            'user_token' => $this->session->data['user_token'],
            'header' => $this->load->controller('common/header'),
            'column_left' => $this->load->controller('common/column_left'),
            'footer' => $this->load->controller('common/footer'),
        ];
        foreach (['status' => '0','language' => 'auto','position' => 'bottom-center',
            'policy_url'=>'/cookie-policy','accent_color'=>'#4357e8',
            'revision'=>'1','consent_days'=>180] as $key=>$fallback) {
            $value = $this->config->get(self::CODE.'_'.$key);
            $data[$key] = $value === null ? $fallback : $value;
        }
        $data['languages'] = ['auto'=>'Auto','hr'=>'Hrvatski','en'=>'English',
            'de'=>'Deutsch','it'=>'Italiano','es'=>'Español','fr'=>'Français','ar'=>'العربية'];
        $data['positions'] = [
            'bottom-center'=>'Bottom center','bottom-left'=>'Bottom left',
            'bottom-right'=>'Bottom right','bottom-bar'=>'Bottom bar',
            'top-center'=>'Top center','top-left'=>'Top left','top-right'=>'Top right',
            'top-bar'=>'Top bar','center'=>'Center'
        ];
        $this->response->setOutput($this->load->view('extension/brendigo/module/cookieconsent', $data));
    }

    public function install(): void
    {
        $this->load->model('setting/event');
        $this->model_setting_event->addEvent([
            'code'=>'brendigo_cookieconsent_header',
            'description'=>'CookieConsent by Brendigo — storefront header',
            'trigger'=>'catalog/view/common/header/after',
            'action'=>'extension/brendigo/module/cookieconsent.onHeaderAfter',
            'status'=>1,
            'sort_order'=>0
        ]);
    }

    public function uninstall(): void
    {
        $this->load->model('setting/event');
        $this->model_setting_event->deleteEventByCode('brendigo_cookieconsent_header');
    }
}
