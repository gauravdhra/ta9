import { MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AfterViewInit, Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { defaults as defaultControls } from 'ol/control';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import ZoomToExtent from 'ol/control/ZoomToExtent';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import {Vector as VectorLayer} from 'ol/layer';
import Overlay from 'ol/Overlay';
import TileJSON from 'ol/source/TileJSON';
import {Icon, Style} from 'ol/style';
import 'ol/ol.css';
import { toLonLat, fromLonLat} from 'ol/proj';
import {toStringHDMS} from 'ol/coordinate';
import * as olProj from 'ol/proj';
import OSM from 'ol/source/OSM';
import * as config from '../../app.config.json';

@Component({
  selector: 'app-map-dialog',
  templateUrl: './map-dialog.component.html',
  styleUrls: ['./map-dialog.component.css']
})
export class MapDialogComponent {
  @Output() location = new EventEmitter<string>();
  @Output() coordinates = new EventEmitter<any>();
  
  
  constructor(public dialog: MatDialog) {}
  // address: string;
  flag = false;
  // ngOnInit(): void {
    // this.address = "usa 123 lt space"
  // }
  closeDialog() {
    this.dialog.closeAll();
  }
  openDialog() {
    const dialogRef = this.dialog.open(DialogContentExampleDialog);
    dialogRef.afterClosed().subscribe(result => {
      this.flag = true;
      this.location.emit(result);
      this.coordinates.emit(this.coordinates);
    });
  }
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: 'dialog-content-example-dialog.html',
  styleUrls: ['./map-dialog.component.css']

})
export class DialogContentExampleDialog implements AfterViewInit{
  map: Map;
  vectorLayer: any;
  rasterLayer: any;
  placeName: any;
  locationDetail = { location: "", coordinates: [] }
  coordinates = []
  singaporeCoordinates = config.singaporeCoordinates
  mapZoom = config.mapZoom
  @Output() location = new EventEmitter<string>();
  // @Output() coordinates = new EventEmitter<[any]>();
  constructor( @Inject(MAT_DIALOG_DATA) public data: any) { 

    if(data){
      let pointsArray = data.coordinates.split(',')
      this.locationDetail['coordinates'] = [pointsArray[0], pointsArray[1]]
      this.locationDetail['location'] = data.placeName
      
      let placePoints = fromLonLat(pointsArray).map(function (val) {
        return val.toFixed(6);
      });
      this.coordinates = placePoints

    }
    
  }

  ngAfterViewInit() {
    this.showMap();
  }

 approveLocation()
  {
    //do code for approve button
  }

  //getting place name
  getPlaceName(lon, lat) {
    var content = document.getElementById('popup-content');
    fetch('https://nominatim.openstreetmap.org/reverse?format=json&lon=' + lon + '&lat=' + lat)
      .then((response) => {
        return response.json();
      }).then((json) => {
        content.innerHTML = '<code>' + json.display_name + '</code>';
        this.location = this.placeName = json.display_name;
        this.locationDetail['location'] = json.display_name
        this.placeName = json.display_name
        // this.coordinates = {lon: lon, lat: lat};
        // this.coordinates.emit({lon: lon, lat: lat});

    });
  }

  showMap() {
    // if(this.data){
      // document.getElementById('popup').style.display = "none"
      var markContainer = document.getElementById('mark');
    // }
    // else{
      // document.getElementById('mark').style.display = "none"
      var popupContainer = document.getElementById('popup');
      var closer = document.getElementById('popup-closer');
          /**
     * Add a click handler to hide the popup.
     * @return {boolean} Don't follow the href.
     */
      closer.onclick = function () {
        popupOverlay.setPosition(undefined);
        closer.blur();
        return false;
      };
    // }
    /**
     * Create an overlay to anchor the popup to the map.
     */
    var markOverlay = new Overlay({
      element: markContainer,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });
    var popupOverlay = new Overlay({
      element: popupContainer,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });


    /**
     * Create the map.
     */
    var map = new Map({
      layers: [
        new TileLayer({
          source: new OSM(),
        }) ],
      overlays: [popupOverlay,markOverlay],
      target: 'map',
      view: new View({
        center: this.coordinates.length>0 ? this.coordinates : this.singaporeCoordinates,
        zoom: this.mapZoom,
      }),
    });


    if (this.coordinates.length>0){
      setTimeout(()=>{
        markOverlay.setPosition(this.coordinates);
      },250)
    }
      /**
     * Add a click handler to the map to render the popup.
     */
    map.on('singleclick', (evt) => {
      var coordinate = evt.coordinate;
      popupOverlay.setPosition(coordinate);
      let placeCoordinate = toLonLat(evt.coordinate).map(function(val) {
        return val.toFixed(6);
      });
      
      var lon = coordinate[0];
      var lat = coordinate[1];
      this.locationDetail['coordinates'] = [placeCoordinate[0], placeCoordinate[1]]
      this.getPlaceName(placeCoordinate[0], placeCoordinate[1]);
    });
    
  }

}
