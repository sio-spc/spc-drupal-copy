import {Injectable} from '@angular/core'; 
import {HttpClient} from '@angular/common/http'; 
import {Feature} from './feature'; 
import {Pin} from './pin';
import {FeatureDetail} from './feature-detail'; 
import {MemberListing} from './member-listing'; 
import {PlethoraMapConfigService} from './plethoramap.config.service';
 
@Injectable() export class DataService {
  constructor(private http: HttpClient,
    private config: PlethoraMapConfigService) { } 

  getPins() {
    return this.http.get<Pin[]>(this.config.getDataURL('pins'));
  }

  getFeatureMemberListings(id) {
    return this.http.get<MemberListing[]>(this.config.getDataURL('feature', id));
  }
  getFeatures() {
    return this.http.get<Feature[]>(this.config.getDataURL('features'));
  }
/*
  public static extractDataSingleItem(data) {
    var results = DataService.extractData(data);
    return results && results.length ? results[0] : results;
  }
*/
  public static getCleanURLName(str: string): string {
    if (str) {
      str = decodeURIComponent(str);
      //console.log("decoded: " + str)
      var notInternationalAlphanumeric = /[^a-zA-Z0-9\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]/g;// [^a-zA-Z0-9_ÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüŸ¡¿çÇŒœßØøÅåÆæÞþÐð]/g;
      str = str.replace(notInternationalAlphanumeric, "-");// str.replace(/[^a-zA-Z0-9_]/g, "-");
      str = str.replace(/-+/g, "-");
      str = str.replace(/-$/, "");
    }
    return str;
  }
//  private static trim(value) {
//    return value.replace(/^\s+|\s+$/g, ''); // you could use .trim, but it's not going to work in IE<9
//  };
  public static extractData(data) {
    //console.log(data);
    var results = data || [];
    var r;
    for(var i=0; i<results.length; i++){
      r = results[i];
      if (r.iso) r.urlName = DataService.getCleanURLName(r.urlName || r.name || r.iso);
      var possibleNumbers = ["members", "latitude", "longitude", "radius","fontSize", "iconSize", "strokeWidth"];
      for (var prop of possibleNumbers) {
          if (typeof r[prop] == "string") r[prop] = parseFloat(r[prop]);
      }
      var possibleJSON = ["geojson","zoomBounds"];
      var jQuery = window['jQuery'];
      for (var prop of possibleJSON){
         if(r[prop] && typeof r[prop] == "string") {
		r[prop] = jQuery.parseJSON(decodeURIComponent(r[prop]).split('&quot;').join('"'));
		console.log("parsed some geojson: ");
		console.log(r[prop]);
	 }
      }
        /*
      if (typeof r.members == "string") r.members = parseFloat(r.members);
      if (typeof r.latitude == "string")  r.latitude = parseFloat(r.latitude);
      if (typeof r.longitude == "string")  r.longitude = parseFloat(r.longitude);
      if (typeof r.radius == "string") r.radius = parseFloat(r.radius);
      if (typeof r.zoomPointRadius == "string") r.zoomPointRadius = parseFloat(r.zoomPointRadius);
      if (typeof r.zoomPointLatitude == "string") r.zoomPointLatitude = parseFloat(r.zoomPointLatitude);
      if (typeof r.zoomPointLongitude == "string") r.zoomPointLongitude = parseFloat(r.zoomPointLongitude);
      if (typeof r.fontSize == "string") r.fontSize = parseFloat(r.fontSize);
      if (typeof r.iconSize == "string") r.iconSize = parseFloat(r.iconSize);
      if (typeof r.strokeWidth == "string") r.strokeWidth = parseFloat(r.strokeWidth); */
    }
    return results;
  }
  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    let errMsg = error.message || this.config.getLang("serverError");
    console.error(errMsg);
    return Promise.reject(errMsg);
  }
}
