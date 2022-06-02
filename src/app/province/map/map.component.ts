import {Component, OnInit} from '@angular/core';
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Draw from 'ol/interaction/Draw';
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Fill, Stroke, Style} from "ol/style";
import {Feature} from "ol";
import {LineString, Polygon} from "ol/geom";
import {coordinates} from "ol/geom/flat/reverse";
import {getArea} from "ol/extent";
import {easeOut} from "ol/easing";


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  map!: Map;
  typeSelect = document.getElementById('type');
  drawInteraction !: Draw
  baseVector !: VectorLayer<any>
  public drawVector !: VectorLayer<any>
  public drawing= false;


  constructor(

  ) {

  }

  // ngOnInit(): void {
  // }


  ngOnInit(): void {

    this.map = new Map({
      view: new View({
        center: [0, 0],
        zoom: 1,
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        })
      ],
      target: 'ol-map'
    });

    this.drawVector = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(100, 255, 0, 1)',
          width: 2
        }),
        fill: new Fill({
          color: 'rgba(100, 255, 0, 0.3)',

        })
      })
    });


  }

  ngAfterViewInit() {
    this.map.setTarget("map");
    this.map.addLayer(this.drawVector);
    this.addInteraction();

  }


  addInteraction() {
    this.drawInteraction = new Draw({
      source: this.drawVector.getSource(),
      type: 'Polygon',
    });
    this.drawInteraction.on('drawstart', ()=>{
      this.drawing= true;
      this.drawVector.getSource().clear()
    });
    this.drawInteraction.on('drawend', ()=>{
      this.drawing=false;

    })
    this.map.addInteraction(this.drawInteraction);
  }

  // addActiveBoundaty(boundary:{type: string, coordinates:[number, number][][]}){
  //   const feature= new Feature({
  //     geometry: new Polygon(boundary.coordinates)
  //   });
  //   const geometry= feature.getGeometry();
  //   if(geometry){
  //     this.map.getView().fit(geometry, {
  //       duration: 1000,
  //       easing: easeOut,
  //       padding: [10, 10, 10, 10]
  //     });
  //   }
  //   this.drawVector.getSource().addFeature(feature)
  //
  // }

}
