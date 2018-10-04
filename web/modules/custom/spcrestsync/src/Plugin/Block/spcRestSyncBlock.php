<?php

namespace Drupal\spcrestsync\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Block\BlockPluginInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides an SPC Updates.
 *
 * @Block(
 *   id = "spcrestsync_block",
 *   admin_label = @Translation("SPC Updates"),
 *   category = @Translation("SPC REST Sync"),
 * )
 */
class spcrestsyncBlock extends BlockBase {

  /**
  * {@inheritdoc}
  */
  public function blockForm($form, FormStateInterface $form_state) {

    //$form = parent::blockForm($form, $form_state);

    $config = $this->getConfiguration();

    //kint($config);

    $form['limit'] = array(
        '#type' => 'number',
        '#title' => t('Limit'),
        '#description' => t('Limit of posts'),
        '#default_value' => 12
    );
    $language = \Drupal::languageManager()->getCurrentLanguage()->getId();
    if($language == "fr"){
      $form['divisionid'] = array(
        '#type' => 'select',
        '#title' => t('Division ID'),
        '#description' => t('The ID of the division, as defined on the main SPC site. Ask web support for this number.'),
        '#default_value' => $config['divisionid'],
        '#options' => spcrestsyncDivisionArray("fr"),
      );
    }
    else{
      $form['divisionid'] = array(
      '#type' => 'select',
      '#title' => t('Division ID'),
      '#description' => t('The ID of the division, as defined on the main SPC site. Ask web support for this number.'),
      '#default_value' => $config['divisionid'],
      '#options' => spcrestsyncDivisionArray("en"),
    );
    }
    

    return $form;
  }

  /**
  * {@inheritdoc}
  */
  public function blockSubmit($form, FormStateInterface $form_state) {
    $this->configuration['limit'] = $form_state->getValue('limit');
    $this->configuration['divisionid'] = $form_state->getValue('divisionid');
    $block_id = $form['id']['#default_value'];
    $this->configuration['spc_block_instance_id'] = $block_id;
  }


  /**
  * {@inheritdoc}
  */
  public function build() {

    $config = $this->getConfiguration();
    if (!empty($config['limit'])) {
      $limit = $config['limit'];
    }
    else {
      $limit = 4;
    }
    if (!empty($config['divisionid'])) {
      $divisionid = $config['divisionid'];
    }
    else {
      $divisionid = 'all';//generates a 500 error but still works..
    }

    return array(
        '#theme' => 'spcrestsync',
        '#title' => $config['title'],
        '#description' => 'updates from SPC site, with option to limit these to a specific division',
        '#attached' => array(
          'library' => array(
            'spcrestsync/general',
          ),
        ),
        '#markup' => 
          $this->t('Limit', array(
            '@limit' => $limit,
          )),
          $this->t('Division ID', array(
            '@divisionid' => $divisionid,
          )),
    );
  }
}