import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {PaaswordValidator} from "../../_services/paasword-validator";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountService} from "../../_services";
import {first} from "rxjs";
import {UsersListComponent} from "../users-list/users-list.component";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";

interface Province {
  value: number
  viewValue: string
}
interface Cities{
  value: number
  viewValue: string
}

interface DialogData {
  province: number;
  id: number
}


@Component({
  selector: 'app-edituser',
  templateUrl: './edituser.component.html',
  styleUrls: ['./edituser.component.css']
})
export class EdituserComponent implements OnInit {
  hide = true;
  id!: number;
  editUserForm!: FormGroup
  activity1 = new FormControl(false)
  submitted = false;
  edituer!: EdituserComponent
  provinceID!: number
  provinces: Province[] = []
  cities: Cities[] = []

  @ViewChild(UsersListComponent) id1!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialogRef: MatDialogRef<EdituserComponent>,
    public snackbarSuccessEdit: MatSnackBar,
  ) {
  }

  ngOnInit(): void {

    this.id = this.data.id
    this.provinceID= this.data.province

    const passwordValidators = [Validators.minLength(6)];

    this.accountService.getProvince().pipe(first())
      .subscribe(data =>{
        // console.log(data[5].provinceID)
        for(let i=0; i< data.length; i++) {
          this.provinces.push({value: i + 1, viewValue: data[i].province})
        }

      })


    this.editUserForm = this.formBuilder.group({

      userName: [['', Validators.required]],
      birthDay: [['', Validators.required]],
      gender: [['', Validators.required]],
      province: [['', Validators.required]],
      city: [['', Validators.required]],
      activity: this.activity1,
      password: [['', [passwordValidators, Validators.required]]],
      confirm_password: [['', passwordValidators]]
    }, {
      validator: PaaswordValidator.MatchPassword
    });

    this.accountService.getById(this.id)
      .pipe(first())
      .subscribe(user => {
        // console.log(user.province)
        this.getProvinceID(user.province)
        this.f['userName'].setValue(user.userName)
        this.f['birthDay'].setValue(user.birthDay)
        this.f['gender'].setValue(user.gender)
        this.f['password'].setValue(user.password)
        this.f['confirm_password'].setValue(user.password)
        this.f['activity'].setValue(user.activity)
        this.f['province'].setValue(user.province)
        this.f['city'].setValue(user.city)
        // console.log(user)
      })
  }

  get f() {
    return this.editUserForm.controls;
  }


  updateUser() {
    this.accountService.update(this.id, this.editUserForm.value).pipe(first())
      .subscribe(data => {
        console.log('Update Successful')
        this.snackbarSuccessEdit.open('کاربر با موفقیت ویرایش شد.', 'باشه', {
          duration: 4000,
          direction: "rtl",
          horizontalPosition: "center",
        })

        this.dialogRef.close(data)
      }, error => {
        console.log(error)
      })
  }

  getProvinceID(province: any){
    // console.log('aaaaaaaaa')
    // this.cities=[]
    // console.log(province)
    this.accountService.getCity(province).pipe(first())
      .subscribe(data => {
      // console.log(data[0].city)
      this.cities=[]
      for(let i=0; i< data.length; i++){
        // console.log(data[i].city)
          this.cities.push({value: data[i].id, viewValue: data[i].city})
        }
        // console.log(this.cities)
    })
  }

}
