<?php
/**
 * @file
 * Contains \Drupal\plethoramap\Form\PlethoraMapAppEntity\DeleteForm.
 */

namespace Drupal\plethoramap\Form\PlethoraMapAppEntity;

use Drupal\Core\Entity\EntityConfirmFormBase;
use Drupal\Core\Url;
use Drupal\Core\Form\FormStateInterface;

/**
 * Builds the form to delete an PlethoraTopicAppEntity.
 */

class DeleteForm extends EntityConfirmFormBase {

  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    return $this->t('Are you sure you want to delete %name?', array('%name' => $this->entity->label()));
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return new Url('entity.plethoramap.collection');
  }

  /**
   * {@inheritdoc}
   */
  public function getConfirmText() {
    return $this->t('Delete');
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->entity->delete();
    drupal_set_message($this->t('%label has been deleted.', array('%label' => $this->entity->label())));

    $form_state->setRedirectUrl($this->getCancelUrl());
  }
}
