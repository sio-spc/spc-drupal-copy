<?php
/**
 * @file
 * Contains \Drupal\plethoramap\Config\ConfigManager.
 */
namespace Drupal\plethoramap\Config;


class ConfigManager {

  /**
   * {@inheritdoc}
   */
  public function __construct() {
    $this->_config = \Drupal::service('config.factory')->getEditable('plethoramap.settings'); // \Drupal::config('plethoramap.settings');
  }
  private $_config;

  public function anyApps($rebuild=FALSE){
    return COUNT($this->getApps()) > 0;
  }
  public function getApps($rebuild=FALSE){
    static $apps;
    if (!$apps || $rebuild){
      $appIds = \Drupal::entityQuery('plethoramap')->execute();
      $apps = entity_load_multiple('plethoramap', $appIds);
    }
    return $apps;
  }

  public function __set($name, $value)
  {

  }


  // http://php.net/manual/en/language.oop5.overloading.php#object.get
  public function __get($name) 
  {

      $trace = debug_backtrace();
      trigger_error(
          'Undefined property via __get(): ' . $name .
          ' in ' . $trace[0]['file'] .
          ' on line ' . $trace[0]['line'],
          E_USER_NOTICE);
      return null;
  }

  private function _sanitizeRootURL($value){
    return $value;
  }

}