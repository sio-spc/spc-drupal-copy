<?php

/**
 * @file
 * Contains \Drupal\plethoramap\Controller\PlethoraMapAppEntityListBuilder.
 */

namespace Drupal\plethoramap\Controller;

use Drupal\Core\Config\Entity\ConfigEntityListBuilder;
use Drupal\Core\Entity\EntityInterface;

/**
 * Provides a listing of PlethoraMapAppEntities.
 */
class PlethoraMapAppEntityListBuilder extends ConfigEntityListBuilder {

  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['label'] = $this->t('Plethora Map App Entities');
    $header['id'] = $this->t('Machine name');
    $header['rooturl'] = $this->t('Root URL');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    $row['label'] = $this->getLabel($entity);
    $row['id'] = $entity->id();

    // You probably want a few more properties here...
    $row['rooturl'] = $entity->getRootURL();

    return $row + parent::buildRow($entity);
  }

}