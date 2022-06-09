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
import {AccountService} from "../../_services";
import {first} from "rxjs";


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
  public provinceVector !: VectorLayer<any>
  public drawing = false;

  constructor(
    public accountService: AccountService,
  ) {

  }

  // ngOnInit(): void {
  // }


  ngOnInit(): void {

    this.map = new Map({
      view: new View({
        center: [5931427.30647679, 3701466.9525062423],
        zoom: 5,
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        })
      ],
      target: 'ol-map'
    });

    this.provinceVector = new VectorLayer({
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

    // this.getAllProvince()

  }

  ngAfterViewInit() {
    this.map.setTarget("map");
    this.map.addLayer(this.provinceVector);
    // this.addInteraction();
    this.getAllProvince()

  }


  addInteraction() {
    this.drawInteraction = new Draw({
      source: this.provinceVector.getSource(),
      type: 'Polygon',
    });
    this.drawInteraction.on('drawstart', () => {
      this.drawing = true;
      this.provinceVector.getSource().clear()
    });
    this.drawInteraction.on('drawend', () => {
      this.drawing = false;

    })
    this.map.addInteraction(this.drawInteraction);
  }

  // getAllprovince() {
  //   this.accountService.getAllProvinceTest()
  // }

  getAllProvince() {
    // console.log('hi')
    this.accountService.getAllProvinceTest().pipe(first()).subscribe(provinceData => {
      console.log(provinceData)
      this.addProvinceFeature(provinceData)
      // this.addProvinceFeature(provinceData.coordinates)

    })
  }

  addProvinceFeature(province: any) {
    for (let i = 0; i <= province.length; i++) {
      if (province[i] != undefined) {
        console.log(province[i])
        console.log(province[i].coordinates)
        // this.provinceVector.getSource().clear()
        const feature = new Feature({
          geometry: new Polygon(province[i].coordinates)
        })
        this.provinceVector.getSource().addFeature(feature)
      }
    }
  }
}

