import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountService} from "../../_services";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  returnUrl!: string;
  submitted = false;
  loading = false;


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService
  ) {
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    })


    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() {
    return this.loginForm.controls
  }

  login() {
    this.submitted = true
    if (this.loginForm.invalid) {
      return
    }

    this.loading = true

    this.accountService.login(this.loginForm.value)
      .subscribe(
        data => {

          if (data) {
            this.router.navigate([this.returnUrl])

            console.log('User login successfully')
          } else {
            console.log('not found User')
          }
        },
        error => {
          console.log('error login')
          console.log(error)
          this.loading = false;
        }
      )
  }

}
