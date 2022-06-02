import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UsersListComponent} from "../../user/users-list/users-list.component";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountService} from "../../_services";
import {MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {first} from "rxjs";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";


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
  addProvinceForm!: FormGroup;
  id!: string;
  isAddmode!: boolean;
  submitted!: boolean;
  activity1 = new FormControl(false)
  a!: UsersListComponent
  provinces: Province[] = []
  addcityForm!: FormGroup;
  map!: Map;


  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    public dialogRef: MatDialogRef<AddcityComponent>,
    public snackbarSuccessAddUser: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.accountService.getProvince().pipe(first())
      .subscribe(data => {
        // console.log(data[5].provinceID)
        for (let i = 0; i < data.length; i++) {
          this.provinces.push({value: i + 1, viewValue: data[i].province})
        }
        // console.log(this.provinces)
      })

    this.addcityForm = this.formBuilder.group({
      city: [['', Validators.required]],
      provinceID: [['', Validators.required]]

    }
      );

    this.f['city'].setValue('')
    this.f['provinceID'].setValue('')

    // create map
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

  }

  ngAfterViewInit() {
    this.map.setTarget("map");

  }


  get f() {
    return this.addcityForm.controls;
  }

  createCity() {

    this.accountService.setCity(this.addcityForm.value)
      .pipe(first())
      .subscribe(
        data => {
          console.log('User added successfully')
          this.snackbarSuccessAddUser
            .open('شهر با موفقیت اضافه شد.', 'باشه', {
              duration: 4000,
              direction: "rtl",
              horizontalPosition:"center",
            })
          this.dialogRef.close(data)

          // this.router.navigate(['.', {relativeTo: this.route}])
        },
        error => {
          console.log('error add')
          console.log(error)
          this.loading = false;
        }
      )

  }

}
