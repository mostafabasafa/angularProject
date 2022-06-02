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
import {Geometry, Polygon} from "ol/geom";
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Inject} from '@angular/core';
import {first} from "rxjs";
import {Feature} from "ol";
import {Modify, Select, defaults as defaultInteractions, Snap,} from "ol/interaction";
import {ModifyEvent} from "ol/interaction/Modify";

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
  public extend!: []


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
          area: [{value: '', disabled: true}, Validators.required]

        }
      );
    } else {
      this.addProvinceForm = this.formBuilder.group({
          province: ['', Validators.required],
          coordinates: [[], Validators.required],
          area: [{value: '', disabled: true}, Validators.required]

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
    // if(this.state!= 'add'){
    //   this.getProvince(this.data.id)
    // }

  }


  createProvince() {
    // this.addProvinceForm.get('coordinates')?.setValue(this.drawVector.getSource().getFeatures()[0].getGeometry().getCoordinates())
    // this.addProvinceForm.get('area')?.setValue(this.drawVector.getSource().getFeatures()[0].getGeometry().getArea())
    console.log(this.addProvinceForm)
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

  addFeature(coordinates: any) {
    const feature = new Feature({
      geometry: new Polygon(coordinates)
    })
    this.drawVector.getSource().addFeature(feature)
  }


  addInteraction() {
    this.drawInteraction = new Draw({
      source: this.drawVector.getSource(),
      type: 'Polygon'
    });
    if (this.state == 'edit') {
      // this.map.addInteraction(this.drawInteraction);
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
          console.log('tesat')
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
        this.addFeature(data.coordinates)
      })
  }

  editFeature(provinceId: number) {
    this.accountService.getProvinceTestById(provinceId).pipe(first())
      .subscribe(data => {
        this.addFeature(data.coordinates)
        console.log(data)
          this.addProvinceForm.get('area')?.setValue(data.area)
        this.addProvinceForm.get('province')?.setValue(data.province)

      })

    const modify = new Modify({
      source: this.drawVector.getSource(),
    });
    console.log(modify)
    this.map.addInteraction(modify)
    modify.on('modifyend',(e)=>{

    })
    }


  editProvince() {
    this.addProvinceForm.get('coordinates')?.setValue(this.drawVector.getSource().getFeatures()[0].getGeometry().getCoordinates())
    console.log(this.drawVector.getSource().getFeatures()[0].getGeometry().getArea())
    this.addProvinceForm.get('area')?.setValue(this.drawVector.getSource().getFeatures()[0].getGeometry().getArea())

    console.log(this.addProvinceForm.value)
    this.accountService.updateProvince(this.data.id,this.addProvinceForm.value).subscribe(
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
}
