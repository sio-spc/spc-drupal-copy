<?php

/**
 * @file
 * Contains \Drupal\plethoramap\Form\PlethoraMapAppEntity\EditForm.
 */

namespace Drupal\plethoramap\Form\PlethoraMapAppEntity;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityForm;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Entity\Query\QueryFactory;
use Drupal\Core\Form\FormStateInterface;

class EditForm extends EntityForm {
  
  /**
   * @param \Drupal\Core\Entity\Query\QueryFactory $entity_query
   *   The entity query.
   */
  public function __construct(QueryFactory $entity_query) {
    $this->entityQuery = $entity_query;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity.query')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function form(array $form, FormStateInterface $form_state) {
    $form = parent::form($form, $form_state);

    $entity = $this->entity;

    $form['label'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Label'),
      '#maxlength' => 255,
      '#default_value' => $entity->label(),
      '#description' => $this->t("Label for this Plethora Map Application."),
      '#required' => TRUE,
    );
    $form['id'] = array(
      '#type' => 'machine_name',
      '#default_value' => $entity->id(),
      '#machine_name' => array(
        'exists' => array($this, 'exist'),
      ),
      '#disabled' => !$entity->isNew(),
    );
    $form['rooturl'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Root URL'),
      '#maxlength' => 255,
      '#default_value' => $entity->getRootURL(),
      '#description' => $this->t("Root URL for this Plethora Map Application."),
      '#required' => TRUE,
    );
    $form['doc_title'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Document Title'),
      '#maxlength' => 255,
      '#default_value' => $entity->getDocTitle(),
      '#description' => $this->t("The document title for the front page of this app."),
      '#required' => TRUE,
    );
    $form['dataurl_features'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Data URL: Features'),
      '#maxlength' => 255,
      '#default_value' => $entity->getDataURL('features'),
      '#description' => $this->t("The URL to use for the (json) data for the main list of features."),
      '#required' => TRUE,
    );
    $form['dataurl_feature'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Data URL: Feature'),
      '#maxlength' => 255,
      '#default_value' => $entity->getDataURL('feature'),
      '#description' => $this->t("The URL to use for the (json) data for the feature detail (for example, the zoomed in view on a country)"),
      '#required' => TRUE,
    );
    $form['dataurl_pins'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Data URL: Pins'),
      '#maxlength' => 255,
      '#default_value' => $entity->getDataURL('pins'),
      '#description' => $this->t("The URL to use for the (json) data for the list of all pins to display (if any)."),
      '#required' => FALSE,
    );
    $form['options'] = array(
      '#type' => 'textarea',
      '#title' => $this->t('Options'),
      '#default_value' => $entity->getOptions(),
      '#description' => $this->t("A url-encoded strings of default options, for example: debug=true&translateX=850&zoomInSpeed=2000&zoomOutSpeed=2000"),
      '#required' => FALSE,
    );
    $form['html_head'] = array(
      '#type' => 'textarea',
      '#title' => t('Head HTML'),
      '#description' => t('HTML to add to the head for the front page of the app.  Use this add meta data for the front page.'),
      '#default_value' =>  $entity->getHTMLHead()
    );


    $appTextStr = '';
    $appText = $entity->getAppText();

    foreach($appText as $txt){
      $appTextStr .= ($appTextStr ? "\n" : "") . $txt['key'] . ':' . $txt['value'];
    }
    $form['apptext'] = array(
      '#type' => 'textarea',
      '#title' => t('App Text'),
      '#description' => t('Enter one translation per line, in the following format:') . '<br/>' . t('Key:Value'),
      '#default_value' => $appTextStr,
    );


    return $form;
  }
  /**
   * {@inheritdoc}
   */
  protected function copyFormValuesToEntity(EntityInterface $entity, array $form, FormStateInterface $form_state) {
    // Convert multi-line string to array before copying.
    // This may be called multiple times and executed only if it is a string.
    if (is_string($form_state->getValue('apptext'))) {
      $value = $form_state->getValue('apptext');

      $result = array();
      if ($value){
        $exploded = explode("\n", $form_state->getValue('apptext'));
        foreach($exploded as $s){
         // $s = trim($s);
          $i = strpos($s, ':');
          $key = substr($s, 0, $i);
          $val = substr($s, $i + 1);
          if ($key) $result[] = array('key'=>trim($key), 'value'=>$val);
        }
      }
      $form_state->setValue('apptext', $result);
    }
    parent::copyFormValuesToEntity($entity, $form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state) {
    $entity = $this->entity;
    $status = $entity->save();

    if ($status) {
      drupal_set_message($this->t('Saved the %label Plethora Map Application.', array(
        '%label' => $entity->label(),
      )));
    }
    else {
      drupal_set_message($this->t('The %label Plethora Map Application was not saved.', array(
        '%label' => $entity->label(),
      )));
    }

    $form_state->setRedirect('entity.plethoramap.collection');
  }

  public function exist($id) {
    $entity = $this->entityQuery->get('plethoramap')
      ->condition('id', $id)
      ->execute();
    return (bool) $entity;
  }
}
