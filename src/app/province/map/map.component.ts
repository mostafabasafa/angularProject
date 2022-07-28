import {Component, OnInit} from '@angular/core';
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Draw from 'ol/interaction/Draw';
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Fill, Stroke, Style, Text} from "ol/style";
import {Feature} from "ol";
import {LineString, Polygon} from "ol/geom";
import {coordinates} from "ol/geom/flat/reverse";
import {getArea} from "ol/extent";
import {easeOut} from "ol/easing";
import {AccountService} from "../../_services";
import {first} from "rxjs";
import {Select} from "ol/interaction";
import {feature} from "@turf/turf";
import {Chart} from "angular-highcharts";
import * as Highcharts from 'highcharts';


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
  public selectSingleClick!: Select
  public selected = null
  public menCount: number = 0
  public womenCount: number = 0
  public flag = false
  highcharts: typeof Highcharts = Highcharts;
  updateFlag = false
  data = [
    {
      name: 'مرد',
      y: this.menCount
    }, {
      name: 'زن',
      y: this.womenCount
    }

  ]
  chartOptions: Highcharts.Options = {
    series: [
      {
        type: "pie",
        data: this.data
      }
    ]
  }
  public canvas = document.createElement("canvas")

  constructor(
    public accountService: AccountService,
  ) {


  }



  ngOnInit(): void {

    this.map = new Map({
      view: new View({
        center: [5931427.30647679, 3701466.9525062423],
        zoom: 6,
      }),
      layers: [
        new TileLayer({
          source: new OSM(),
        })
      ],
      target: 'ol-map'
    });

    const country = new Style({
      stroke: new Stroke({
        color: 'gray',
        width: 1,
      }),
      fill: new Fill({
        color: 'rgba(20,20,20,0.9)',
      }),
    });
    const selectedCountry = new Style({
      stroke: new Stroke({
        color: 'rgba(200,20,20,0.8)',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(200,20,20,0.4)',
      }),
    });

    this.provinceVector = new VectorLayer({
      source: new VectorSource(),
      style: (feature): Style => {
        const name = feature.get('name');
        let propertes = feature.getProperties()
        console.log(feature.get('name'))
        const pStyle = new Style({
          stroke: new Stroke({
            color: 'rgba(100, 255, 0, 1)',
            width: 2
          }),
          fill: new Fill({
            color: 'rgba(100, 255, 0, 0.3)',

          }),
          text: new Text({
            text: 'men: ' + feature.get('mencount') + 'women: ' + feature.get('womenCount'),
            font: '15px Calibri,sans-serif',
            fill: new Fill({
              color: 'green'
            }),
            stroke: new Stroke({
              color: '#fff',
              width: 4
            }),

          })

        })
        return pStyle;
      }
    });

    const selected = new Style({
      fill: new Fill({
        color: '#eeeeee',
      }),
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 0.7)',
        width: 2,
      }),
    });

    function selectStyle(): Style {
      const color = '#eeeeee';
      selected.getFill().setColor(color)
      return selected
    }

    this.selectSingleClick = new Select({

      style: selectStyle()
    })

    this.map.on("click", (e) => {
      // console.log(e.pixel)
      console.log(this.provinceVector.getFeatures(e.pixel))
      this.provinceVector.getFeatures(e.pixel).then((feature) => {
        if (feature.length) {
          console.log(feature[0].getProperties())
          console.log(feature[0].get('mencount'))
          console.log(feature[0].get('womenCount'))

          this.flag = true
          this.handleUpdate(feature[0].get('mencount'), feature[0].get('womenCount'))


        }
      })
    })




  }

  ngAfterViewInit() {
    this.map.setTarget("map");
    this.map.addLayer(this.provinceVector);
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


  getAllProvince() {
    this.accountService.getAllProvinceTest().pipe(first()).subscribe(provinceData => {
      console.log(provinceData)
      this.addProvinceFeature(provinceData)

    })
  }

  addProvinceFeature(province: any) {
    for (let i = 0; i <= province.length; i++) {
      if (province[i] != undefined) {
        console.log(province[i])
        console.log(province[i].coordinates)
        const feature = new Feature({
          geometry: new Polygon(province[i].coordinates)
        })
        console.log(province[i].menCount)
        feature.setProperties({
            name: province[i].province,
            mencount: Number(province[i].menCount),
            womenCount: Number(province[i].womenCount)
          }
        )
        this.provinceVector.getSource().addFeature(feature)
      }
    }
  }

  handleUpdate(menCount: number, womenCount: number) {
    this.chartOptions.title = {
      text: 'updated'
    };

    // @ts-ignore
    this.chartOptions.series[0] = {
      type: 'pie',
      data: [
        {name: 'مرد', y: menCount},
        {name: 'زن', y: womenCount}
      ]
    }

    this.updateFlag = true;
  }

}

