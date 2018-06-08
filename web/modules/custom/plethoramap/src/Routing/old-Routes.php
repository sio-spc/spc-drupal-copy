<?php
/**
 * @file
 * Contains \Drupal\plethoramap\Routing\Routes.
 */
namespace Drupal\plethoramap\Routing;

use Drupal\plethoramap\Config\ConfigManager;
use Symfony\Component\Routing\Route;
use Drupal\Core\Language\Language;

class Routes {


  /**
   * {@inheritdoc}
   */
  public function routes() {
    $routes = array();
    // Declares a single route under the name based on setting 'rooturl'.
    // Returns an array of Route objects. 
    $config = new ConfigManager();
    $apps = $config->getApps();
    //$langcodes = \Drupal::languageManager()->getLanguages();
    
    foreach($apps as $key=>$app){
     //foreach($langcodes as $langcode){
     //if(!$langcode) $langcode = 'en';
      //$app = $app->getStringTranslation($langcode);
      $rooturl = $app->getRootURL();
      $appid = $app->id();
      $path = '/' . $rooturl . '/{a}/{b}/{c}/{d}';

      $appText = $app->getAppText();
      $lang = array();
      foreach($appText as $value){
        $lang[$value['key']] = $value['value'];
      }
      
      $docTitle = $app->getDocTitle();
      $htmlHead = $app->getHTMLHead();

      $c = array(
        'data'=>array(
          'features'=>$app->getDataURL('features'),
          'feature' => $app->getDataURL('feature'),
          'pins'=>$app->getDataURL('pins'),
        ), 
		'options'=>$app->getOptions(),
        'lang'=>$lang
      );
      $configJSON = \Drupal::service('serializer')->serialize($c, 'json');
      $routes['plethoramap.mapapp.' . $appid] = new Route(
        // Path to attach this route to:
        $path,
        // Route defaults:
        array(
          '_controller' => '\Drupal\plethoramap\Controller\RoutingController::content',
          'appid' => $appid,
          'rooturl' => $rooturl,
          'configJSON' => $configJSON,
          'a' => '',
          'b' => '',
          'c' => '',
          'd' => '',
          'htmlHead' => $htmlHead,
          'docTitle' => $docTitle,
        ),
        // Route requirements:
        array(
          '_permission'  => 'access content',
        )
      );
     //}
    }
    return $routes;
  }

}
