import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AccountService} from "../../_services";
import {ActivatedRoute, Route, Router} from "@angular/router";
import {first} from "rxjs";
import {THREE} from "@angular/cdk/keycodes";
import {ConfirmedValidator} from "../../_services/confirmed.validator";
import {PaaswordValidator} from "../../_services/paasword-validator";
import {UsersListComponent} from "../users-list/users-list.component";
import {MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";

interface Province {
  value: number
  viewValue: string
}
interface Cities{
  value: number
  viewValue: string
}

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.component.html',
  styleUrls: ['./adduser.component.css']
})
export class AdduserComponent implements OnInit {
  hide = true;
  disabled = false
  loading = false
  addUserForm!: FormGroup;
  id!: string;
  isAddmode!: boolean;
  submitted!: boolean;
  activity1 = new FormControl(false)
  a!: UsersListComponent
  cities: Cities[]=[]
  provinces: Province[] = []



  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    public dialogRef: MatDialogRef<AdduserComponent>,
    public snackbarSuccessAddUser: MatSnackBar
  ) {
  }


  getErrorMessage() {
    console.log()
  }


  ngOnInit(): void {
    this.isAddmode = !this.id;

    const passwordValidators = [Validators.minLength(6)]
    if (this.isAddmode) {
      passwordValidators.push(Validators.required);
    }
    this.accountService.getProvince().pipe(first())
      .subscribe(data =>{
        // console.log(data[5].provinceID)
        for(let i=0; i< data.length; i++) {
          this.provinces.push({value: i + 1, viewValue: data[i].province})
        }
        // console.log(this.provinces)
      })

    this.addUserForm = this.formBuilder.group({
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

    this.f['userName'].setValue('')
    this.f['birthDay'].setValue('')
    this.f['gender'].setValue('1')
    this.f['password'].setValue('')
    this.f['confirm_password'].setValue('')
    this.f['activity'].setValue('')
    this.f['province'].setValue('')
    this.f['city'].setValue('')


  }

  get f() {
    return this.addUserForm.controls;
  }


  onSubmit() {
    this.submitted = true;

    if (this.addUserForm.invalid) {
      return
    }

    this.loading = true;
    if (this.isAddmode) {
      this.createUser()
    }

  }

  createUser() {

    this.accountService.addUser(this.addUserForm.value)
      .pipe(first())
      .subscribe(
        data => {
          console.log('User added successfully')
          this.snackbarSuccessAddUser
            .open('کاربر با موفقیت اضافه شد.', 'باشه', {
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

  getProvinceID(province: any){
    // console.log('aaaaaaaaaa')
    // console.log(province.value)
    this.accountService.getCity(province.value).pipe(first())
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
