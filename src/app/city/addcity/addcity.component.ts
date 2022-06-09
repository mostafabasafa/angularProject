import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UsersListComponent} from "../../user/users-list/users-list.component";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountService} from "../../_services";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {first} from "rxjs";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import {MatSelectChange} from "@angular/material/select";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Fill, Stroke, Style} from "ol/style";
import {Feature} from "ol";
import {Point, Polygon} from "ol/geom";
import Draw, {DrawEvent} from "ol/interaction/Draw";
import {Modify, Snap} from "ol/interaction";
import {fromLonLat} from "ol/proj";
import CircleStyle from "ol/style/Circle";
import {booleanPointInPolygon, intersect, point, polygon} from "@turf/turf";
import {ModifyEvent} from "ol/interaction/Modify";


interface Province {
  value: number
  viewValue: string
}

@Component({
  selector: 'app-addcity',
  templateUrl: './addcity.component.html',
  styleUrls: ['./addcity.component.css']
})
export class AddcityComponent implements OnInit {
  hide = true;
  disabled = false
  loading = false
  id!: string;
  isAddmode!: boolean;
  submitted!: boolean;
  a!: UsersListComponent
  provinces: Province[] = []
  addcityForm!: FormGroup;
  public map!: Map;
  public provincewAreaVector !: VectorLayer<any>
  public state!: string;
  public drawCity!: Draw
  public cityVecror!: VectorLayer<any>
  public modify!: Modify
  public provinceCoordinates: any
  public view!: View
  public provinceName: string = ''
  private snap!: Snap;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    public dialogRef: MatDialogRef<AddcityComponent>,
    public snackbarSuccessAddUser: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.state = data.state
    if (this.state == 'preview') {
      this.addcityForm = this.formBuilder.group({
          city: [{value: '', disabled: true}, Validators.required],
          province: [{value: '', disabled: true}, Validators.required],
          coordinates: [[], Validators.required],


        }
      );
    } else {
      this.addcityForm = this.formBuilder.group({
          city: ['', Validators.required],
          province: ['', Validators.required],
          coordinates: [[], Validators.required],

        }
      );
    }
  }

  ngOnInit(): void {
    this.accountService.getProvinceNameTest().pipe(first())
      .subscribe(data => {
        // console.log(data[5].provinceID)
        for (let i = 0; i < data.length; i++) {
          this.provinces.push({value: data[i].id, viewValue: data[i].province})
        }
        // console.log(this.provinces)
      })


    // create map
    this.state = this.data.state
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

    this.provincewAreaVector = new VectorLayer({
      source: new VectorSource(),
      zIndex: 3,
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(100, 255, 0, 1)',
          width: 2,

        }),
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',

        }),

      })
    });

    this.cityVecror = new VectorLayer({
      source: new VectorSource(),
      zIndex: 2,
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(100, 255, 0, 1)',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(100, 255, 0, 0.3)',
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33',
          }),
        })

      })
    });
    this.view = new View({
      center: [0, 0],
      zoom: 1,
    });
  }

  ngAfterViewInit() {
    this.map.setTarget("map");
    this.map.addLayer(this.provincewAreaVector);
    this.map.addLayer(this.cityVecror)
    if (this.state == 'preview') {
      this.showFeature(this.data.id)
    }
    if (this.state == 'edit') {
      this.editFeature(this.data.id)

    }

  }


  // get f() {
  //   return this.addcityForm.controls;
  // }

  createCity() {
    console.log(this.addcityForm.value)
    this.accountService.setCityTest(this.addcityForm.value)
      .pipe(first())
      .subscribe(
        data => {
          console.log('User added successfully')
          this.snackbarSuccessAddUser
            .open('شهر با موفقیت اضافه شد.', 'باشه', {
              duration: 4000,
              direction: "rtl",
              horizontalPosition: "center",
            })
          this.dialogRef.close(data)
        },
        error => {
          console.log('error add')
          console.log(error)
          this.loading = false;
        }
      )

  }

  getProvinceID(provinceId: MatSelectChange) {
    console.log(provinceId.value.value)
    this.accountService.getProvinceTestById(provinceId.value.value).subscribe(provinceData => {
      this.addProvinceFeature(provinceData.coordinates)

    })
  }

  addProvinceFeature(coordinates: any) {
    this.provinceCoordinates = coordinates
    console.log(this.provinceCoordinates)

    this.provincewAreaVector.getSource().clear()
    const feature = new Feature({
      geometry: new Polygon(coordinates)
    })
    this.provincewAreaVector.getSource().addFeature(feature)
    // this.view.fit(this.provincewAreaVector.getSource().getFeatures()[0].getGeometry(),{padding: [170,50, 30, 150]})
    this.map.getView().fit(this.provincewAreaVector.getSource().getFeatures()[0].getGeometry())

    this.addCityFeature();

  }

  addCityFeature() {
    var poly = polygon(this.provinceCoordinates)
    var pt
    var isPointInPolygon
    this.drawCity = new Draw({
      condition: function (e) {
        let coord = e.coordinate
        console.log(coord)
        pt = point(coord)
        isPointInPolygon = booleanPointInPolygon(pt, poly)
        console.log(booleanPointInPolygon(pt, poly))
        if (isPointInPolygon == true) {
          return true
        } else {
          return false
        }
        return true
      },
      source: this.cityVecror.getSource(),
      type: 'Point',
    });
    this.drawCity.on("drawstart", (e) => {
      this.cityVecror.getSource().clear()

    })
    this.drawCity.on("drawend", (e) => {
      let geom = e.feature.getGeometry()
      if (geom instanceof Point) {

        this.addcityForm.get('coordinates')?.setValue(geom.getCoordinates())


      }

    })

    this.map.addInteraction(this.drawCity);


  }

  addPointFeature(coordinates: any) {
    const feature = new Feature({
      geometry: new Point(fromLonLat(coordinates)),
      labelPoint: new Point(fromLonLat(coordinates)),
      size: 10

    })
    this.provincewAreaVector.getSource().addFeature(feature)
  }


  private editFeature(cityId: number) {
    this.accountService.getCityTestById(cityId).pipe(first())
      .subscribe(data => {
        this.addFeature(data.coordinates)
        this.addcityForm.get('city')?.setValue(data.city)
        // this.provinceName= data.province
        this.addcityForm.get('province')?.setValue(data.province)
        // console.log(this.addcityForm.value)
      })
    var poly = polygon(this.provinceCoordinates)
    var pt
    var isPointInPolygon
    const modify = new Modify({
      // condition: function (e) {
      //   // let coord = e.coordinate
      //   // console.log(coord)
      //   // pt = point(coord)
      //   // isPointInPolygon = booleanPointInPolygon(pt, poly)
      //   // console.log(booleanPointInPolygon(pt, poly))
      //   // if (isPointInPolygon == false) {
      //   //   return true
      //   // } else {
      //   //   return false
      //   // }
      //   // return true
      //   return false
      // },
      source: this.cityVecror.getSource(),
    });
    this.map.addInteraction(modify)
    this.snap = new Snap({source: this.cityVecror.getSource()});
    this.map.addInteraction(this.snap)


  }

  private showFeature(cityId: number) {
    console.log(cityId)
    this.accountService.getCityTestById(cityId).pipe(first())
      .subscribe(data => {
        console.log(data)
        this.addFeature(data.coordinates)
        this.addcityForm.get('city')?.setValue(data.city)
        this.addcityForm.get('province')?.setValue(data.province)
        console.log(this.addcityForm.value)
      })
  }

  private addFeature(coordinates: any) {
    const feature = new Feature({
      geometry: new Point(coordinates)
    })
    this.cityVecror.getSource().addFeature(feature)

    // zoom to polygon
    this.map.getView().fit(this.cityVecror.getSource().getFeatures()[0].getGeometry(), {maxZoom: 8})
  }

  editCity() {

  }

  checkProvince = (valueOption: Province, provinceName: string) => {
    if (valueOption.viewValue === provinceName) {
      console.log(typeof (valueOption.value))
      this.accountService.getProvinceTestById(valueOption.value).subscribe(provinceData => {
        this.addProvinceFeature(provinceData.coordinates)

      })
    }
    return valueOption.viewValue === provinceName;
  }

  removeFeature() {

    this.cityVecror.getSource().clear()
    this.state = 'add'

    this.addCityFeature()


  }
}
