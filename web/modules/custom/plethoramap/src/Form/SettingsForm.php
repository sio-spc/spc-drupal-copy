<?php
/**
 * @file
 * Contains \Drupal\plethoramap\Form\SettingsForm
 */
namespace Drupal\plethoramap\Form;

use Drupal\plethoramap\Config\ConfigManager;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure plethoramap settings for this site.
 */
class SettingsForm extends ConfigFormBase {
  /** 
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'plethoramap_admin_settings';
  }

  /** 
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'plethoramap.settings',
    ];
  }

  /** 
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    //$config = $this->config('plethoramap.settings');
    $configMan = new ConfigManager();
    $anyApps = $configMan->anyApps();

    $entityLabel = t('Plethora Map Application');
    $entityLabelPlural = t('Plethora Map Applications');
    $moduleLabel = t('Plethora Map');
    $form['plethoramap_apps'] = array(
      '#markup' => 
            '<p>' .  t('There are no global settings for this module yet.') . '</p>' 
            . '<p>' . t('To configure this module, you can ') 
            . ($anyApps ? '<a href="/admin/config/system/plethoramap/apps">' : '') 
            . t('edit any number of')
            . ' ' . $entityLabelPlural 
            . ($anyApps ? '</a>' : '') 
            . '</p>'
            . '<p>' . t('Each application will contain the configuration that will allow you to change things like the root url to the app, the path to the services that the app will use to retrieve data from the server, and any language elements such as the label for a "Feature" (which could be, for example, "Country").') . '</p>'
        . '<div class="button-container">'
        . ($anyApps ? '<a href="/admin/config/system/plethoramap/apps" class="button button--primary button--small" data-drupal-link-system-path="admin/config/system/plethoramap/apps/add">' . t('List Plethora Map Applications') . '</a> ' : '')

        . '<a href="/admin/config/system/plethoramap/apps/add" class="button button-action button--primary button--small" data-drupal-link-system-path="admin/config/system/plethoramap/apps/add">'
                . ($anyApps ? t('Add an') : t('Create your first')) . ' ' . $entityLabel
         . '</a>'
         . '</div>'
    );
    return $form; //when we have global settings, uncomment the below portion so we can actually save the setttings
//    return parent::buildForm($form, $form_state);
  }

  /** 
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {

/*
    $config = new ConfigManager();
    $config->rooturl = $form_state->getValue('plethoramap_rooturl');
*/
   /* $this->config('plethoramap.settings')
      ->set('rooturl', $form_state->getValue('plethoramap_rooturl'))
      ->save(); */

    parent::submitForm($form, $form_state);
  }
}