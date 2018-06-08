import {Component, Input, OnInit} from '@angular/core'; 
import { ActivatedRoute, Params } from '@angular/router'; 
import { DataService } from './data.service'; 
import {Feature} from './feature'; 
import {FeatureDetail} from './feature-detail'; 
import {MemberListing} from './member-listing'; 
import {Location} from './location';
import { PlethoraTheme } from './plethora-theme'; 
import { MapAPI } from './map-api'; 
import {PlethoraMapConfigService} from './plethoramap.config.service'; 
import {Subscription} from 'rxjs/Subscription';
@Component({
  selector: 'map-feature-detail',
  moduleId: module.id,
  templateUrl: './feature-detail.component.html'
})
export class FeatureDetailComponent implements OnInit {
  errorMessage: string;
  private _activateTransitionDuration = 200;
  private _deactivateTransitionDuration = 200;
  private _setBackgroundImageTransitionDuration = 600;
  constructor(
    private _dataService: DataService,
    private _plethoraTheme: PlethoraTheme,
    private _route: ActivatedRoute,
    private config: PlethoraMapConfigService) {
    for (var key in this.lang) {
      var configKey = this.lang[key] || key;
      this.lang[key] = this.config.getLang(configKey);
    }
  }
  lang: any = {
    featureNotFoundMessage:'',
    loadingListings: '',
  };
  get showAdminLinks():boolean {
    return this.config.showAdminLinks;
  }
  listings: MemberListing[];
  feature: Feature;
  featureNotFound: boolean = false;
  loading: boolean = true;
  private sub: Subscription;
  ngOnInit() {
    console.log("feature-detail.component.ts: ngOnInit()");
    //let urlName = this._router.currentInstruction.component.params['urlName'];
    var me = this;

     if (!me.config.features) {
        console.log("feature-detail ngOnInit: waiting for features to load....");
        me.config.addEventListener('features-set', function() { me.ngOnInit() });
        return;
      }
    // me.config.mapapi.clearGeoJSON();
    this.sub = this._route.params.subscribe((params: Params) => {
      console.log("feature-detail, params loaded:");
      console.log(params);
      var urlName = decodeURIComponent(params['urlName']);
      console.log("urlName: " + urlName); 
      var features = me.config.features;
      var niceUrlName = urlName.split('-').join(' ');
      document.title = ' | ' + niceUrlName + ' ' + me.origDocumentTitle;
      window['jQuery'](".plethora-map-feature-detail").hide();//.slideUp().stop(true, true);
      var selectedFeature: Feature = me.config.getSelectedFeature(urlName);
      if (selectedFeature){
          me.feature = selectedFeature;
          
          if (me.feature.name) {
            document.title = me.feature.name + ' | ' + me.origDocumentTitle;
          }
          // we are getting both id and urlName, so we can switch back to a "clean url" version of this app more readily in the future, if desired, that does not include the actual 'id' of the content
          me._dataService.getFeatureMemberListings(selectedFeature.id).subscribe(
            listings => { me.setListings(DataService.extractData(listings)); }
          );
          me.config.query = me.config.getAutocompleteLabel(me.feature);
          console.log("calling zoomInOnFeature with callback");
          var onZoomedIn = function(){
             me.zoomedIn = true;
             window['jQuery'](".plethora-map-feature-detail").hide();//.slideUp().stop(true, true);
             me.tryShowNow();
          }
          me.config.mapapi.zoomInOnFeature(me.feature.iso, function(d){
            console.log("feaure-detail.component.ts: zoomed in complete (if feature found) d exists:" + !!d);
            if (!d) {
	      me.zoomInOnISOFailed = true;
              me.tryZoomInOnLocations(onZoomedIn);
            }
            else onZoomedIn();
          });
                   
      }
      else {
        me.featureNotFound = true;
        me.lang.featureNotFoundMessage = me.config.getLang('featureNotFoundMessage', me.lang.featureNotFoundMessage, { 'selectedCountry': niceUrlName })
      }
    });
    
    
  }
  ngOnDestroy() {
    if(this.sub){
      this.sub.unsubscribe();
      this.sub = null;
    }


    var me = this;
    if (me.origDocumentTitle) {
        document.title = me.origDocumentTitle;
    }
    me.config.mapapi.zoomOut();
    me.config.selectedItem = "";
    me.config.query = "";
  }
  tryZoomInOnLocations(onComplete) {
     var me = this;
     if(this.loading) {
         setTimeout(function(){
            me.tryZoomInOnLocations(onComplete);
         }, 50);
         return;
     }
     console.log("tryZoomInOnLocations()");
     var locations:Location[] = [];
     if(this.listings){
       for(let listing of this.listings){
          locations = locations.concat(this.stringToLocations(listing.pins));
       }
     }
     if(locations.length){
       console.log("tryZoomInOnLocations: going to try to zoom in on the following locations:");
       console.log(locations);
       me.config.mapapi.zoomInOnLocations(locations, function(){
          onComplete();
       });
     }
     else {
       onComplete();
     }
     
  }
  stringToLocations(str:string):Location[]{
    var arr:Location[] = [];
    if(!str) return arr;
    var locStrArr = str.split('|');
    for(let locStr of locStrArr){
      arr.push(this.stringToLocation(locStr));
    }
    return arr;
  }
  stringToLocation(str:string):Location{
    var a = str.split(':');
    var loc = new Location();
    loc.latitude = parseFloat(a[0]);
    loc.longitude = parseFloat(a[1]);
    return loc;
  }
  zoomInOnISOFailed: boolean = false;
  zoomedIn: boolean = false;
   origDocumentTitle: string = document.title;
  setListings(listings: MemberListing[]) {
    this.listings = listings;
    this.loading = false;
    window['jQuery'](".plethora-map-feature-detail").hide();//.slideUp().stop(true, true);
    this.config.mapapi.clearGeoJSON();
    for(var listing of listings){
      console.log("setListings, listing:");
      console.log(listing);
      if(listing.geojson){
//really we should have a "feature detail" object that just has extra data for when you zoom in not related to the "members" but for now there is a one to one relationship between members and countries.
        this.config.mapapi.addGeoJSON(this.feature.iso, listing.geojson);
      }
    }
    this.tryShowNow();
  }
  tryShowNow() {
    if (this.zoomedIn && !this.loading) window['jQuery'](".plethora-map-feature-detail").show();//.slideUp().stop(true, true).slideDown("slow");
  }
  goBack() {
    window.history.back();
  }
  myTrim(x: string): string {
    if (!x) return x;
    return x.replace(/^\s+|\s+$/gm, '');
  }
/*
  routerOnActivate(next: ComponentInstruction, prev: ComponentInstruction) {
    console.log("feature-detail.component.ts: routerOnActivate()");
    return new Promise((res, rej) => res(1));
    // return new Promise((res, rej) => setTimeout(() => res(1), this._deactivateTransitionDuration));
  }
  routerOnDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
    console.log("feature-detail.component.ts: routerOnDeactivate()");
    var me = this;
    if (me.origDocumentTitle) {
      document.title = me.origDocumentTitle;
    }
    me.config.mapapi.zoomOut();
    me.config.selectedItem = "";
    me.config.query = "";
    return new Promise((res, rej) => res(1));
    // return new Promise((res, rej) => setTimeout(() => res(1), this._deactivateTransitionDuration));
  }
*/

}
