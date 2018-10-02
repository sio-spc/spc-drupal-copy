<?php

namespace Drupal\spcrestsync\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Block\BlockPluginInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides an SPC Events feed.
 *
 * @Block(
 *   id = "spcrestsync_eventsblock",
 *   admin_label = @Translation("SPC Events"),
 *   category = @Translation("SPC Events REST Sync"),
 * )
 */

class spcrestsyncEventsBlock extends BlockBase {

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
        '#options' => [
          "all" => "Tous (aucune division sélectionnée)",
          1429 => "DECC (Durabilité environnementale et changement climatique)", 
          1430 => "EQAP (Evaluation et qualité de l’enseignement)",
          1433 => "FAME (Pêches, Aquaculture et écosystèmes marins)",
          1432 => "GEM (Géosciences)",
          1434 => "Ressources terrestres",
          1435 => "Santé Publique",
          1436 => "Droits de la personne",
          1437 => "SDP (Développement social)",
          1438 => "SDD (Statistiques pour le développement)",
          1440 => "Projets spéciaux",
          "Ou sélectionnez un projet spécial spécifique:" => [
            1443 => "CCCPIR",
            1442 => "RESCCUE",
            1441 => "Projets de sucre"
          ]
        ],
      );
    }
    else{
      $form['divisionid'] = array(
        '#type' => 'select',
        '#title' => t('Division ID'),
        '#description' => t('The ID of the division, as defined on the main SPC site. Ask web support for this number.'),
        '#default_value' => $config['divisionid'],
        '#options' => [
          "all" => "All (no division selected)",
          1429 => "CCES (Climate Change and Environmental Sustainability)", 
          1430 => "EQAP (Educational Quality and Assessment Programme)",
          1433 => "FAME (Fisheries, Aquaculture & Marine Ecosystems)",
          1432 => "GEM (Geoscience and Economic Development)",
          1434 => "LRD (Land Resources)",
          1435 => "PHP (Public Health)",
          1436 => "RRRT (Regional Rights Resource Team)",
          1437 => "SDP (Social Development Programme)",
          1438 => "SDD (Statistics for Development)",
          1440 => "Special Projects",
          "Or select a specific special project:" => [
            1443 => "CCCPIR",
            1442 => "RESCCUE",
            1441 => "Sugar Projects"
          ]
        ],
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
        '#description' => 'news from SPC site, with option to limit these to a specific division',
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