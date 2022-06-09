import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AccountService} from "../../_services";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Province} from "../../_models/province";
import Map from "ol/Map";
import Draw, {DrawEvent} from "ol/interaction/Draw";
import VectorLayer from "ol/layer/Vector";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import {Fill, Stroke, Style} from "ol/style";
import {Polygon} from "ol/geom";
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Inject} from '@angular/core';
import {first} from "rxjs";
import {Feature} from "ol";
import {Modify, Snap,} from "ol/interaction";
import {isNull} from "ol/format/filter";

@Component({
  selector: 'app-addprovince',
  templateUrl: './addprovince.component.html',
  styleUrls: ['./addprovince.component.css']
})
export class AddprovinceComponent implements OnInit, AfterViewInit {
  hide = true;
  disabled = false
  loading = false
  addProvinceForm: FormGroup;
  id!: string;
  submitted!: boolean;
  provinces: Province[] = []
  map!: Map;
  typeSelect = document.getElementById('type');
  drawInteraction !: Draw
  baseVector !: VectorLayer<any>
  public drawVector !: VectorLayer<any>
  public drawing = false;
  public coordinates: any
  public state!: string
  public snap: any


  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    public dialogRef: MatDialogRef<AddprovinceComponent>,
    public snackbarSuccessAddUser: MatSnackBar,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.state = this.data.state
    if (this.state == 'preview') {
      this.addProvinceForm = this.formBuilder.group({
          province: [{value: '', disabled: true}, Validators.required],
          coordinates: [[], Validators.required],
          area: [{value: '', disabled: true}, Validators.required],
          menCount: [{value: '', disable: true}, Validators.required],
          womenCount: [{value: '', disable: true}, Validators.required],

        }
      );
    } else {
      this.addProvinceForm = this.formBuilder.group({
          province: ['', Validators.required],
          coordinates: [[], Validators.required],
          area: [{value: '', disabled: true}, Validators.required],
          menCount: ['', Validators.required],
          womenCount: ['', Validators.required],

        }
      );
    }
  }

  ngOnInit(): void {
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

    this.drawVector = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(100, 255, 0, 1)',
          width: 2,
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
    if (this.state != 'preview') {
      this.addInteraction();
    }

    if (this.state == 'preview') {
      this.showFeature(this.data.id)
    }
    if (this.state == 'edit') {
      this.editFeature(this.data.id)

    }
  }

  createProvince() {

    this.accountService.setProvinceTest(this.addProvinceForm.getRawValue()).subscribe(
      data => {
        console.log('User added successfully')
        this.snackbarSuccessAddUser
          .open('استان با موفقیت اضافه شد.', 'باشه', {
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


  addFeature(coordinates: any) {
    const feature = new Feature({
      geometry: new Polygon(coordinates)
    })
    this.drawVector.getSource().addFeature(feature)

    // zoom to polygon
    this.map.getView().fit(this.drawVector.getSource().getFeatures()[0].getGeometry())
  }


  addInteraction() {
    this.drawInteraction = new Draw({
      source: this.drawVector.getSource(),
      type: 'Polygon'
    });
    if (this.state == 'edit') {
      this.snap = new Snap({source: this.drawVector.getSource()});
      this.map.addInteraction(this.snap)

    } else {
      this.drawInteraction.on('drawstart', () => {
        this.drawVector.getSource().clear()
        this.addProvinceForm.get('area')?.setValue('')
      });

      this.drawInteraction.on('drawend', (e: DrawEvent) => {
        const geom = e.feature.getGeometry()
        if (geom instanceof Polygon) {
          this.addProvinceForm.get('area')?.setValue(geom.getArea())
          this.addProvinceForm.get('coordinates')?.setValue(geom.getCoordinates())
        }
      })
      this.map.addInteraction(this.drawInteraction);
    }
  }

  showFeature(provinceId: number) {
    this.accountService.getProvinceTestById(provinceId).pipe(first())
      .subscribe(data => {
        console.log(data)
        this.addFeature(data.coordinates)
        this.addProvinceForm.get('area')?.setValue(data.area)
        this.addProvinceForm.get('province')?.setValue(data.province)
        this.addProvinceForm.get('menCount')?.setValue(data.menCount)
        this.addProvinceForm.get('womenCount')?.setValue(data.womenCount)

      })
  }

  editFeature(provinceId: number) {
    this.accountService.getProvinceTestById(provinceId).pipe(first())
      .subscribe(data => {
        this.addFeature(data.coordinates)
        this.addProvinceForm.get('area')?.setValue(data.area)
        this.addProvinceForm.get('province')?.setValue(data.province)
        this.addProvinceForm.get('menCount')?.setValue(data.menCount)
        this.addProvinceForm.get('womenCount')?.setValue(data.womenCount)


      })

    const modify = new Modify({
      source: this.drawVector.getSource(),
    });
    this.map.addInteraction(modify)
  }


  editProvince() {
    this.addProvinceForm.get('coordinates')?.setValue(this.drawVector.getSource().getFeatures()[0].getGeometry().getCoordinates())
    console.log(this.drawVector.getSource().getFeatures()[0].getGeometry().getArea())
    this.addProvinceForm.get('area')?.setValue(this.drawVector.getSource().getFeatures()[0].getGeometry().getArea())

    console.log(this.addProvinceForm.value)
    this.accountService.updateProvince(this.data.id, this.addProvinceForm.getRawValue()).subscribe(
      data => {
        console.log('User edited successfully')
        this.snackbarSuccessAddUser
          .open('استان با موفقیت ویرایش شد.', 'باشه', {
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

  removeFeature() {
    this.drawVector.getSource().clear()
    this.state = 'add'
    this.drawInteraction.on('drawstart', () => {
      this.drawVector.getSource().clear()
      this.addProvinceForm.get('area')?.setValue('')
    });

    this.drawInteraction.on('drawend', (e: DrawEvent) => {
      const geom = e.feature.getGeometry()
      if (geom instanceof Polygon) {
        this.addProvinceForm.get('area')?.setValue(geom.getArea())
        this.addProvinceForm.get('coordinates')?.setValue(geom.getCoordinates())
      }
    })
    this.map.addInteraction(this.drawInteraction);

    this.addProvinceForm.get('area')?.setValue(this.drawVector.getSource().getFeatures()[0].getGeometry().getArea())

  }

}
