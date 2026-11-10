<?php

namespace Drupal\brendigo_cookieconsent\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

final class SettingsForm extends ConfigFormBase {

  public function getFormId(): string {
    return 'brendigo_cookieconsent_settings';
  }

  protected function getEditableConfigNames(): array {
    return ['brendigo_cookieconsent.settings'];
  }

  public function buildForm(array $form, FormStateInterface $form_state): array {
    $settings = $this->config('brendigo_cookieconsent.settings');
    $form['enabled'] = [
      '#type' => 'checkbox', '#title' => $this->t('Enable public banner'),
      '#default_value' => $settings->get('enabled'),
    ];
    $form['language'] = [
      '#type' => 'select', '#title' => $this->t('Language'),
      '#options' => ['auto' => 'Auto', 'hr' => 'HR', 'en' => 'EN',
        'de' => 'DE', 'it' => 'IT', 'es' => 'ES', 'fr' => 'FR', 'ar' => 'AR'],
      '#default_value' => $settings->get('language'),
    ];
    $form['position'] = [
      '#type' => 'select', '#title' => $this->t('Banner position'),
      '#options' => array_combine(
        ['bottom-center','bottom-left','bottom-right','bottom-bar',
          'top-center','top-left','top-right','top-bar','center'],
        ['Bottom center','Bottom left','Bottom right','Bottom bar',
          'Top center','Top left','Top right','Top bar','Center']
      ),
      '#default_value' => $settings->get('position'),
    ];
    foreach ([
      'policy_url' => ['Cookie policy URL', '/politika-kolacica'],
      'revision' => ['Consent revision', '1'],
      'accent_color' => ['Accent color (#RRGGBB)', '#4357e8'],
    ] as $key => [$label, $fallback]) {
      $form[$key] = [
        '#type' => 'textfield', '#title' => $this->t($label),
        '#default_value' => $settings->get($key) ?? $fallback,
        '#maxlength' => $key === 'policy_url' ? 500 : 40,
        '#required' => TRUE,
      ];
    }
    $form['consent_days'] = [
      '#type' => 'number', '#title' => $this->t('Consent retention days'),
      '#min' => 1, '#max' => 365,
      '#default_value' => $settings->get('consent_days'),
    ];
    return parent::buildForm($form, $form_state);
  }

  public function validateForm(array &$form, FormStateInterface $form_state): void {
    $policy = (string) $form_state->getValue('policy_url');
    if (!preg_match('~^(https?://|/(?!/))~i', $policy)) {
      $form_state->setErrorByName('policy_url', $this->t('Use an HTTP(S) URL or site-relative path.'));
    }
    if (!preg_match('/^#[a-f0-9]{6}$/i', (string) $form_state->getValue('accent_color'))) {
      $form_state->setErrorByName('accent_color', $this->t('Enter a six-digit HEX color.'));
    }
    parent::validateForm($form, $form_state);
  }

  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $config = $this->configFactory()->getEditable('brendigo_cookieconsent.settings');
    foreach (['enabled','language','position','policy_url','revision',
        'consent_days','accent_color'] as $key) {
      $config->set($key, $form_state->getValue($key));
    }
    $config->save();
    parent::submitForm($form, $form_state);
  }
}
