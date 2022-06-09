import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {first, forkJoin, Observable, Subject} from "rxjs";
import {AccountService} from "../_services";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {PageEvent} from "@angular/material/paginator";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Province} from "../_models/province";
import {AddprovinceComponent} from "./addprovince/addprovince.component";
import {ExcelService} from "../_services/excel.service";
import * as XLSX from "xlsx";
import {City} from "../_models/city";
import {DeleteuserComponent} from "../user/deleteuser/deleteuser.component";
import {MatSnackBar} from "@angular/material/snack-bar";


interface DialogData {
  id: number,
  provinceName: string
}


@Component({
  selector: 'app-province',
  templateUrl: './province.component.html',
  styleUrls: ['./province.component.css']
})
export class ProvinceComponent implements OnInit {
  dataSource1!: MatTableDataSource<Province>;
  public dialogRef!: MatDialogRef<any>
  @ViewChild('upload_excel') inputFile!: ElementRef
  spinnerEnabled = false;
  keys!: string[];
  datasheet = new Subject()
  isExcelFile!: boolean
  public state!: string
  @ViewChild(MatTable) table: MatTable<Province> | undefined
  displayedColumns: string[] = ['province', 'management'];
  public page: number = 1;
  public length: number = 0;
  public length2: number = 1;
  public pageSize: number = 5;
  tempId!: number
  public provinceList = []
  public Counter = 0
  public dataList = []
  public dataLength: number = 0


  constructor(
    public dialog: MatDialog,
    public deleteDaiolg: MatDialog,
    private accountService: AccountService,
    public excelService: ExcelService,
  ) {
  }


  ngOnInit(): void {
    this.paginate(this.page, this.pageSize)

  }

  onChangePage(pe: PageEvent) {
    this.page = pe.pageIndex + 1
    if (this.page == undefined) {
      this.paginateAllCity(this.page, pe.pageSize)
    } else {
      this.paginate(this.page, pe.pageSize)
    }
  }

  paginate(page: number, pageSize: number) {
    this.accountService.paginateProvinceTest(page, pageSize).pipe(first())
      .subscribe(provinceResponse => {
        if (this.length == 0) {
          this.length = Number(provinceResponse.headers.get('X-Total-Count'))
        }
        // @ts-ignore
        this.dataSource1 = new MatTableDataSource<Province>(provinceResponse.body)

      })
  }

  paginateAllCity(page: number, pageSize: number) {
    this.accountService.getAllCity().pipe(first()).subscribe(allProvice => {
      // console.log(allUser.length)
      this.length = allProvice.length
      // console.log(this.length)
    }),

      this.accountService.paginateAllCity(page, pageSize).pipe(first())
        .subscribe(City => {

          // @ts-ignore
          this.dataSource1 = new MatTableDataSource<City>(City)
          // this.getProvince()
          for (let i = 0; i < this.dataSource1.data.length; i++) {


          }

        })
  }

  openAddProvince() {
    this.length2 = this.length
    this.dialog.open(AddprovinceComponent, {
      data: {
        state: 'add'
      }
    },).afterClosed()
      .subscribe(data => {
        if (data == undefined) {

          this.tempId = 0
        } else {
          let pageCurrent = Math.floor(((this.length) / this.pageSize)) + 1
          // console.log(pageCurrent)
          this.paginate(pageCurrent, this.pageSize)
          // console.log(data.id)
        }

      })
  }

  exportAsXLSX(): void {
    this.accountService.getProvince().pipe(first()).subscribe(data => {
      console.log(data)
      this.excelService.exportAsExcelFile(data, 'provinces')
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
        this.dataLength = data.length
        console.log(this.dataLength)

        // console.log(data)
        // console.log(data)

        this.sendProvince(0, data)

      }

    } else {
      this.inputFile.nativeElement.value = '';
    }
  }

  sendProvince(index: number, data: any): void {
    if (index < this.dataLength) {
      const userList: Observable<any>[] = []
      for (let i = index; i <= Math.min(index + 4, this.dataLength); i++) {
        if (data[i] != undefined) {
          userList.push(this.accountService.setProvinceTest(data[i]))
        }
      }
      forkJoin(userList).subscribe(province => {
        console.log(province)
        this.sendProvince(Math.min(index + 4, this.dataLength), data)
      })
    }
  }

  openEditPtovince(id: number) {
    this.dialog.open(AddprovinceComponent, {
      data: {
        id: id,
        state: 'edit'
      }
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

  openpreviewProvince(id: number) {
    this.dialog.open(AddprovinceComponent, {
      data: {
        id: id,
        state: 'preview'
      }
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


  openDeleteProvince(id: number, province: string):void {
   const dialogRef= this.deleteDaiolg.open(DeleteProvinceDialog, {
      data: {id: id, provinceName: province}
    })

     dialogRef.afterClosed().subscribe(data => {
        console.log('>>>>>>>>>>>>>'+ data)

        if (data == false) {
          this.tempId = 0
        } else {
          this.paginate(this.page, this.pageSize)
        }
      }
    );

  }

}

@Component({
  selector: 'deleteProvinceDialog',
  templateUrl: 'addprovince/deleteProvinceDialog.html'
})
export class DeleteProvinceDialog {
  message!: string;
  public isSuccessfully: boolean = false


  constructor(
    public dialogRef: MatDialogRef<ProvinceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public accountService: AccountService,
    public snacbarDeleteUser: MatSnackBar
  ) {
  }

  onNoClick(): void {
    this.dialogRef.close(this.data)
  }

  deleteProvence() {
    // console.log('delete')
    this.accountService.deleteProvinceTest(this.data.id).pipe(first())
      .subscribe(data => {

          this.message = this.data.provinceName + ' با موفقیت حذف شد. '
          this.snacbarDeleteUser.open(this.message, 'باشه', {
            duration: 4000,
            direction: "rtl",
            horizontalPosition: "center",
          })
          this.isSuccessfully = true

          console.log(this.data)
        console.log(this.isSuccessfully)
          this.dialogRef.close(this.isSuccessfully)
          // return this.isSuccessfully
        }, error => {
          console.log('delete error')
          console.log(error)
          return this.isSuccessfully
        }
      )
    // this.dialogRef.close()

  }
}

