﻿import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from './data.service';
import { Feature } from './feature';
import { Location } from './location';
import { Pin } from './pin';
import { MapAPI } from './map-api';
import { PlethoraTheme } from './plethora-theme';
import { PlethoraMapConfigService } from './plethoramap.config.service';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import * as d3GeoProjection from 'd3-geo-projection';
import * as topojson from 'topojson';

@Component({
    selector: '#plethora-map',
    moduleId: module.id,
    templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
    constructor(private config: PlethoraMapConfigService, private _dataService: DataService, private _router: Router, private _plethoraTheme: PlethoraTheme) {
        console.log("AppComponent constructor()");
        for (var key in this.lang) {
            var configKey = this.lang[key] || key;
            this.lang[key] = this.config.getLang(configKey);
        }
        document.title = this.config.getLang('documentTitle');
    }
    lang: any = {
        'selectFeaturePlaceholder': '',
        'zoomedInTooltipSuffix': '',
        'member': '',
        'members': '',
        'documentTitle': '',
        'clearButtonLabel': '',
        'noMembersTooltipSuffix': '',
        'autocompleteNoResultsMessage': '',
        'autocompleteNoResultsMessageMobile': '',
        'submitButtonLabel': '',
        'autocompleteInstructions':'',
        'autocompleteInstructionsMobile':'',
    };
    get autocompleteInstructions():string {
        return this.isMobile ? this.lang.autocompleteInstructionsMobile : this.lang.autocompleteInstructions;
    };
    debug: boolean = false;
    featuresByISO: any = {};
    featuresByAutocompleteLabel: any = {};
    featureOptionsForAutocomplete: string[] = [];
    //featureOptions: { label: string, value: string }[];
    _features: Feature[];
    get features(): Feature[] {
        return this._features;
    }
    set features(value: Feature[]) {
        //console.log("setting features: ");
        //console.log(value);
        this._features = value;
        //this.featureOptions = [];
        var featureOptionsForAutocomplete = [];
        var featuresByAutocompleteLabel = {};
        var featuresByISO = {};
        if (this._features) {
            for (let feature of this._features) {
                var suffix = '';
                //suffix += (feature.members ? " (" + feature.members + ' ' + (feature.members == 1 ? this.lang.member : this.lang.members) + ")" : "");
                //this.featureOptions.push({ label: feature.name + suffix, value: feature.iso });
                var autocompleteLabel = this.config.getAutocompleteLabel(feature);
                featureOptionsForAutocomplete.push(autocompleteLabel);
                featuresByAutocompleteLabel[autocompleteLabel] = feature;
                //console.log("setting feature-by-iso: " + feature.iso);
                if (feature.iso) featuresByISO[feature.iso] = feature;
            }
            this.config.mapapi.setHighlightedFeatures(this._features);
        }
        //the following must be set at the end to avoid issues:
        this.featureOptionsForAutocomplete = featureOptionsForAutocomplete;
        this.featuresByAutocompleteLabel = featuresByAutocompleteLabel;
        this.featuresByISO = featuresByISO;
        this.config.features = this._features;
    }

    _pins: Pin[];
    get pins(): Pin[] {
        return this._pins;
    }
    set pins(pins: Pin[]) {
        console.log("pins have been set:");
        console.log(pins);
        this._pins = pins;
        this.config.pins = pins;
        this.config.mapapi.setPins(pins);
    }

    set query(value: string) {
        this.config.query = value;
    }
    get query(): string {
        return this.config.query;
    }
    set selectedItem(value: string) {
        this.config.selectedItem = value;
    }
    get selectedItem(): string {
        return this.config.selectedItem;
    }
    get translateX(): number {
        return this.config.mapapi ? this.config.mapapi.getTranslateX() : 0;
    }
    get translateY(): number {
        return this.config.mapapi ? this.config.mapapi.getTranslateY() : 0;
    }
    get scale(): number {
        return this.config.mapapi ? this.config.mapapi.getScale() : 1;
    }
    get isMobile():boolean {
        return  window['jQuery']('#plethora-map-hide-on-mobile').css("display") === "none";
    }
    errorMessage: string;
    mapContainerId: string = 'plethora-map-container'; // binding id attr to this breaks stuff
    ngOnInit() {
        console.log("app.component.ts: ngOnInit()");
        var me = this;
        this.debug = me.config.getOption('debug', false);
        this._plethoraTheme.unfixHeader();
        var featureHighlightClass = me.config.getOption('featureHighlightClass', 'highlighted');
        var tx: number = me.config.getOption('translateX', 0);
        var ty: number = me.config.getOption('translateY', 0);
        var s: number = me.config.getOption('scale', 1);
        /*
      console.log("-------------------");
      console.log("-------------------");
      console.log("-------------------");
      console.log("-------------------");
      console.log("tx: ");
      console.log(tx);
      console.log("ty: ");
      console.log(ty);
      console.log("s: ");
      console.log(s);
      console.log("debug: ");
      console.log(this.debug);
        */
        var isMobile = function(){ return me.isMobile; };
        //var defaultMapURL =  isMobile() ? "/modules/custom/plethoramap/exampledata/gistfile1.topojson" : "/modules/custom/plethoramap/exampledata/world-topo-with-iso-min.json";
        var defaultMapURL = "/modules/custom/plethoramap/exampledata/world-topo-with-iso-min.json";
        var layout = me.config.getOption('layout', 'columns');
        window['jQuery']('body').attr('data-plethoramap-layout', layout);
        this.config.mapapi = this.initD3(d3,
            {
                debug: this.debug,
                getFeature: function (iso: string): Feature { return me.getFeature(iso); },
                translateX: tx,
                translateY: ty,
                scale: s,
                mapURL: me.config.getOption("mapURL", defaultMapURL),
                projection: me.config.getOption("projection", "cylindricalEqualArea"),
                freeZoom: me.config.getOption("freeZoom", true),
                featureName: 'countries',
                onZoomedIn: function (feature: any) {
                    console.log("onZoomedIn()");
                    console.log(feature);
                },
                onZoomedOut: function () {
                    console.log("onZoomedOut()");
                },
                onFeatureChange: function (d: any) {
                    console.log("onFeatureChange() d:");
                    console.log(d);
                    if (d) {
                        var isoOb = d.iso ? d : (d.properties && d.properties.iso ? d.properties : null);
                        if (isoOb) me.gotoFeatureDetail(isoOb.iso, isoOb.name || isoOb.iso);
                    }
                    else me.gotoDashboard();
                },
                csv: me.config.getOption('csvURL') ? {
                    url: me.config.getOption('csvURL'),
                    latitudeField: me.config.getOption('csvLatitudeField', 'latitude'), //'CapitalLatitude',
                    longitudeField: me.config.getOption('csvLongitudeField', 'longitude'),// 'CapitalLongitude',
                    nameField: me.config.getOption('csvNameField', 'name') //'CapitalName',
                } : false,
                zoomInSpeed: me.config.getOption("zoomInSpeed", 750),
                zoomOutSpeed: me.config.getOption("zoomOutSpeed", 750),
                lang: this.lang,
                featureNameField: 'name',
                featureTooltipField: me.config.getOption('featureTooltipField', 'name'),
                featureTooltipFunction: function (d: any, defaultTooltip: string, defaultTooltipSuffix: string) {
                    var iso = d.iso ? d.iso : (d.properties ? d.properties.iso : null);
                    var feature = iso ? me.getFeature(d.properties.iso) : null;
                    if (feature) {
                       var numMembersSuffix = me.config.getOption('showFeatureTooltipNumMembers', false) ? ' (' + feature.members + ' ' + (feature.members == 1 ? me.lang.member : me.lang.members) + ')' : '';
                       return feature.name + numMembersSuffix + defaultTooltipSuffix;
                    }
                    else return me.config.getOption('showFeatureTooltipForNonMembers', false) ? defaultTooltip + this.lang.noMembersTooltipSuffix : '';
                    //return defaultTooltip;
                },
                featureHighlightClass: featureHighlightClass,
                showFeatureTooltip: me.config.getOption("showFeatureTooltip", true),
                //featureSelectId: this.featureSelectId,
                containerId: this.mapContainerId,
                drawEquator: me.config.getOption("drawEquator", false),
                drawGraticule: me.config.getOption("drawGraticule", false),
                zoomInOnFeatureClick: me.config.getOption("zoomInOnFeatureClick", true),
                zoomInOnFeatureClickRestrictClass: me.config.getOption("zoomInOnFeatureClickRestrictClass", featureHighlightClass),
                wrap: me.config.getOption("wrap", true),
                addBackground: me.config.getOption("addBackground", true),
                minScale: me.config.getOption("minScale", 1),
                maxScale: me.config.getOption("maxScale", 20),
                isMobile: isMobile,
                layout: layout,
                customStyles: {
                    'feature-default-fill': me.config.getOption('cssFeatureColor'),
                    'feature-default-stroke': me.config.getOption('cssFeatureBorderColor'),
                    'feature-default-stroke-width': me.config.getOption('cssFeatureBorderWidth'),
                    'feature-highlighted-fill': me.config.getOption('cssFeatureHighlightedColor'),
                    'feature-highlighted-stroke': me.config.getOption('cssFeatureHighlightedBorderColor'),
                    'feature-highlighted-stroke-width': me.config.getOption('cssFeatureHighlightedBorderWidth'),
                    'feature-hover-fill': me.config.getOption('cssFeatureHoverColor'),
                    'feature-hover-stroke': me.config.getOption('cssFeatureHoverBorderColor'),
                    'feature-hover-stroke-width': me.config.getOption('cssFeatureHoverBorderWidth'),
                    'feature-hoverhighlighted-fill': me.config.getOption('cssFeatureHoverHighlightedColor'),
                    'feature-hoverhighlighted-stroke': me.config.getOption('cssFeatureHoverHighlightedBorderColor'),
                    'feature-hoverhighlighted-stroke-width': me.config.getOption('cssFeatureHoverHighlightedBorderWidth'),
                    'feature-activehighlighted-fill': me.config.getOption('cssFeatureActiveHighlightedColor'),
                    'feature-activehighlighted-stroke': me.config.getOption('cssFeatureActiveHighlightedBorderColor'),
                    'feature-activehighlighted-stroke-width': me.config.getOption('cssFeatureActiveHighlightedBorderWidth'),
                    'feature-activehighlightedhover-fill': me.config.getOption('cssFeatureActiveHighlightedHoverColor'),
                    'feature-activehighlightedhover-stroke': me.config.getOption('cssFeatureActiveHighlightedHoverBorderColor'),
                    'feature-activehighlightedhover-stroke-width': me.config.getOption('cssFeatureActiveHighlightedHoverBorderWidth'),
                    'background-color': me.config.getOption('cssBackgroundColor')
                }
                //autoAddFeatureSelectOptions:false
            }
        );
        this.getData();
    }
    autocompleteCleared(event) {
    }
    autocompleteValueChange(event) {
        console.log("autocompleteValueChange()");
        console.log(event);
        var autocompleteLabel = event.value;
        if (autocompleteLabel) {
            var feature: Feature = this.featuresByAutocompleteLabel[autocompleteLabel];
            if (!feature) console.error("could not find feature by label: " + autocompleteLabel);
            //this.config.mapapi.zoomInOnFeature(feature.iso);
            this.gotoFeatureDetail(feature.iso, feature.name);
        }
        else {
            this.gotoDashboard();
            var me = this;
            //setTimeout(function() {
            // this.config.mapapi.zoomOut();
            // });
        }
    }
    gotoDashboard() {
        var me = this;
        console.log("gotoDashboard");
        me.config.mapapi.zoomOut();
        me.config.query = "";
        this._router.navigate(['/']);
    }
    getFeature(iso: string): Feature {
        if (!this.features) return null;
        if (!iso) return null;
        var feature: Feature = this.featuresByISO[iso];
        return feature;
    }
    gotoFeatureDetail(iso: string, name: string) {
        console.log("gotoFeatureDetail(" + iso + ", " + name + ")");
        var me = this;
        if (!me.features) {
            console.log("gotoFeatureDetails: delaying until ready");
            //delay until later...
            setTimeout(function () {
                me.gotoFeatureDetail(iso, name);
            }, 50);
            return;
        }
        var feature = me.getFeature(iso);
        if (!feature) {
            console.log("failed to find feature for iso=" + iso);
            // console.log(this.features);
            console.log(me.featuresByISO);
            me.query = '';
            me.selectedItem = me.query;
            var featureName = DataService.getCleanURLName(name);
            console.log("navigating to featureName = " + featureName);
            me._router.navigate(['/' + featureName]);
            //me._router.navigate(['detail/:urlName', { urlName: DataService.getCleanURLName(name) }]);
        }
        else {
            me.query = me.config.getAutocompleteLabel(feature);
            console.log("query should be good now: " + me.query);
            me.selectedItem = me.query;
            console.log("navigating to feature.urlName = " + feature.urlName);
            me._router.navigate(['/' + feature.urlName]);
            //me._router.navigate(['detail/:urlName', { urlName: feature.urlName }]);
        }
    }
    getData() {
        this._dataService.getFeatures().subscribe(features => {
            this.features = DataService.extractData(features);
        });
        this._dataService.getPins().subscribe(pins => {
            this.pins = DataService.extractData(pins);
        });
    }
    //////
    initD3(d3: any, config: {
        debug: boolean,
        getFeature: (iso: string) => Feature,
        translateX: number,
        translateY: number,
        scale: number,
        mapURL: string,
        projection: string,
        freeZoom: boolean,
        featureName: string,
        onZoomedIn: any,
        onZoomedOut: any,
        onFeatureChange: any,
        csv: any,
        zoomInSpeed: number,
        zoomOutSpeed: number,
        lang: any,
        featureNameField: string,
        featureTooltipField: string,
        featureTooltipFunction: any,
        showFeatureTooltip: boolean,
        //featureSelectId:string,
        containerId: string,
        drawEquator: boolean,
        drawGraticule: boolean,
        featureHighlightClass: string,
        zoomInOnFeatureClick: boolean,
        zoomInOnFeatureClickRestrictClass: string,
        wrap: boolean,
        addBackground: boolean,
        minScale: number,
        maxScale: number,
        customStyles: any,
        isMobile: any,
        layout:string,
        //autoAddFeatureSelectOptions:boolean
    }): MapAPI {

        var lastTranslate = null,
            lastScale: number,
            translateBeforeFeatureZoom,
            scaleBeforeFeatureZoom,
            zoom = null,
            mapDataLoaded: boolean = false,
            containerNode,
            width: number,
            height: number,
            heightFactor: number, //only used until setup has chosen proper projection....
            active,
            activeData = null,
            topoJSONFeature,
            topo,
            projection,
            path,
            svg,
            parentGraphic,
            backgroundLayer,
            debugShapesLayer,
            pointLayer,
            featureLayer,
            featureDetailLayer,
            pinLayer,
            extrasLayer,
            graticule,
            tooltip,
            highlightedFeatures = {}, // associative array of Feature instances by highlight class name
            pins: Pin[] = [],
            geojson:any = null
            ;
        init();
        function init() {
            containerNode = document.getElementById(config.containerId);
            if (!containerNode) {
                console.error("Cannot find container node for map with id = " + config.containerId);
                return;
            }
            d3.select(containerNode).classed('plethora-map-container', true);

            addCustomStyles();
            loadMapURL();

        }
        function loadMapURL() {
            d3.json(config.mapURL, function (error, world) {
                active = d3.select(null);
                topoJSONFeature = topojson.feature(world, world.objects[config.featureName]);
                topo = topoJSONFeature.features;
                graticule = d3Geo.geoGraticule();
                tooltip = config.showFeatureTooltip ? d3.select(containerNode).append("div").attr("class", "tooltip hidden") : null;
                //set the initial translation and scale properties
                //set it all up for the first time
                mapDataLoaded = true;
                d3.select(window).on("resize", throttle);
                setup();
                if (config.debug) {
                    window["topoJSONFeature"] = topoJSONFeature;
                    window["projection"] = projection;
                    window["world"] = world;
                    window["path"] = path;
                    window["topo"] = topo;
                    window["config"] = config;
                    window["getInitialTranslate"] = getInitialTranslate;
                }
            });
        }

        function setDimensions() {
            if (!containerNode) console.error("you must first set the containerNode");
            if (!topoJSONFeature) console.error("you must first load topoJSONFeature");
            //sets the width and height.  height is based on the aspect ratio of topoJSONFeature
              var tmpPath = d3Geo.geoPath().projection(getProjection(containerNode.offsetWidth, containerNode.offsetWidth * .5));
              var bbox_path = tmpPath.bounds(topoJSONFeature);
              width = containerNode.offsetWidth;
              heightFactor = (bbox_path[1][1] - bbox_path[0][1]) / (bbox_path[1][0] - bbox_path[0][0]);
              height = width * heightFactor;
        }

        function setup() {
            if (!topoJSONFeature) console.error("you must first load topoJSONFeature");
            setDimensions();
            projection = getProjectionFitWidth(width, topoJSONFeature);
            path = d3Geo.geoPath().projection(projection);
            svg = d3.select(containerNode)
                .append("svg")
                .attr('id', 'map-orig')
                .attr("width", width)
                .attr("height", height)
                .classed("zoomed-out", true);
            zoom = createZoom();
            if (config.freeZoom) svg.call(zoom);
            parentGraphic = svg.append("g");
            backgroundLayer = parentGraphic.append("g").classed('background-layer', true);
            featureLayer = parentGraphic.append("g").classed('feature-layer', true);
            featureDetailLayer = parentGraphic.append("g").classed('feature-detail-layer', true);
            extrasLayer = parentGraphic.append("g").classed('extras-layer', true);
            pointLayer = parentGraphic.append("g").classed('point-layer', true);
            pinLayer = parentGraphic.append("g").classed('pin-layer', true);
            if (config.debug) debugShapesLayer = parentGraphic.append("g").classed('debug-shapes-layer', true);
            if (!lastTranslate) {
                lastTranslate = getInitialTranslate();
                translateBeforeFeatureZoom = lastTranslate;
            }
            if (!lastScale) {
                lastScale = config.scale;
                scaleBeforeFeatureZoom = lastScale;
            }
            console.log("setup() lastTranslate:");
            console.log(lastTranslate);
            console.log("setup() lastScale:");
            console.log(lastScale);
            //parentGraphic.attr('transform', "translate(" + lastTranslate[0] + "," + lastTranslate[1] + ")scale(" + lastScale + ")");
            svg.transition().duration(0).call(zoom.translate(lastTranslate).scale(lastScale).event)
                .each("end", function () {
                    draw();
                    addClones();
                });

            if (config.debug) {// Create a text element to write the coordinates
                d3.select(containerNode).selectAll('.coords').remove();
                var label = d3.select(containerNode)
                    .append('span')
                    .classed('coords', true)
                    .attr('style', 'position: absolute; top: 0; right: 0; background: rgba(0,0,0,.8); color: white;');

                var debugCircle = null;
                var debugCircleCenter:Location = null;
                var debugCircleCenterMousePos = null;
                var lastMousePos = { x: 0, y: 0 };
                var lastMouseCoords:Location =new Location();
                var saveMouseCoords = function () {
                    
                    // Get the (x, y) position of the mouse (relative to the SVG element)
                    var pos = d3.mouse(parentGraphic.node()),
                        px = pos[0],
                        py = pos[1];
                    lastMousePos = { x: px, y: py };
                    // Compute the corresponding geographic coordinates using the inverse projection
                    var coords = projection.invert([px, py]);
                    lastMouseCoords = new Location();
                    lastMouseCoords.latitude = coords[1];
                    lastMouseCoords.longitude = coords[0];
                }

                var metersPerPixel = null;
                var getDistance = function (p1: { x: number, y: number }, p2: { x: number, y: number }) {
                    var a = p1.x - p2.x;
                    var b = p1.y - p2.y;

                    var c = Math.sqrt(a * a + b * b);
                    return c;
                }
                var getDistanceInPixels = function (mousePoint1: { x: number, y: number }, mousePoint2: { x: number, y: number }){
                    return getDistance(mousePoint1, mousePoint2) * lastScale;
                }
                var getDistanceFromLatLonInKm = function(lat1, lon1, lat2, lon2) {
                    var R = 6371; // Radius of the earth in km
                    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
                    var dLon = deg2rad(lon2 - lon1);
                    var a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2)
                        ;
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    var d = R * c; // Distance in km
                    return d;
                }

                var deg2rad = function (deg) {
                    return deg * (Math.PI / 180)
                }

                var getDistanceInKM = function (loc1: Location, loc2: Location) {
                    return getDistanceFromLatLonInKm(loc1.latitude, loc1.longitude, loc2.latitude, loc2.longitude);
                }

                // Attach a listener for the mousemove event
                d3.select('body').on('mousemove', function () {
                    saveMouseCoords();
                    // Format the coordinates to have at most 4 decimal places
                    // Set the content of the label
                    label.text([lastMouseCoords.latitude.toFixed(4), lastMouseCoords.longitude.toFixed(4)].join(', '));
                    //console.log(d3.event);
                    if (debugCircle && debugCircleCenter && debugCircleCenterMousePos) {
                       // var p1 = [lastMousePos.x, lastMousePos.y];
                      //  var p2 = [debugCircleCenterMousePos.x, debugCircleCenterMousePos.y];
                      //  var r = getDistance(p1, p2) * lastScale;
                        var r = getDistanceInPixels(lastMousePos, debugCircleCenterMousePos);
                        var rkm = getDistanceInKM(lastMouseCoords, debugCircleCenter);
                        debugCircle.remove();
                        debugCircle = addpoint(debugCircleCenter, "lat,long=[" + [debugCircleCenter.latitude.toFixed(4), debugCircleCenter.longitude.toFixed(4)].join(', ') + "], r=" + r.toFixed(4) + ", rkm=" + rkm.toFixed(4), "pin debug-shape", r, debugShapesLayer);
                    }
                });
                d3.select('body').on('keydown', function () {
                    if (d3.event.shiftKey && d3.event.keyCode == 67 && !debugCircle) {
                        debugCircleCenter = lastMouseCoords;
                        debugCircleCenterMousePos = lastMousePos;
                        var r = 20;
                        debugCircle = addpoint(debugCircleCenter, "lat,long=[" + [debugCircleCenter.latitude.toFixed(4), debugCircleCenter.longitude.toFixed(4)].join(', ') + "], r=" + r.toFixed(4), "pin debug-shape", r, debugShapesLayer);
                    }
                });
                d3.select('body').on('keyup', function () {
                    if (debugCircleCenter && d3.event.keyCode == 67) {
                        //var p1 = [lastMousePos.x, lastMousePos.y];
                        //var p2 = [debugCircleCenterMousePos.x, debugCircleCenterMousePos.y];
                        //var r = getDistance(p1, p2) * lastScale;
                        var r = getDistanceInPixels(lastMousePos, debugCircleCenterMousePos);
                        var rkm = getDistanceInKM(lastMouseCoords, debugCircleCenter);
                        debugCircle.remove();

                        alert('Lat:  ' + debugCircleCenter.latitude.toFixed(4) + "\n" + "Lon:  " + debugCircleCenter.longitude.toFixed(4) + "\n" + "Radius (pixels):  " + r.toFixed(4) + "\n" + "Radius (km):  " + rkm.toFixed(4));
                        debugCircle.remove();
                        debugCircle = null;
                        debugCircleCenter = null;
                    }
                });
            }
        }


        function createZoom() {
            return d3.behavior.zoom()
                .scaleExtent([config.minScale, config.maxScale])
                .translate([config.translateX, config.translateY])
                .scale(config.scale)
                .on("zoom", move);
        }

        function projectTranslationFromOrigin(translation: number[], scale: number): number[] {
            if (!projection) console.error("you must first have a projection set up.");
            var cp = projection([translation[0] / scale, translation[1] / scale]);
            var zp = projection([0, 0]);
            return [cp[0] - zp[0], cp[1] - cp[1]];
        }
        function getInitialTranslate(): number[] {
            return projectTranslationFromOrigin([config.translateX, config.translateY], config.scale);
        }
        function capitalizeFirstLetter(s: string) {
            return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
        }
        function addCustomStyles() {
            if (!config.customStyles) return;
            var styles = '';
            var pref = '#' + config.containerId + ' ';
            var featureClass = 'feature'
            for (var nm in config.customStyles) {
                var val = config.customStyles[nm];
                if (!val) continue;
                if (nm == 'background-color') styles += pref + '{background-color:' + val + '}';
                else {
                    var parts = nm.split('-');
                    var elementClass = parts.shift();
                    var state = parts.shift();
                    if (state == 'default') state = '';
                    else {
                        if (state == 'hover') state = '.' + state;
                        else if (state == 'highlighted') {
                            if (config.featureHighlightClass) state = '.' + config.featureHighlightClass;
                            else continue; //can't style it because it has no class!
                        }
                        else if (state == 'hoverhighlighted') {
                            if (config.featureHighlightClass) state = '.' + config.featureHighlightClass + '.hover';
                            else continue; //can't style it because it has no class!
                        }
                        else if (state == 'activehighlighted') {
                            if (config.featureHighlightClass) state = '.' + config.featureHighlightClass + '.active';
                            else continue; //can't style it because it has no class!
                        }
                        else if (state == 'activehighlightedhover') {
                            if (config.featureHighlightClass) state = '.' + config.featureHighlightClass + '.active.hover';
                            else continue; //can't style it because it has no class!
                        }
                        else state = '.' + state;
                    }
                    var prop = parts.join('-');
                    styles += pref + '.' + elementClass + state + '{' + prop + ':' + val + '}';
                }
            }
            if (!styles) return;
            var $ = window['jQuery'];
            $('<style type="text/css">' + styles + '</style>').appendTo($('head'));
        }

        function getProjectionFunction() {
            let projectionString = config.projection || 'mercator';
            console.log('projectionString: ' + projectionString);
            window["d3Geo"] = d3Geo;
            window["d3GeoProjection"] = d3GeoProjection;
            //console.log(d3GeoProjection.geoCylindricalEqualArea);
            var geoFuncStr = 'geo' + capitalizeFirstLetter(projectionString);
            var projectionFunction = d3GeoProjection[geoFuncStr] || d3GeoProjection[geoFuncStr] || d3.geo[projectionString];
            console.log('projectionFunction: ' + projectionFunction);
            if (!projectionFunction) {
                console.warn('projection function ' + projectionString + ' not found, defaulting to mercator');
                projectionFunction = d3.geo.mercator;
            }
            return projectionFunction;
        }
        function getProjection(width, height) {
            let projectionFunction = getProjectionFunction();
            let proj = projectionFunction()
                .translate([(width / 2), (height / 2)])
                .scale(width / 2 / Math.PI);
            return proj;
        }
        function getProjectionFitWidth(width, object) {
            let projectionFunction = getProjectionFunction();
            let proj = projectionFunction();
            if (typeof proj.fitWidth == "function") proj = proj.fitWidth(width, object);
            else console.warn("could not call fitWidth on this projection! config.projection = " + config.projection);
            return proj;
        }

        function showFeatureTooltip(d, node) {
            //offsets for tooltips
            var tooltipXBuffer = 20;
            var tooltipYBuffer = 10;
            var offsetL = containerNode.offsetLeft;
            var offsetT = containerNode.offsetTop;


            var mouse = d3.mouse(svg.node()).map(function (d) { return parseInt(d); });
            var tipHTML = d.properties[config.featureTooltipField];
            var tipSuffix = "";
            if (node && config.zoomInOnFeatureClick && node === active.node()) {
                tipSuffix = config.lang.zoomedInTooltipSuffix || '';
                tipHTML += tipSuffix;
            }
            tipHTML = config.featureTooltipFunction(d, tipHTML, tipSuffix);
            if (!tipHTML) {
                 hideFeatureTooltip();
                 return;
            }
            var newLeft = mouse[0] + offsetL + tooltipXBuffer;
            var newTop = mouse[1] + offsetT + tooltipYBuffer;
            tooltip.classed("hidden", false)
                .attr("style", "left:" + newLeft + "px;top:" + newTop + "px")
                .html(tipHTML);
            //edge detection...
            var bb = tooltip.node().getBoundingClientRect();
            var updatePos = false;
            if (bb) {
                if (newLeft > containerNode.getBoundingClientRect().width / 2) {
                    updatePos = true;
                    newLeft = mouse[0] - bb.width - tooltipXBuffer;
                }
                if (newTop > containerNode.getBoundingClientRect().height / 2) {
                    updatePos = true;
                    newTop = mouse[1] - bb.height - tooltipYBuffer;
                }
                if (updatePos) {
                    tooltip.attr("style", "left:" + newLeft + "px;top:" + newTop + "px")
                }
            }

        }
        function hideFeatureTooltip() {
            tooltip.classed("hidden", true);
        }
        function draw() {
            console.log("draw()");
            if (config.addBackground) {
                backgroundLayer.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", width)
                    .attr("height", height)
                    .attr("class", "background");
            }
            if (config.drawGraticule) {
                extrasLayer.append("path")
                    .datum(graticule)
                    .attr("class", "graticule")
                    .attr("d", path);
            }
            if (config.drawEquator) {
                extrasLayer.append("path")
                    .datum({ type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]] })
                    .attr("class", "equator")
                    .attr("d", path);
            }
            var feature = featureLayer.selectAll(".feature").data(topo);
            feature.enter().insert("path")
                .classed("feature", true)
                .classed("active", function (d, i) { return activeData && d.properties.iso == activeData.properties.iso; })
                .attr("d", path)
                //        .attr("id", function(d, i) { return d.properties.iso || d.id; })
                .attr("data-iso", function (d, i) { return d.properties.iso; })
                .attr("title", function (d, i) { return d.properties[config.featureNameField]; })
                .attr('vector-effect', 'non-scaling-stroke')
                .on("click", clicked)
                .on('mouseenter', function (d, i) {
                    d3.selectAll('.feature[data-iso="' + d.properties.iso + '"]').classed('hover', true).each(function () {
                        this.parentElement.appendChild(this);
                    });
                })
                .on('mouseleave', function (d, i) {
                    d3.selectAll('.feature[data-iso="' + d.properties.iso + '"]').classed('hover', false);
                });

            drawPins();
            drawGeoJSON();
            //tooltips for features
            if (config.showFeatureTooltip) {
                feature
                  .on("mousemove", function (d) {
                      showFeatureTooltip(d, this);
                  })
                  .on("mouseout", function (d) {
                      hideFeatureTooltip();
                  });
            }
            //EXAMPLE: adding some points from external CSV file
            if (config.csv && config.csv.url) {
                d3.csv(config.csv.url, function (err, points) {
                    for (var i = 0; i < points.length; i++) {
                        var pt = points[i];
                        var latField = config.csv.latitudeField || 'latitude';
                        var lonField = config.csv.longitudeField || 'longitude';
                        var nameField = config.csv.nameField || 'name';
                        var loc = new Location();
                        loc.latitude = +pt[latField];
                        loc.longitude = +pt[lonField];
                        addpoint(loc, pt[nameField], 'point-wrapper');
                    }
                });
            }
            //console.log("attempting to redraw all highlighted classes:");
            //console.log(highlightedFeatures);
            for (let highlightClass in highlightedFeatures) {
                redrawHighlightClass(highlightClass);
            }
        }
        function removeClones() {
            // var $ = window['jQuery'];
            // $('#map-left,#map-right').hide();
            if ($cloneRight) {
                $cloneRight.remove();
                $cloneRight = null;
            }
            if ($cloneLeft) {
                $cloneLeft.remove();
                $cloneLeft = null;
            }
        }
        function redraw() {
            console.log("redraw()");
            removeClones();
            d3.select('svg').remove();
            setup();
            draw();
            if(activeData){
                //reset();
                var activeISO = activeData.iso ? activeData.iso : (activeData.properties.iso ? activeData.properties.iso : null);
                activeData = null;
                if(activeISO) zoomInOnFeatureAPICall(activeISO);
            }
/*
            if (activeData) {
                // if we had an active element, we have to get the new node by selecting it.
                // then we want to get the data element once more just in case...
                var activeISO = activeData.iso ? activeData.iso : (activeData.properties.iso ? activeData.properties.iso : null);
                activeData = null;
                active = null;
                if(activeISO) zoomInOnFeatureAPICall(activeISO);

                active = d3.selectAll('#map-orig [data-iso="' + activeData.properties.iso + '"]');
                activeData = active.data()[0];
                //we have to re-zoom in on the active element, but without any animation or callbacks
                var zoomInVars = getZoomInVars(activeData);
                if (!zoomInVars) {
                    //invalid bounds or something
                    return;
                }
                svg.classed("zooming-out", false);
                svg.classed("zoomed-out", false);
                svg.classed("zoomed-in", false);
                svg.classed("zooming-in", false);
                zoomingIn = false;
                svg.transition()
                    .duration(0)
                    .call(zoom.translate(zoomInVars.translate).scale(zoomInVars.scale).event)
                    .each("end", function () {
                        addClones();
                    });
            }
*/
        }
        function move() {
            var t = d3.event.translate;
            var s = d3.event.scale;
            //console.log("move() d3.event.translate=" + t + ", d3.event.scale=" + s + ", config.maxScale = " + config.maxScale + ", config.minScale = " + config.minScale + ", height=" + height);
            s = Math.min(config.maxScale, s);
            s = Math.max(config.minScale, s);
            var maxTY = 0;
            var minTY = -height * (s - 1);
            //console.log('maxTY: ' + maxTY);
            //console.log('minTY: ' + minTY);
            if (t[1] > maxTY) t[1] = maxTY;
            if (t[1] < minTY) t[1] = minTY;
            //console.log("translate: ");
            //console.log(t);
            //console.log("s: " + s);
            //console.log("translate, inverted: ");
            //console.log(projection.invert(t));
            zoom.translate(t);
            lastScale = s, lastTranslate = t;
            parentGraphic.attr("transform", "translate(" + t + ")scale(" + s + ")");
            svg.selectAll('[data-font-size]').style("font-size", function () {
                var fontSize = parseFloat(d3.select(this).attr("data-font-size") || "16");
                return getScaledFontSize(fontSize) + "px";
            });
            svg.selectAll('[data-radius]').attr("r", function (d, i) {
                var r = parseFloat(d3.select(this).attr('data-radius') || '5');
                return getScaledRadius(r);
            });
            svg.selectAll('[data-stroke-width]').style("stroke-width", function (d, i) {
                var r = parseFloat(d3.select(this).attr('data-stroke-width') || '1');
                return getScaledRadius(r);
            });
            //adjust the feature hover stroke width based on zoom level
            //svg.selectAll(".feature").style("stroke-width", 1 / s); //these should have a non-scaling stroke!
            addClones();
        }
        var lastWinDimensions = getWindowDimensions();
        function getWindowDimensions() {
            var $ = window['jQuery'];
            var $win = $(window);
            var dim = {
                width: $win.width(),
                height: $win.height()
            }
            return dim;
        }
        var throttleTimer;
        function throttle() {
            window.clearTimeout(throttleTimer);
            throttleTimer = window.setTimeout(function () {
                var $ = window['jQuery'];
                var $win = $(window);
                var dim = getWindowDimensions();
                if (!lastWinDimensions
                    || Math.abs(lastWinDimensions.width - dim.width) > 50
                    || Math.abs(lastWinDimensions.height - dim.height) > 50) {
                    lastWinDimensions = dim;
                    redraw();
                }
            }, 200);
        }
        //geo translation on mouse click in map
        function clicked(d) {
            if (config.zoomInOnFeatureClick &&
                (!config.zoomInOnFeatureClickRestrictClass
                    || d3.select(this).classed(config.zoomInOnFeatureClickRestrictClass))) {
                zoomInOnFeature(d, this, true);
            }
        }
        var zoomingIn = false, zoomingOut = false;
        var zoomingInCallbacks = [];
        var usePlainZoomInVars = false;
        /*
        function convertKMToPixel(km:number) {
            var kmPerPixel = 17.89173757;
            return km / kmPerPixel; 
        }*/
        function plotPointInCircle(radiusKM: number, center: Location, theta:number = 0):Location {
            var dx = radiusKM * 1000 * Math.cos(theta);
            var dy = radiusKM * 1000 * Math.sin(theta);
            var delta_longitude = dx / (111320 * Math.cos(center.latitude));
            var delta_latitude = dy / 110540;
            var result = new Location();
            result.longitude = center.longitude + delta_longitude;
            result.latitude = center.latitude + delta_latitude;
            return result;
        }
        function getZoomInVars(d): any {
            console.log("getZoomInVars() d:");
            console.log(d);
            if (usePlainZoomInVars) return getZoomInVarsPlain(d);
            var bounds = path.bounds(d);
            var maxScale = config.maxScale;// * 8/9;

            //DEALING WITH PROBLEM COUNTRIES THAT SIT ON THE EAST/WEST CUT-OFF
            var iso = typeof d == "string" ? d : (d && d.iso ? d.iso : (d && d.properties && d.properties.iso ? d.properties.iso : null));
            var feature = config.getFeature(iso);
            //var usingFeatureZoomPoint = false;
            if(feature && feature.zoomBounds){
console.log("---------------------");
console.log("-   ZOOM BOUNDS     -");
console.log(feature.zoomBounds);
               bounds = path.bounds(feature.zoomBounds);
               if(config.debug){
                   if(geojson && geojson.debug) delete geojson.debug;
                   addGeoJSONAPICall('debug', feature.zoomBounds);
               }
console.log("bounds:");
console.log(bounds);
                if (config.layout == 'absolute' && !config.isMobile()) {
                    //pretend the object stretches twice as far to the left
                    bounds[0][0] = bounds[0][0] - (bounds[1][0] - bounds[0][0]);
                }
            }       
            else {
                if (config.layout == 'absolute' && !config.isMobile()) {
                    //pretend the object stretches twice as far to the left
                    bounds[0][0] = bounds[0][0] - (bounds[1][0] - bounds[0][0]);
                }
            }
            var dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2;
            if (!isFinite(bounds[0][0]) || !isFinite(bounds[0][1]) || !isFinite(bounds[1][0]) || !isFinite(bounds[1][1])) {
                console.log("invalid bounds: ")
                console.log(bounds);
                return null;
            }
            var scale = Math.max(1, Math.min(maxScale, 1 / Math.max(dx / width, dy / height)));
            //console.log("the scale: " + scale);
            var translate = [width / 2 - scale * x, height / 2 - scale * y];
            return { scale: scale, translate: translate };
        }
        function getZoomInVarsPlain(d) {
            var bounds = path.bounds(d);
            var maxScale = config.maxScale;
            var dx = bounds[1][0] - bounds[0][0],
                dy = bounds[1][1] - bounds[0][1],
                x = (bounds[0][0] + bounds[1][0]) / 2,
                y = (bounds[0][1] + bounds[1][1]) / 2;
            if (!isFinite(bounds[0][0]) || !isFinite(bounds[0][1]) || !isFinite(bounds[1][0]) || !isFinite(bounds[1][1])) {
                console.log("invalid bounds: ")
                console.log(bounds);
                return null;
            }
            var scale = Math.max(1, Math.min(maxScale, 1 / Math.max(dx / width, dy / height)));
            var translate = [width / 2 - scale * x, height / 2 - scale * y];
            return { scale: scale, translate: translate };
        }
        function zoomInOnFeature(d, element, resetIfAlreadyActive: boolean, callback = null) {
            console.log("zoomInOnFeature() arguments:");
            console.log(arguments);
            // var latlon = projection.invert(d3.mouse(element));
            // console.log(latlon);
            //FEATURE ZOOM
            if (element && active.node() === element) {
                if (resetIfAlreadyActive) {
                    return reset();
                }
                if (callback) {
                    if (!zoomingIn) callback(d);
                    else zoomingInCallbacks.push(callback);
                }
                return;
            }
              d3.selectAll('.feature.active').classed("active", false);
              active = d3.select(element);
              if (element != null) active.classed("active", true);
              if (element != null) activeData = active.data()[0];
              else activeData = null;

            var zoomInVars = getZoomInVars(d);
            console.log("zoomInVars: ");
            console.log(zoomInVars);
            if (!zoomInVars) {
                //invalid bounds or something.... make sure callbacks get called anyway.
                if (callback) callback(d);
                for (var i = 0; i < zoomingInCallbacks.length; i++) {
                    zoomingInCallbacks[i](d);
                }
                zoomingInCallbacks = [];
                return;
            }
            translateBeforeFeatureZoom = lastTranslate;
            scaleBeforeFeatureZoom = lastScale;
            svg.classed("zooming-out", false);
            svg.classed("zoomed-out", false);
            svg.classed("zoomed-in", false);
            svg.classed("zooming-in", true);
            zoomingIn = true;
            svg.transition()
                .duration(0)
                .call(zoom.translate(lastTranslate).scale(lastScale).event)
                .each("end", function () {
                    svg.transition()
                        .duration(config.zoomInSpeed)
                        .call(zoom.translate(zoomInVars.translate).scale(zoomInVars.scale).event)
                        .each("end", function () {
                            zoomingIn = false;
                            svg.classed("zooming-in", false);
                            svg.classed("zoomed-in", true);
                            config.onZoomedIn(d);
                            //if (callback) console.log("calling a callback!!");
                            if (callback) callback(d);
                            for (var i = 0; i < zoomingInCallbacks.length; i++) {
                                //console.log("calling a looped callback!!");
                                zoomingInCallbacks[i](d);
                            }
                            zoomingInCallbacks = [];
                            addClones();
                            //	      config.onFeatureChange(d);
                        });
                });
            config.onFeatureChange(d);
        }
        var mapsMovedBy: number = 0;
        var $cloneRight, $cloneLeft;
        function getCloneTransform(which: string) {
            switch (which) {
                case 'left':
                    var tx: number = lastTranslate[0] - width * lastScale + width;
                    var t = [tx, lastTranslate[1]];
                    return "translate(" + t[0] + ',' + t[1] + ")scale(" + lastScale + ")";
                case 'right':
                    var tx: number = Math.floor(lastTranslate[0] + width * lastScale);
                    var t = [tx, lastTranslate[1]];
                    return "translate(" + t[0] + ',' + t[1] + ")scale(" + lastScale + ")";
                case 'orig':
                    return "translate(" + lastTranslate[0] + ',' + lastTranslate[1] + ")scale(" + lastScale + ")";
            }
        }
        function addClones() {
            if (!config.wrap) return;
            if (!mapDataLoaded) {
                setTimeout(addClones, 100);
                return; // we do not want to do this too soon...
            }
            removeClones();
            var $ = window['jQuery'];
            var $orig = $(svg[0][0]);
            //
            if (!$cloneRight) {
                $cloneRight = $orig.clone().attr("id", "map-right");
                $cloneRight.find('[id]').each(function () { $(this).attr('id', $(this).attr('id') + '-right'); });
                $cloneRight.insertBefore($orig);
            }

            var transformRight = getCloneTransform('right');//"translate(" + [Math.floor(lastTranslate[0] + width * lastScale) ,lastTranslate[1]] + ")scale(" + lastScale + ")";
            $cloneRight.css({ position: 'absolute', top: 0, left: 0 }).attr("width", width * 2);
            $cloneRight.find("g:first").attr("transform", transformRight);
            $cloneRight.show();

            if (!$cloneLeft) {
                $cloneLeft = $orig.clone().attr("id", "map-left");
                $cloneLeft.find('[id]').each(function () { $(this).attr('id', $(this).attr('id') + '-left'); });
                $cloneLeft.insertBefore($orig);
            }
            var transformLeft = getCloneTransform('left'); //"translate(" + [lastTranslate[0] - width * lastScale + width,lastTranslate[1]] + ")scale(" + lastScale + ")";
            $cloneLeft.css({ position: 'absolute', top: 0, left: -width }).attr("width", width * 2);;
            $cloneLeft.find("g:first").attr("transform", transformLeft);
            $cloneLeft.show();


            $('svg').css('pointer-events', 'none').find('path,rect').css('pointer-events', 'auto');

            var onMouseEnterLeftOrRight = function (e) {
                if (config.debug && e.shiftKey) return;
                if (zoomingIn || zoomingOut) return;
                console.log("clone event: " + e.type + ", this:");
                console.log(this);
                console.log(e);

                var $which = $(this).closest('svg');
                console.log("which: " + $which.attr('id'));

                var isLeft = $which.is('#map-left');
                mapsMovedBy = isLeft ? -1 : 1;
                lastTranslate[0] = lastTranslate[0] + mapsMovedBy * width * lastScale;
                $cloneRight.find("g:first").attr("transform", getCloneTransform('right'));
                $cloneLeft.find("g:first").attr("transform", getCloneTransform('left'));
                $orig.find("g:first").attr("transform", getCloneTransform('orig'));
                //zoom.translate(lastTranslate); 

                svg.transition().duration(0).call(zoom.translate(lastTranslate).scale(lastScale).event)

                //$cloneLeft.add($cloneRight).find('path').off('mouseenter', onMouseEnterLeftOrRight);
                //move();
                //zoom.translate(lastTranslate);

            };
            $orig.find('.feature[data-iso]').on('mouseover', function (e) {
                $('[data-iso="' + $(this).attr('data-iso') + '"]').addClass('hover');
            }).on('mouseout', function (e) {
                $('[data-iso="' + $(this).attr('data-iso') + '"]').removeClass('hover');
            });
            //	$cloneLeft.add($cloneRight).find('path,.pin').on('mouseenter', onMouseEnterLeftOrRight);
            $cloneLeft.add($cloneRight).find('rect.background,path,.pin').on('mouseenter', onMouseEnterLeftOrRight);
        }

        function reset(triggerCallbacks: boolean = true) {
            console.log("reset()");
            svg.classed("zooming-out", true);
            svg.classed("zoomed-out", false);
            svg.classed("zoomed-in", false);
            svg.classed("zooming-in", false);
            active.classed("active", false);
            var wasActive = active;
            active = d3.select(null);
            activeData = null;
            if (wasActive) {
                if (triggerCallbacks) config.onFeatureChange(null);
            }
            addClones();
            zoomingOut = true;
            svg.transition()
                .duration(0)
                .call(zoom.translate(lastTranslate).scale(lastScale).event)
                .each("end", function () {
                    svg.transition()
                        .duration(config.zoomOutSpeed)
                        //.call(zoom.translate(translateBeforeFeatureZoom || [config.translateX, config.translateY]).scale(scaleBeforeFeatureZoom || config.scale).event)
                        .call(zoom.translate(getInitialTranslate()).scale(config.scale).event)
                        .each("end", function () {
                            translateBeforeFeatureZoom = null;
                            scaleBeforeFeatureZoom = null;
                            zoomingOut = false;
                            svg.classed("zooming-out", false);
                            svg.classed("zoomed-out", true);
                            clearGeoJSONAPICall();
                            if (triggerCallbacks) config.onZoomedOut();
                        });
                });
            pinLayer.selectAll('.pin.active').classed('active',false);
        }
        //function to add points and text to the map (used in plotting capitals)
        function addpoint(location:Location, text, classname, r: number = 1, layer = null) {
            if (!layer) layer = pointLayer;
            var gpoint = layer.append("g").attr("class", classname).attr("d", path);
            var proj = projection([location.longitude, location.latitude]);
            var x = proj[0];
            var y = proj[1];
            var strokeWidth = 1;
            gpoint.append("svg:circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("class", "point")
                .attr("data-radius", r)
                .attr("data-stroke-width", strokeWidth)
                .attr("r", getScaledRadius(r));
            //conditional in case a point has no associated text
            if (text && text.length > 0) {
                var fontSize = 16;
                gpoint.append("text")
                    .attr("x", x + 2)
                    .attr("y", y + 2)
                    .attr("class", "text")
                     .attr('data-font-size', fontSize)
                    .style('font-size', getScaledFontSize(fontSize) + "px")
                    .text(text);
            }
            return gpoint;
        }
        function getScaledRadius(r: number) {
            return r / lastScale;
        }
        function getScaledFontSize(fs: number) {
            return fs * (width / 1900) / lastScale;
        }
        function addPin(pin: Pin) {
            var pinClass = pin.cssClass && pin.cssClass != 'undefined' ? pin.cssClass : '';
            var feature = pin.iso ? getFeatureByISO(pin.iso) : null;

            var gpoint = pinLayer.append("g")
                .attr("class", 'pin ' + pinClass)
                .attr("data-iso", pin.iso)
                .classed(pin.iso, true)
                .on('mouseenter', function () {
                    //console.log("mouseenter pin with iso " + pin.iso);
                    d3.selectAll('.feature[data-iso="' + pin.iso + '"]').classed('hover', true);
                })
                .on('mousemove', function () {
                    if (config.showFeatureTooltip) {
                        if (feature) showFeatureTooltip(feature.d, feature.element);
                        else showFeatureTooltip({ properties: {iso: pin.iso, name: pin.text}}, null);
                    }
                })
                .on('mouseleave', function () {
                    //console.log("mouseleave pin with iso " + pin.iso);
                    d3.selectAll('.feature[data-iso="' + pin.iso + '"]').classed('hover', false);
                    if (config.showFeatureTooltip) {
                        hideFeatureTooltip();
                    }
                });
            var pinProj = projection([pin.longitude, pin.latitude]);
            var x = pinProj[0];
            var y = pinProj[1];
            if (pin.radius > 0) {
                var circ = gpoint.append("svg:circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("class", "point")
                    .attr("data-radius", pin.radius)
                    .attr("data-stroke-width", pin.strokeWidth)
                    .attr("r", getScaledRadius(pin.radius || 1));
                if (pin.textColor) {
                    circ.style("fill", pin.textColor)
                }
            }
            if (pin.icon && pin.iconSize) {
                var pinIconText = '';
                switch (pin.icon) {
                    case "map-marker":
                    default:
                        pinIconText = '\uf041';
                        break;
                }
                var txt = gpoint.append("text")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("class", "icon fa")
                    .attr('data-font-size', pin.iconSize)
                    .style('font-size', getScaledFontSize(pin.iconSize) + "px")
                    .text(pinIconText);
                if (pin.iconColor) txt.attr("data-color", pin.iconColor).style("fill", pin.iconColor);
                if (pin.iconHoverColor) txt.attr("data-hover-color", pin.iconHoverColor);
                if (pin.iconActiveColor) txt.attr("data-active-color", pin.iconActiveColor);
            }
            //conditional in case a point has no associated text
            if (pin.text && pin.fontSize) {
                gpoint.append("text")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("class", "text")
                    .attr('data-font-size', pin.fontSize)
                    .style('font-size', getScaledFontSize(pin.fontSize) + "px")
                    .text(pin.text);
            }
            if (pin.clickBehavior) {
                gpoint.classed('clickable');
                switch (pin.clickBehavior) {
                    case "zoom:iso,pin":
                        gpoint.on('click', function () {
                            if (gpoint.classed('active')) {
                                zoomOutAPICall();
                                config.onFeatureChange(null);
                                gpoint.classed('active', false);
                            }
                            else {
                                if (pin.iso && getFeatureByISO(pin.iso)) {
                                    zoomInOnFeatureAPICall(pin.iso);
                                }
                                else {
                                    var feature = config.getFeature(pin.iso);
                                    zoomInOnLocationAPICall(pin, null, feature ? feature : { iso: pin.iso, name: pin.iso });
                                }
                                //gpoint.classed('active', true);
                            }
                        });
                        break;
                }
            }
        }

        function redrawHighlightClass(highlightClass: string) {
            //console.log("redrawHighlightClass(" + highlightClass + ")");
            //console.log(highlightedFeatures);
            d3.selectAll('.feature.' + highlightClass).classed(highlightClass, false);
            if (!highlightedFeatures[highlightClass]) return;
            for (let feature of highlightedFeatures[highlightClass]) {
                //console.log("adding class '" + highlightClass + "' to features with data-iso=" + feature.iso);
                d3.selectAll('[data-iso="' + feature.iso + '"]').classed(highlightClass, true);
            }
        }
        function setHighlightedFeatures(features: Feature[], highlightClass: string = null) {
            if (!highlightClass) highlightClass = config.featureHighlightClass;
            if (!highlightClass) return; //nothing to highlight
            highlightedFeatures[highlightClass] = features;
            if (mapDataLoaded) {
                redrawHighlightClass(highlightClass);
                addClones();
            }
        }
        function getFeatureByISO(iso: string): { d: any, element: any } {
            if (!iso) return null;
            var feature = d3.select('#map-orig .feature[data-iso="' + iso + '"]');
            if (feature.size() > 0) {
                var result = null;
                feature.each(function (d) {
                    if (!result && d.properties && d.properties.iso == iso) {
                        result = { d: d, element: this };
                    }
                });
                return result;
            }
            return null;
        }
        function zoomInOnFeatureAPICall(iso: string, callback = null) {
            console.log("zoomInOnFeatureAPICall() arguments:");
            console.log(arguments);
            if (!mapDataLoaded) {
                console.log("zoomInOnFeatureAPICall: delayed until mapDataLoaded");
                setTimeout(function () { zoomInOnFeatureAPICall(iso, callback); }, 100);
                return;
            }
            pinLayer.selectAll('.pin.active').classed('active', false);
            pinLayer.selectAll('.pin.' + iso).classed('active', true);
            var feature = getFeatureByISO(iso);
            if (feature) zoomInOnFeature.apply(this, [feature.d, feature.element, false, callback]);
            else {
                var featureOb = config.getFeature(iso);
                if(featureOb && (featureOb.zoomBounds)){
			zoomInOnFeature.apply(this, [iso, null, false, callback]);
		}
		else {
                	console.log('zoomInOnFeatureAPICall: feature with iso ' + iso + ' not found, cannot zoom in so just calling the callback function with null');
                	if (callback && typeof callback == "function") callback(null);
		}
            }
        }
        function zoomInOnLocationAPICall(location: Location, callback = null, properties: any = null) {
            return zoomInOnLocationsAPICall([location], callback, properties);
        }
        function zoomInOnLocationsAPICall(locations: Location[], callback = null, properties: any = null) {
            console.log("zoomInOnLocationsAPICall()");
            //console.log(locations);
            /*
            var geoJson = { type: "FeatureCollection", features: [], properties: properties };
            for (let loc of locations) {
                geoJson.features.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [loc.longitude, loc.latitude] }
                });
            }*/
            var geoJson = locationsToFeatureCollection(locations, properties);
            zoomInOnFeature(geoJson, null, false, callback);

        }
        function locationsToFeatureCollection(locations: Location[], properties:any=null) {

            var geoJson = { type: "FeatureCollection", features: [], properties: properties };
            for (let loc of locations) {
                geoJson.features.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [loc.longitude, loc.latitude] }
                });
            }
            return geoJson;
        }
        function zoomOutAPICall() {
            if (mapDataLoaded) reset(false);
        }
        function removePins() {
            d3.selectAll('.pin').remove();
        }
        function drawPins() {
            removePins();
            if (pins && pins.length) {
                for (let pin of pins) {
                    addPin(pin);
                }
                addClones();
                //fadeInPins();
            }
        }
        /*
        var pinsFadeCount = 0;
        function fadeInPins() {
            if (pins && pins.length && mapDataLoaded && pinsFadeCount === 0) {
              var $ = window['jQuery'];
              if ($) $('.pin').each(function (i) { $(this).stop().fadeOut(1).stop(true, true).delay(i * 100).fadeIn(2000) });
              pinsFadeCount++;
            }
        }*/
        function setPinsAPICall(newPins: Pin[]) {
            pins = newPins;
            if (mapDataLoaded) drawPins();
        }
        function drawGeoJSON(){
//console.log("drawGeoJSON() geojson:");
//console.log(geojson);
           featureDetailLayer.selectAll('path').remove();
           if(debugShapesLayer) debugShapesLayer.selectAll('path.debug').remove();
           d3.selectAll('path.feature').classed('show-detail',false);
           if(geojson){
             for(var iso in geojson){
              var isoFeatures = geojson[iso].features;
              var layer = (debugShapesLayer && iso === 'debug') ? debugShapesLayer : featureDetailLayer;
              layer
               .selectAll('path.' + iso)
               .data(isoFeatures)
               .enter()
               .append('path')
               .classed(iso, true)
               .attr('d', path)
               .attr('vector-effect', 'non-scaling-stroke')
               .on('click', function(){
		  zoomOutAPICall();
                  config.onFeatureChange(null);
		})
               ;

               d3.selectAll('path.feature[data-iso="' + iso + '"]').classed('show-detail',true);
             }
            }
           
        }
        function clearGeoJSONAPICall(){
//console.log("clearGeoJSONAPICall()");
           var debugFeatures = (config.debug && geojson) ? geojson["debug"] : null;
           geojson = null;
           if(debugFeatures) geojson = {debug:debugFeatures};
           if (mapDataLoaded) {
		drawGeoJSON();
		addClones();
	   }
        }
        function addGeoJSONAPICall(iso, feature){
//console.log("addGeoJSONAPICall(" + iso + ")");
//console.log(geojson);
// Draw each province as a path
           if(!geojson) geojson = {};
           if(!geojson[iso]) geojson[iso] = {"type":"FeatureCollection","features":[]};
           geojson[iso].features = [feature];
console.log("updated geojson:");
console.log(geojson);
           if (mapDataLoaded) {
		drawGeoJSON();
		addClones();
	   }
        }
        return {
            setHighlightedFeatures: setHighlightedFeatures,
            zoomInOnFeature: zoomInOnFeatureAPICall,
            zoomInOnLocations: zoomInOnLocationsAPICall,
            zoomInOnLocation: zoomInOnLocationAPICall,
            zoomOut: zoomOutAPICall,
            setPins: setPinsAPICall,
            getTranslateX: function () { return lastTranslate && projection ? projection.invert(lastTranslate)[0] / (lastScale || 1) - projection.invert([0, 0])[0] : 0; },
            getTranslateY: function () { return lastTranslate && projection ? projection.invert(lastTranslate)[1] / (lastScale || 1) - projection.invert([0, 0])[1] : 0; },
            getScale: function () { return lastScale || 1; },
            addGeoJSON: addGeoJSONAPICall,
            clearGeoJSON: clearGeoJSONAPICall
        };
    }
    //////
}
