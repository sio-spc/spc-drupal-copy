<?php
/**
 * @file
 * Contains \Drupal\plethoramap\Config\PlethoraMapAppEntityInterface.
 */

namespace Drupal\plethoramap\Config;

use Drupal\Core\Config\Entity\ConfigEntityInterface;

/**
 * Provides an interface defining a Example entity.
 */
interface PlethoraMapAppEntityInterface extends ConfigEntityInterface {
  // Add get/set methods for your configuration properties here.
	public function getRootURL(); 
	public function setRootURL($value); 
	public function getDataURL($which); 
	public function getOptions(); 
//	public function setDataURL($which, $value); 
	public function getAppText($which=NULL); 
}
