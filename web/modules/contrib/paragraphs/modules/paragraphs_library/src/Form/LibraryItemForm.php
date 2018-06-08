<?php

namespace Drupal\paragraphs_library\Form;

use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Form\FormStateInterface;

/**
 * Form controller for paragraph type forms.
 */
class LibraryItemForm extends ContentEntityForm {

  /**
   * @var \Drupal\paragraphs_library\LibraryItemInterface
   */
  protected $entity;

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state) {
    $insert = $this->entity->isNew();
    parent::save($form, $form_state);
    $form_state->setRedirect('entity.paragraphs_library_item.collection');
    if ($insert) {
      drupal_set_message(t('Paragraph %label has been created.', ['%label' => $this->entity->label()]));
    }
    else {
      drupal_set_message(t('Paragraph %label has been updated.', ['%label' => $this->entity->label()]));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getNewRevisionDefault() {
    return TRUE;
  }

}
