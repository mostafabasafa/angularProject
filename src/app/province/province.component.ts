import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {elementAt, first, forkJoin, min, Observable, of, Subject} from "rxjs";
import {AccountService} from "../_services";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Province} from "../_models/province";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AddprovinceComponent} from "./addprovince/addprovince.component";
import {ExcelService} from "../_services/excel.service";
import * as XLSX from "xlsx";
import {City} from "../_models/city";
import {EdituserComponent} from "../user/edituser/edituser.component";



@Component({
  selector: 'app-province',
  templateUrl: './province.component.html',
  styleUrls: ['./province.component.css']
})
export class ProvinceComponent implements OnInit {
  displayedColumns: string[] = ['id', 'province'];
  dataSource1!: MatTableDataSource<Province>;
  addProvinceForm!: FormGroup;
  public dialogRef!: MatDialogRef<any>
  @ViewChild('upload_excel') inputFile!: ElementRef
  spinnerEnabled = false;
  keys!: string[];
  datasheet = new Subject()
  isExcelFile!: boolean
  count3!: string | null
  count4!: number
  public state!: string
  @ViewChild(MatTable) table: MatTable<Province> | undefined
  // @ts-ignore
  // columnsToDisplay: [string] = this.displayedColumns.slice();
  displayedColumns: string[] = ['province', 'management'];
  public page!: number;
  public length: number = 0;
  public length2: number = 1;
  public pageSize: number = 5;
  tempId!: number
  public provinceList = []
  public Counter = 0
  public dataList = []
  public dataLength: number = 0
  private provinceID!: number;


  constructor(
    public dialog: MatDialog,
    private accountService: AccountService,
    private formBuilder: FormBuilder,
    public excelService: ExcelService,
  ) {
  }


  ngOnInit(): void {


    this.page = 1

    this.paginate(this.page, this.pageSize)

    this.addProvinceForm = this.formBuilder.group({
      province: [['', Validators.required]],

    })
    this.f['province'].setValue('')

  }

  get f() {
    return this.addProvinceForm.controls;
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
    if (this.length == 0) {
      this.accountService.provinceCount().subscribe(resp => {
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
    this.accountService.paginateProvinceTest(page, pageSize).pipe(first())
      .subscribe(Province => {

        // @ts-ignore
        this.dataSource1 = new MatTableDataSource<Province>(Province)
        // this.getProvince()
        for (let i = 0; i < this.dataSource1.data.length; i++) {


        }

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
      data:{
        state: 'add'
      }}, ).afterClosed()
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
      // console.log(index)
      const userList: Observable<any>[] = []
      for (let i = index; i <= Math.min(index + 4, this.dataLength); i++) {
        // console.log(i)
        if (data[i] != undefined) {
          userList.push(this.accountService.setProvinceTest(data[i]))
        }

      }

      console.log(userList)

      forkJoin(userList).subscribe(province => {
        // console.log(Math.min(index + 4, this.dataLength))
        console.log(province)

        this.sendProvince(Math.min(index + 4, this.dataLength), data)
        //
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

  openDeleteProvince(id: number) {

  }

}

