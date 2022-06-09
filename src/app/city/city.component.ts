import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatTable, MatTableDataSource} from "@angular/material/table";

import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AccountService} from "../_services";
import {MatSnackBar} from "@angular/material/snack-bar";
import {first, Subject} from "rxjs";
import {City} from "../_models/city";
import {AddcityComponent} from "./addcity/addcity.component";
import {PageEvent} from "@angular/material/paginator";
import {ExcelService} from "../_services/excel.service";
import * as XLSX from "xlsx";
import {CityArea} from "../_models/cityArea";


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
  dataSource1!: MatTableDataSource<CityArea>;
  displayedColumns: string[] = ['city', 'province', 'management'];
  public dialogRef!: MatDialogRef<any>
  provinces: Province[] = []
  @ViewChild('upload_excel') inputFile!: ElementRef
  spinnerEnabled = false;
  keys!: string[];
  datasheet = new Subject()
  isExcelFile!: boolean

  @ViewChild(MatTable) table: MatTable<City> | undefined
  // @ts-ignore
  columnsToDisplay: [string] = this.displayedColumns.slice();
  private tempId!: number;
  public page!: number;
  public length: number = 0;
  public length2!: number;
  public id!: number;
  private pageSize: number = 5;

  constructor(
    public dialog: MatDialog,
    private accountService: AccountService,
    public snackbarSuccessAddUser: MatSnackBar,
    public excelService: ExcelService,
  ) {


  }

  ngOnInit(): void {
    this.paginateAllCity(this.page, this.pageSize)

    // this.accountService.getAllCity().pipe(first()).subscribe(allCity => {
    //   // console.log(allCity)
    //   this.length = allCity.length
    //   // console.log(this.length)
    // })
    // this.accountService.paginateCityTest(1,5).pipe(first()).subscribe(allCity =>{
    //   this.dataSource1 = new MatTableDataSource<City>(allCity.body)
    // })
    // // this.getAllCity()
    // this.accountService.getProvince().pipe(first())
    //   .subscribe(data => {
    //     // console.log(data[5].provinceID)
    //     for (let i = 0; i < data.length; i++) {
    //       this.provinces.push({value: i + 1, viewValue: data[i].province})
    //     }
    //     // console.log(this.provinces)
    //   })
    //
    // this.addProvinceForm = this.formBuilder.group({
    //   province: [['', Validators.required]],
    //
    // })
    // this.f['province'].setValue('')

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


  openAddCity() {

    this.length2 = this.length
    this.dialog.open(AddcityComponent, {
      data: {
        state: 'add'
      }
    }).afterClosed()
      .subscribe(data => {
        if (data == undefined) {

          this.tempId = 0
        } else {

          this.accountService.getCity(data.provinceID).pipe(first()).subscribe(city => {
              this.length = city.length

              let pageCurrent = Math.floor(((this.length) / this.pageSize)) + 1
              this.paginate(data.provinceID, pageCurrent, this.pageSize)

            }
          )
        }
      })
  }

  onChangePage(pe: PageEvent) {
    this.page = pe.pageIndex + 1
    if (this.id == undefined) {
      this.paginateAllCity(this.page, pe.pageSize)
    } else {
      this.paginate(this.id, this.page, pe.pageSize)
    }

  }

  paginate(id: number, page: number, pageSize: number) {


    this.accountService.paginateCity(id, page, pageSize).pipe(first())
      .subscribe(Province => {

        // @ts-ignore
        this.dataSource1 = new MatTableDataSource<Province>(Province)

      })
  }

  paginateAllCity(page: number, pageSize: number) {
    // this.accountService.getAllCity().pipe(first()).subscribe(allProvice => {
    //   this.length = allProvice.length
    // }),

    this.accountService.paginateAllCityTest(page, pageSize).pipe(first())
      .subscribe(cityResponse => {
        if (this.length == 0) {
          this.length = Number(cityResponse.headers.get('X-Total-Count'))
        }
        // @ts-ignore
        this.dataSource1 = new MatTableDataSource<CityArea>(cityResponse.body)

      })
    // // @ts-ignore
    // this.dataSource1 = new MatTableDataSource<City>(City.body)
    // // this.getProvince()
    // for (let i = 0; i < this.dataSource1.data.length; i++) {
    //
    //
    // }


  }

  exportAsXLSX(): void {
    this.accountService.getAllCity().pipe(first()).subscribe(data => {
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
          switch (data[i].provinceID) {
            case 1:
              data[i].province = "آذربایجان غربی";
              break;
            case 2:
              data[i].province = "اردبیل";
              break;
            case 3:
              data[i].province = "اصفهان";
              break;
            case 4:
              data[i].province = "البرز";
              break;
            case 5:
              data[i].province = "ایلام";
              break;
            case 6:
              data[i].province = "بوشهر";
              break;
            case 7:
              data[i].province = "تهران";
              break;
            case 8:
              data[i].province = "چهارمحال و بختیاری";
              break;
            case 9:
              data[i].province = "خراسان جنوبی";
              break;
            case 10:
              data[i].province = "خراسان رضوی";
              break;
            case 11:
              data[i].province = "خراسان شمالی";
              break;
            case 12:
              data[i].province = "خوزستان";
              break;
            case 13:
              data[i].province = "زنجان";
              break;
            case 14:
              data[i].province = "سمنان";
              break;
            case 15:
              data[i].province = "سیستان و بلوچستان";
              break;
            case 16:
              data[i].province = "فارس";
              break;
            case 17:
              data[i].province = "قزوین";
              break;
            case 18:
              data[i].province = "قم";
              break;
            case 19:
              data[i].province = "کردستان";
              break;
            case 20:
              data[i].province = "کرمان";
              break;
            case 21:
              data[i].province = "کردستان";
              break;
            case 22:
              data[i].province = "کهگیلویه و بویراحمد";
              break;
            case 23:
              data[i].province = "گلستان";
              break;
            case 24:
              data[i].province = "گیلان";
              break;
            case 25:
              data[i].province = "لرستان";
              break;
            case 26:
              data[i].province = "مازندران";
              break;
            case 27:
              data[i].province = "مرکزی";
              break;
            case 28:
              data[i].province = "هرمزگان";
              break;
            case 29:
              data[i].province = "همدان";
              break;
            case 30:
              data[i].province = "یزد";
              break;
            case 31:
              data[i].province = "آدربایجان شرقی";
              break;
            case 32:
              data[i].province = "کرمانشاه";
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

  openpreviewCity(id: number) {
    console.log('city ID : '+ id)
    this.length2 = this.length
    this.dialog.open(AddcityComponent, {
      data: {
        state: 'preview',
        id: id
      }
    }).afterClosed()
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


  openEditCity(id: number) {

    this.length2 = this.length
    this.dialog.open(AddcityComponent, {
      data: {
        state: 'edit',
        id: id
      }
    }).afterClosed()
      .subscribe(data => {
        if (data == undefined) {
          // console.log('not ID')
          this.tempId = 0
        } else {

          this.accountService.getCity(data.provinceID).pipe(first()).subscribe(city => {
              this.length = city.length

              let pageCurrent = Math.floor(((this.length) / this.pageSize)) + 1
              // console.log(pageCurrent)
              this.paginate(data.provinceID, pageCurrent, this.pageSize)

            }
          )
        }
      })
  }

  openDeleteCity(id: number, province: any) {

  }
}
