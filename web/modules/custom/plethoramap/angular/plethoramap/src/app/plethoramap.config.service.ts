import {Injectable} from '@angular/core'; 
import { Feature } from './feature'; 
import { Pin } from './pin';
import { MapAPI } from './map-api'; 
@Injectable() export class PlethoraMapConfigService {
  constructor() {
   this.setSettings(window['plethoramapconfig']);
  }
  private _lang = {
    feature: 'Feature',
    features: 'Features',
    pins: 'Pins',
    selectFeaturePlaceholder: 'Search {{features}}...',
    zoomedInTooltipSuffix: " (click to return to full map view)",
    featureNotFoundMessage: 'Plethora does not yet have any {{members}} in the selected country ({{selectedCountry}})',
    members: 'Members',
    member: 'Member',
    documentTitle: 'Member Map ' + document.title,
    clearButtonLabel: 'Clear Text',
    loadingListings: 'Loading members...',
    noMembersTooltipSuffix: ' (no members)',
    autocompleteNoResultsMessage: 'No {{features}} with {{members}} found matching "{{query}}"',
    autocompleteNoResultsMessageMobile: 'No matching {{features}} found',
    submitButtonLabel: 'GO',
    autocompleteInstructions:'',
    autocompleteInstructionsMobile:'',
  };
  public query: string = '';
  public selectedItem: string = '';
  private _features: Feature[];
  public set features(newFeatures:Feature[]){
    this._features = newFeatures;
    if (this._features){
      for (let callback of this.eventListeners['features-set']){
        callback();
      }
      this.eventListeners['features-set'] = [];
    }
  }
 public get features(): Feature[]{
    return this._features;
  }

  private _pins: Pin[];
  public set pins(newPins:Pin[]){
    this._pins = newPins;
    if (this._pins){
      for (let callback of this.eventListeners['pins-set']){
        callback();
      }
      this.eventListeners['pins-set'] = [];
    }
  }
  public get pins(): Pin[]{
    return this._pins;
  }
  getAutocompleteLabel(feature: Feature) {
    if (feature) return feature.name + ' (' + feature.iso + ') ' + (feature.description ? feature.description : '');
    return '';
  }
  public mapapi: MapAPI;
  public getSelectedFeature(urlName:string): Feature{
    if (!this.features){
      return null;
    }
    for (let feature of this.features){
      if (feature.urlName === urlName){
        return feature;
      }
    }
    return null;
  }
  public setSettings(settings: any) {
    if (settings) {
	  if(!settings['data'] || !settings['lang']) return console.error("settings must contain key 'data' and 'lang'");
	  if (settings['lang']){
		for(var key in settings['lang']){
		  this._lang[key] = settings['lang'][key];
		}
	  }
	  if(settings['data']){
		  this._dataURLS = settings['data'];
		  this._showAdminLinks = window['jQuery']('body').hasClass('user-logged-in');//settings["showAdminLinks"];
	  }
	  if(settings['options']){
		  this._options = settings['options'];
	  }
    }
    else {
      console.error("settings should be provided, and must contain key 'data' and 'lang'");
    }
  }
  private _showAdminLinks: boolean = false;
  private _langProcessed = { // a caching mechanism so we don't have to keep replacing tokens every time getLang is called
  }
  private _dataURLS = {
    'feature': '', // '/map-services/get-map-list'; // URL to web api
    'features': '', // URL to web api
    'pins':'',
  };
	private _options:string;
	  private _getParameterByName(name:string, url:string):string {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	 }
 
	private _isSet(val:string):boolean {
        return !(val === null || typeof val === 'undefined');
	}
    private _getQ = function(f:string, def:string=null){
       var val:string = this._getParameterByName(f);
	   //if(f == "translateX") console.log("translateX, _getQ from url: " +val); 
	   if(!this._isSet(val)) {
	        if(this._options) {
				val = this._getParameterByName(f, "/?" + this._options);
				//if(f == "translateX") console.log("translateX, _getQ from options string: " +val); 
			}
			if(!this._isSet(val)) val = def;
	  }
	   return val;
    };
    private _getQNumber = function(f:string, def:number = 0):number {
        var s = this._getQ(f, null);
        if (s) return parseFloat(s);
        return def;
    }
    private _getQColor = function(f:string,def:string=null):any{
       var val = this._getQ(f, def);
       if(val && val.indexOf('x') == 0) val = val.replace('x', '#');
       return val;
    };
    private _getQBoolean = function(f:string, def:boolean=false):any{
        var q = this._getQ(f);
        if (q) return q == 'true';
        return def;
    };
  public getOption(which:string, def:any=null):any{
	switch(which){
        case 'debug':
        case 'showFeatureTooltip':
        case 'showFeatureTooltipForNonMembers':
        case 'showFeatureTooltipNumMembers':
        case 'drawEquator':
        case 'drawGraticule':
        case 'zoomInOnFeatureClick':
        case 'wrap':
			return this._getQBoolean(which, def);
		case 'cssFeatureColor':
		case 'cssFeatureBorderColor':
		case 'cssFeatureBorderColor':
		case 'cssFeatureHighlightedColor':
		case 'cssFeatureHighlightedBorderColor':
		case 'cssFeatureHoverColor':
		case 'cssFeatureHoverBorderColor':
		case 'cssFeatureHoverHighlightedColor':
		case 'cssFeatureHoverHighlightedBorderColor':
		case 'cssBackgroundColor':
		case 'cssFeatureActiveHighlightedColor':
        case 'cssFeatureActiveHighlightedBorderColor':
        case 'cssFeatureActiveHighlightedHoverColor':
        case 'cssFeatureActiveHighlightedHoverBorderColor':
			return this._getQColor(which, def);
		case 'translateX':
		case 'translateY':
        case 'scale':
        case 'zoomInSpeed':
        case 'zoomOutSpeed':
        case 'minScale':
        case 'maxScale':
			return this._getQNumber(which, def);
		default:
			return this._getQ(which, def);
	}
  }
  private eventListeners = {'features-set':[],'pins-set':[]};
  public addEventListener(type:string, callback:any){
    this.eventListeners[type].push(callback);
  }
  public getEditNodeURL(id): string {
    return '/node/' + id + '/edit?destination=' + encodeURIComponent(this.returnDestination);
  }
  private get returnDestination(): string {
    return window.location.pathname + window.location.search + window.location.hash;
  }
  public getLang(key:string, defaultValue:string='', extraTokens=null):string{
    if (!this._langProcessed[key]) {
      var result = this._lang[key] || defaultValue || key;
      var tokens = this._lang;
      result = this.replaceTokens(result, tokens);
      this._langProcessed[key] = result;
    }
    var s = this._langProcessed[key];
    if (extraTokens){
      s = this.replaceTokens(s, extraTokens);
    }
    return s;
  }
  private replaceTokens(s:string, tokens, maxIterations=5):string{
    if (!tokens || !s) return s;
    while (maxIterations-- && s.indexOf("{{") > -1) {
      for (var i in tokens) {
        s = s.replace(new RegExp("{{" + i + "}}", "gi"), tokens[i]);
      }
    }
    return s;
  }
  
  public getDataURL(which:string, extraParams=null):string{
    switch(which){
      case "pins":
      case "features":
      case "feature":
        var url = this._dataURLS[which] || '';
        if (!url) {
          console.warn("No data for data url key: " + which);
          return null;
        }
        var suff = '';
        if (extraParams){
          suff = '';
          var extraParamsArr = extraParams.constructor === Array ? extraParams : [extraParams];
          if (url.indexOf('{0}') !== -1) {
            for (let n=0;n<=extraParamsArr.length;n++) {
                url = url.split('{' + n + '}').join(extraParamsArr[n]);
            }
          }
          else {
            suff = '/' + extraParamsArr.join('/');
          }
/*
          suff = '/';
          if (extraParams.constructor !== Array){
            suff = suff + extraParams;
          }
          else {
            suff = suff + extraParams.join('/');
          }
*/
        }
        return url + suff;
    }
    console.error("Unknown data url key: " + which);
    return null;
  }
  public get showAdminLinks():boolean{
    return this._showAdminLinks;
  }
}
