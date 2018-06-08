<?php
/**
 * @file
 * Contains \Drupal\plethoramap\Entity\PlethoraMapAppEntity.
 */

namespace Drupal\plethoramap\Entity;

use Drupal\Core\Config\Entity\ConfigEntityBase;
use Drupal\plethoramap\Config\PlethoraMapAppEntityInterface;
use Drupal\Core\Language\LanguageInterface;

/**
 * Defines the PlethoraMapAppEntity.
 *
 * @ConfigEntityType(
 *   id = "plethoramap",
 *   label = @Translation("Plethora Map Application"),
 *   handlers = {
 *     "list_builder" = "Drupal\plethoramap\Controller\PlethoraMapAppEntityListBuilder",
 *     "form" = {
 *       "add" = "Drupal\plethoramap\Form\PlethoraMapAppEntity\EditForm",
 *       "edit" = "Drupal\plethoramap\Form\PlethoraMapAppEntity\EditForm",
 *       "delete" = "Drupal\plethoramap\Form\PlethoraMapAppEntity\DeleteForm",
 *     }
 *   },
 *   config_prefix = "plethoramap",
 *   admin_permission = "administer site configuration",
 *   entity_keys = {
 *     "id" = "id",
 *     "label" = "label",
 *     "rooturl" = "rooturl",
 *     "options" = "options",
 *     "dataurl_map" = "dataurl_map",
 *     "dataurl_topicpages" = "dataurl_topicpages",
 *     "dataurl_topicdetail" = "dataurl_topicdetail",
 *     "search_headerimg" = "search_headerimg",
 *     "search_headerimgalt" = "search_headerimgalt",
 *   },
 *   links = {
 *     "edit-form" = "/admin/config/system/plethoramap/apps/{plethoramap}",
 *     "delete-form" = "/admin/config/system/plethoramap/apps/{plethoramap}/delete",
 *   }
 * )
 */
class PlethoraMapAppEntity extends ConfigEntityBase implements PlethoraMapAppEntityInterface {

  /**
   * The plethoramap ID.
   *
   * @var string
   */
  public $id;

  /**
   * The plethoramap label.
   *
   * @var string
   */
  public $label;

  // Your specific configuration property get/set methods go here,
  // implementing the interface.

  /**
   * The plethoramap rooturl.
   *
   * @var string
   */
	public $rooturl;
	public function getRootURL(){
		return $this->rooturl;
	}

  public function setRootURL($value){
    $this->rooturl = $value;
  }



  public $doc_title;
  public function getDocTitle() {
    return $this->doc_title;
  }
  public $html_head;
  public function getHTMLHead() {
    return $this->html_head;
  }
  public $options;
  public function getOptions(){
	  return $this->options;
  }
  public function setOptions($value){
	  $this->options = $value;
  }
  public $dataurl_pins;
  public $dataurl_features;
  public $dataurl_feature;
  public function getDataURL($which){
    switch($which){
      case "features":
        return $this->dataurl_features;
      case "feature":
        return $this->dataurl_feature;
      case "pins":
        return $this->dataurl_pins;
    }
    throw new \Exception("Unknown data url: " . $which);
  }
/*
  public function setDataURL($which, $value){

    switch($which){
      case "map":
        $this->dataurl_map = $value;
      case "topic":
        $this->dataurl_topic = $value;
      case "topicpages":
        $this->dataurl_topicpages = $value;
      case "topicpage":
        $this->dataurl_topicpage = $value;
    }
    throw new \Exception("Unknown data url: " . $which);
  }
*/
  public $apptext = array();
  public function getAppText($which=NULL) {
    $all = $this->apptext ?: array();
    if (!$which) return $all;
    return array_key_exists($which, $all) ? $all[$which] : NULL;
  }



}

