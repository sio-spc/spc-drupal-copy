<?php
/**
 * @file
 * Contains \Drupal\plethoramap\Controller\RoutingController.
 */
namespace Drupal\plethoramap\Controller;

use Drupal\plethoramap\Config\ConfigManager;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpFoundation\JsonResponse;

class RoutingController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  public function content($rooturl, $appid, $configJSON, $docTitle = NULL, $htmlHead = NULL, $langcode = NULL) {


   // dsm($configJSON);
   //$curLangcode = \Drupal::languageManager()->getCurrentLanguage()->getId();
   // dsm($langcode);
    $config = new ConfigManager();
    $app = $config->getApps()[$appid];

//$rooturl = $app->getRootURL(); 
/*
$appText = $app->getAppText(); 
$lang = array(); 
foreach($appText as $value){
  $lang[$value['key']] = $value['value'];
}
$docTitle = $app->getDocTitle(); $htmlHead = $app->getHTMLHead(); 
$c = array(
        'data'=>array(
          'features'=>str_replace('{lang}', $langcode, $app->getDataURL('features')),
          'feature' =>str_replace('{lang}', $langcode, $app->getDataURL('feature')),
          'pins'=>str_replace('{lang}', $langcode, $app->getDataURL('pins')),
        ),
	'options'=>$app->getOptions(),
        'lang'=>$lang,
        'langcode'=>$langcode
      );
$configJSON = \Drupal::service('serializer')->serialize($c, 'json');
*/



   


    $build = array(
      '#type' => 'markup',
      '#markup' => '<div id="plethora-map" class="plethora-map plethora-map-' . $appid . '"><div class="map-loader">' . t('Loading...') . '</div></div>',
    );


    $build['#attached']['html_head'][] = [[
      '#tag' => 'script',
      '#value' => 'window.plethoramapconfig = ' . $configJSON . ';',
    ], 'plethoramapconfig_js'];
    $build['#attached']['library'][] = 'plethoramap/base';


    //dsm($baseTagHREF);
    
    // we have to add a base href tag to the head, for routing
    $baseTagHREF = '/' . ($langcode == 'en' ? '' : $langcode . '/' ) . $rooturl . '/';// . ( $term ? $term  . '/' : '' ) ;
    //dsm('base tag: ' . $baseTagHREF);
    $baseTag = [
      '#tag' => 'base',
      '#attributes' => [
        'href' =>  $baseTagHREF,
      ],
    ];
    $build['#attached']['html_head'][] = [$baseTag, 'base_tag'];
    if ($docTitle){
      //$build['#title'] = $docTitle;
      $metatag_attachments =  &drupal_static('metatag_attachments');
      if (!$metatag_attachments) $metatag_attachments = array();
      $metatag_attachments['#attached']['html_head'][] = [array('#attributes'=>array('content'=>$docTitle)), 'title'];
    }
    if ($htmlHead){
      $xml = simplexml_load_string('<head>' . $htmlHead . '</head>');
      $n = 0;
      foreach($xml->children() as $metaTag){
       // $metaTag['property']
      //  $metaTag['content']
        $n++;
        $atts = $metaTag->attributes();
        $attsArr = array();
        $tagName = $metaTag->getName() . '';
        foreach($atts as $a=>$b){
          $attsArr[$a . ''] = $b . '';
        }
        //dsm($tagName);
        $tagLabel = isset($attsArr['property']) ? $attsArr['property'] : null;
        if (!$tagLabel) $tagLabel = isset($attsArr['name']) ? $attsArr['name'] : null;
        if (!$tagLabel) $tagLabel = 'unknowntag' . $n;
        $build['#attached']['html_head'][] = [array('#tag'=> $tagName, '#attributes'=>$attsArr ), $tagLabel];

      }
      
    }
    return $build;
  }
}
