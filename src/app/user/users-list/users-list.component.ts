import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {MatDialog} from "@angular/material/dialog";
import {AdduserComponent} from "../adduser/adduser.component";
import {AccountService} from "../../_services";
import {elementAt, first} from "rxjs";
import {User} from "../../_models/user";
import {EdituserComponent} from "../edituser/edituser.component";
import {DeleteuserComponent} from "../deleteuser/deleteuser.component";
import * as moment from "jalali-moment";
import {parse} from "@angular/compiler/src/render3/view/style_parser";


export enum GenderType {
  MALE = 1,
  FEMALE = 2
}


@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  displayedColumns: string[] = ['userName', 'birthDay', 'gender', 'province', 'city', 'activity', 'management'];
  dataSource!: MatTableDataSource<User>;
  users = null as any;
  dataSource1 = new MatTableDataSource<User>();
  public userID!: number;
  public userName!: string;
  public province!: string;
  public provinceID!: number;
  public length: number = 0;
  public length2: number = 0;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  pageEvent!: PageEvent;
  page!: number
  tempId: number | undefined
  count3!: string | null
  count4!: number

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  // @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;
  @ViewChild(MatTable) table: MatTable<User> | undefined

  constructor(
    public dialog: MatDialog,
    private accountService: AccountService
  ) {


  }


  getAllUser() {


    this.accountService.getAll()
      .subscribe(allUsers => {


        // this.province=this.dataSource1.data[0].province
        this.dataSource1 = new MatTableDataSource<User>(allUsers)
        // this.getProvince()
        for (let i = 0; i < this.dataSource1.data.length; i++) {
          this.accountService.getProvinceById(this.dataSource1.data[i].province).pipe(first())
            .subscribe(data => {
              // console.log(data.province)
              this.dataSource1.data[i].province = data.province

              // return data.province
            }),
            this.accountService.getCityById(this.dataSource1.data[i].city).pipe(first())
              .subscribe(data => {
                // console.log(data.city)
                this.dataSource1.data[i].city = data.city

                // return data.province
              })

        }


        // this.dataSource1.data[0].province=(this.dataSource1.data[0].province).toString()

      });

  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    console.log(filterValue)

    this.accountService.searchAllUser(filterValue).pipe(first()).subscribe(user => {
      console.log(user)

      this.dataSource1 = new MatTableDataSource<User>(user)

    })

    // this.dataSource1.filter = filterValue.trim().toLowerCase();
    //
    // if (this.dataSource1.paginator) {
    //   this.dataSource1.paginator.firstPage();
    // }
  }

  ngOnInit(): void {
    // this.getAllUser()
    this.page = 1

    this.paginate(this.page, this.pageSize)

    this.accountService.userCount().subscribe(resp => {
        console.log(resp.headers.get('X-Total-Count'))
      }
    )


  }

  openAddUser() {

    this.length2 = this.length
    this.dialog.open(AdduserComponent, {}).afterClosed()
      .subscribe(data => {
        if (data == undefined) {
          // console.log('not ID')
          this.tempId = 0
        } else {
          let pageCurrent = Math.floor(((this.length) / this.pageSize)) + 1
          this.paginate(pageCurrent, this.pageSize)
        }


        //     this.accountService.getAll().pipe(first()).subscribe(allUser =>{
        //   console.log(allUser.length)
        //   this.length=allUser.length
        // }),
        // this.getAllUser()
        // console.log('after '+ this.lenn b mxgth)
        // console.log('now '+this.length)
        // console.log('add user success')

        // console.log(this.page)

      })
  }

  openEditUser(id: number, provinceID2: number) {
    this.userID = id
    this.provinceID = provinceID2
    this.dialog.open(EdituserComponent, {
      data: {id: this.userID, provinceId: this.provinceID}
    }).afterClosed()
      .subscribe(data => {

        if (data == undefined) {
          this.tempId = 0
        } else {
          console.log(data)
          this.paginate(this.page, this.pageSize)
        }

      })
  }

  openDeleteUser(id: number, username: string) {
    this.userID = id
    this.userName = username
    this.dialog.open(DeleteuserComponent, {
      data: {id: this.userID, username: this.userName}
    }).afterClosed().subscribe(data => {
        // console.log(data)
        if (data == undefined) {
          this.tempId = 0
        } else {
          this.paginate(this.page, this.pageSize)
        }

      }
      // this.getAllUser()
    )
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    console.log(setPageSizeOptionsInput)
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
      console.log(this.pageSizeOptions)

    }
  }

  ngAfterViewInit() {
    this.dataSource1.paginator = this.paginator;
  }

  onChangePage(pe: PageEvent) {
    // console.log(pe.pageIndex);
    // console.log(pe.pageSize);
    this.page = pe.pageIndex + 1
    this.paginate(this.page, pe.pageSize)
  }

  paginate(page: number, pageSize: number) {
    // this.accountService.getAll().pipe(first()).subscribe(allUser => {
    //   // console.log(allUser.length)
    //   this.length = allUser.length
    // }),
    if (this.length == 0) {
      this.accountService.userCount().subscribe(resp => {
        // this.count1 = resp.headers.get('X-Total-Count')
        this.count3 = resp.headers.get('X-Total-Count')

        if (typeof this.count3 === "string") {
          this.count4 = parseInt(this.count3)
        }
        // @ts-ignore
        console.log(typeof (parseInt(this.count4)))

        this.length = this.count4

        // this.length= resp.headers.get('X-Total-Count')
      })
    }

    this.accountService.paginate(page, pageSize).pipe(first())
      .subscribe(user => {


        // const a=moment()
        this.dataSource1 = new MatTableDataSource<User>(user)
        // this.getProvince()
        for (let i = 0; i < this.dataSource1.data.length; i++) {

          user[i].birthDay = moment(user[i].birthDay, 'YYYY/MM/DD').locale('fa').format('YYYY/MM/DD'); // it would be in jalali system


          this.accountService.getProvinceById(this.dataSource1.data[i].province).pipe(first())
            .subscribe(data => {

              this.dataSource1.data[i].province = data.province

              // return data.province
            }),
            this.accountService.getCityById(this.dataSource1.data[i].city).pipe(first())
              .subscribe(data => {
                // console.log(data.city)
                this.dataSource1.data[i].city = data.city

                // return data.province
              })

        }

      })
  }

  onRightClick(flag:number,e:Event) {
    if(flag==0){
      // console.log(0)
      return false
    } else{
      e.stopPropagation()
      // console.log(1)
      return true
    }
  }





}


