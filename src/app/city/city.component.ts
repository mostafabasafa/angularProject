import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatTable, MatTableDataSource} from "@angular/material/table";

import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AccountService} from "../_services";
import {MatSnackBar} from "@angular/material/snack-bar";
import {first, Subject} from "rxjs";
import {City} from "../_models/city";
import {AdduserComponent} from "../user/adduser/adduser.component";
import {AddcityComponent} from "./addcity/addcity.component";
import {PageEvent} from "@angular/material/paginator";
import {ExcelService} from "../_services/excel.service";
import * as XLSX from "xlsx";


interface Province {
  value: number
  viewValue: string
}

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements OnInit {
  displayedColumns: string[] = ['id', 'city', 'province'];
  dataSource1!: MatTableDataSource<City>;
  addProvinceForm!: FormGroup;
  public dialogRef!: MatDialogRef<any>
  provinces: Province[] = []
  @ViewChild('upload_excel') inputFile!: ElementRef
  spinnerEnabled = false;
  keys!: string[];
  datasheet = new Subject()
  // @ViewChild('inputFile') inputFile!: ElementRef;
  isExcelFile!: boolean

  @ViewChild(MatTable) table: MatTable<City> | undefined
  // @ts-ignore
  columnsToDisplay: [string] = this.displayedColumns.slice();
  private tempId!: number;
  public page!: number;
  public length: number = 1;
  public id!: number;
  private pageSize: number = 5;

  constructor(
    public dialog: MatDialog,
    private accountService: AccountService,
    private formBuilder: FormBuilder,
    public snackbarSuccessAddUser: MatSnackBar,
    public excelService: ExcelService,
  ) {


  }

  ngOnInit(): void {
    this.accountService.getAllCity().pipe(first()).subscribe(allCity => {
      // console.log(allCity)
      this.length = allCity.length
      // console.log(this.length)
    })
    this.accountService.paginateAllCityTest(1,5).pipe(first()).subscribe(allCity =>{
      this.dataSource1 = new MatTableDataSource<City>(allCity)
    })
    // this.getAllCity()
    this.accountService.getProvince().pipe(first())
      .subscribe(data => {
        // console.log(data[5].provinceID)
        for (let i = 0; i < data.length; i++) {
          this.provinces.push({value: i + 1, viewValue: data[i].province})
        }
        // console.log(this.provinces)
      })

    this.addProvinceForm = this.formBuilder.group({
      province: [['', Validators.required]],

    })
    this.f['province'].setValue('')

  }

  get f() {
    return this.addProvinceForm.controls;
  }


  getProvinceID(province: any) {
    // console.log(province.value)
    this.id = province.value
    this.accountService.getCity(this.id).pipe(first()).subscribe(allCity => {
      // console.log(allCity)
      this.length = allCity.length
      // console.log(this.length)
    })

    // console.log(province.value)
    this.accountService.paginateCity(province.value, 1, 5).subscribe(allCity => {
      // console.log(allCity)
      // @ts-ignore
      this.dataSource1 = new MatTableDataSource<Province>(allCity)
      // console.log(this.dataSource1.data)
    })
  }

  createProvince() {
    this.accountService.setCity(this.addProvinceForm.value)
      .pipe(first())
      .subscribe(
        data => {
          console.log('User added successfully')
          this.snackbarSuccessAddUser
            .open('?????? ???? ???????????? ?????????? ????.', '????????', {
              duration: 4000,
              direction: "rtl",
              horizontalPosition: "center",
            })
          this.dialogRef.close(data)
          // this.getAllProvince()
          // this.router.navigate(['.', {relativeTo: this.route}])
        },
        error => {
          console.log('error add')
          console.log(error)
        }
      )
  }

  openAddCity() {

    // this.length2 = this.length
    this.dialog.open(AddcityComponent, {}).afterClosed()
      .subscribe(data => {
        if (data == undefined) {
          // console.log('not ID')
          this.tempId = 0
        } else {

          this.accountService.getCity(data.provinceID).pipe(first()).subscribe(city => {
              // console.log(city.length)
              this.length = city.length

              // console.log(this.length)
              // console.log(this.pageSize)
              let pageCurrent = Math.floor(((this.length) / this.pageSize)) + 1
              // console.log(pageCurrent)
              this.paginate(data.provinceID, pageCurrent, this.pageSize)

            }
          )
        }
      })
  }

  onChangePage(pe: PageEvent) {
    this.page = pe.pageIndex + 1
    if (this.id==undefined) {
      this.paginateAllCity(this.page, pe.pageSize)
    }else {
      this.paginate(this.id, this.page, pe.pageSize)
    }

  }

  paginate(id: number, page: number, pageSize: number) {


    this.accountService.paginateCity(id, page, pageSize).pipe(first())
      .subscribe(Province => {

        // @ts-ignore
        this.dataSource1 = new MatTableDataSource<Province>(Province)
        // this.getProvince()
        // for (let i = 0; i < this.dataSource1.data.length; i++) {
        //
        //
        //
        // }

      })
  }

  paginateAllCity(page: number, pageSize: number) {
    this.accountService.getAllCity().pipe(first()).subscribe(allProvice => {
      this.length = allProvice.length
    }),

      this.accountService.paginateAllCityTest(page, pageSize).pipe(first())
        .subscribe(City => {

          // @ts-ignore
          this.dataSource1 = new MatTableDataSource<City>(City)
          // this.getProvince()
          for (let i = 0; i < this.dataSource1.data.length; i++) {


          }

        })
  }

  exportAsXLSX():void{
    this.accountService.getAllCity().pipe(first()).subscribe(data =>{
      console.log(data)
      this.excelService.exportAsExcelFile(data, 'city')
    })
  }

  importAsXLSX(evt: any) {
    let data: any[], header;
    const target: DataTransfer = <DataTransfer>(evt.target);

    this.isExcelFile = !!target.files[0].name.match(/(.xls|.xlsx)/);
    console.log(target.files)
    if (target.files.length > 1) {
      this.inputFile.nativeElement.value = '';
    }
    if (this.isExcelFile) {
      this.spinnerEnabled = true
      const reader: FileReader = new FileReader()
      reader.onload = (e: any) => {
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});

        /* grub first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        //
        /* save data */

        data = XLSX.utils.sheet_to_json(ws);
        console.log(Object.keys(data.keys))
      };

      reader.readAsBinaryString(target.files[0]);

      reader.onloadend = (e) => {
        this.spinnerEnabled = false;

        this.keys = Object(data[0]);
        // console.log(data)
        this.datasheet.next(data)
        for (let i = 0; i <= data.length; i++) {
          switch (data[i].provinceID){
            case 1:
              data[i].province="?????????????????? ????????";
              break;
            case 2:
              data[i].province="????????????";
              break;
            case 3:
              data[i].province="????????????";
              break;
            case 4:
              data[i].province="??????????";
              break;
            case 5:
              data[i].province="??????????";
              break;
            case 6:
              data[i].province="??????????";
              break;
            case 7:
              data[i].province="??????????";
              break;
            case 8:
              data[i].province="???????????????? ?? ??????????????";
              break;
            case 9:
              data[i].province="???????????? ??????????";
              break;
            case 10:
              data[i].province="???????????? ????????";
              break;
            case 11:
              data[i].province="???????????? ??????????";
              break;
            case 12:
              data[i].province="??????????????";
              break;
            case 13:
              data[i].province="??????????";
              break;
            case 14:
              data[i].province="??????????";
              break;
            case 15:
              data[i].province="???????????? ?? ????????????????";
              break;
            case 16:
              data[i].province="????????";
              break;
            case 17:
              data[i].province="??????????";
              break;
            case 18:
              data[i].province="????";
              break;
            case 19:
              data[i].province="??????????????";
              break;
            case 20:
              data[i].province="??????????";
              break;
            case 21:
              data[i].province="??????????????";
              break;
            case 22:
              data[i].province="???????????????? ?? ????????????????";
              break;
            case 23:
              data[i].province="????????????";
              break;
            case 24:
              data[i].province="??????????";
              break;
            case 25:
              data[i].province="????????????";
              break;
            case 26:
              data[i].province="????????????????";
              break;
            case 27:
              data[i].province="??????????";
              break;
            case 28:
              data[i].province="??????????????";
              break;
            case 29:
              data[i].province="??????????";
              break;
            case 30:
              data[i].province="??????";
              break;
            case 31:
              data[i].province="?????????????????? ????????";
              break;
            case 32:
              data[i].province="????????????????";
              break;


          }
            delete data[i].provinceID
            console.log(data[i])
          this.sleep(1000)
            this.accountService.setCityTest(data[i])
              .pipe(first())
              .subscribe(
                data => {
                  console.log(data)
                  console.log('User added successfully')
                },
                error => {
                  console.log('error add')
                  console.log(error)
                }
              )

        }
      }
    } else {
      this.inputFile.nativeElement.value = '';
    }
  }

  sleep(milliseconds: number) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }
}
