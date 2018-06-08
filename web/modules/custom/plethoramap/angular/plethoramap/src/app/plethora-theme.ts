import {Injectable} from '@angular/core'; 
@Injectable() export class PlethoraTheme {
  constructor () {
  }
  themeName:string = "kyanite";
  getFunction(functionName:string) {
    if(window[this.themeName] && typeof window[this.themeName][functionName] === "function") return window[this.themeName][functionName];
	return function(){};
  }
  setBackgroundImage(url:string, speed=null){
    this.getFunction('setBackgroundImage')(url, speed);
  }
  setColorScheme(scheme:string){
    this.getFunction('setColorScheme')(scheme);
  }
  getColorScheme() {
    return this.getFunction('getColorScheme')();
  }
  setContentOverlay(color: string) {
    this.getFunction('setContentOverlay')(color);
  }
  showPage(duration: number=null) {
    this.getFunction('showPage')(duration);
  }
  hidePage(duration: number=null) {
    this.getFunction('hidePage')(duration);
  }
  showBanner(duration: number=null) {
    this.getFunction('showBanner')(duration);
  }
  hideBanner(duration: number=null) {
    this.getFunction('hideBanner')(duration);
  }
  fixHeader() {
    this.getFunction('fixHeader')();
  }
  unfixHeader() {
    this.getFunction('unfixHeader')();
  }
}
