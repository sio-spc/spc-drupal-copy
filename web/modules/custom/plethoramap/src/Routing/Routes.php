<?php
/**
 * @file
 * Contains \Drupal\plethoramap\Routing\Routes.
 */
namespace Drupal\plethoramap\Routing;

use Drupal\plethoramap\Config\ConfigManager;
use Symfony\Component\Routing\Route;
use Drupal\Core\Language\Language;
use Drupal\Core\Language\LanguageInterface;

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
    $langcodes = \Drupal::languageManager()->getLanguages();
    $original_language = \Drupal::languageManager()->getConfigOverrideLanguage();    
    foreach($apps as $key=>$app){
     foreach($langcodes as $langcode=>$language){
      \Drupal::languageManager()->setConfigOverrideLanguage($language);
//dsm("langcode: " . $langcode);
      $app = $config->getApps(true)[$key];
      if(!$langcode) $langcode = 'en';
      $rooturl = $app->getRootURL();
//dsm("rooturl: " . $rooturl);
      $appid = $app->id();
//dsm("appid: " . $appid);
      $path = '/' . $rooturl . '/{a}/{b}/{c}/{d}';
//dsm("path: " . $path);

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

      $routes['plethoramap.mapapp.' . $appid . '.' . $langcode] = new Route(
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
          'langcode' => $langcode
        ),
        // Route requirements:
        array(
          '_permission'  => 'access content',
        )
      );
     }
    }
    \Drupal::languageManager()->setConfigOverrideLanguage($original_language);
    return $routes;
  }

}
