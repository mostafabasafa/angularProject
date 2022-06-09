import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {AccountService} from "../../_services";
import {first} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";

interface DialogData{
  id:number,
  username: string
}

@Component({
  selector: 'app-deleteuser',
  templateUrl: './deleteuser.component.html',
  styleUrls: ['./deleteuser.component.css']
})
export class DeleteuserComponent implements OnInit {
  username!: string;
  id!: number;
  message!:string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private accountService: AccountService,
    public snacbarDeleteUser: MatSnackBar

  ) { }

  ngOnInit(): void {
    this.id=this.data.id
    this.username=this.data.username
    // console.log(this.id)
    // console.log(this.username)
  }

  deleteUser(){
    console.log('inja user delete mishe')
    this.accountService.delete(this.id).pipe(first())
      .subscribe(x => {
        console.log('delete '+ this.username)
        this.message=this.username+ ' با موفقیت حذف شد. '
        this.snacbarDeleteUser.open(this.message, 'باشه', {
          duration: 4000,
          direction: "rtl",
          horizontalPosition: "center",
        })

      },error => {
        console.log('error delete')
        console.log(error)
        }
        )
  }

}
