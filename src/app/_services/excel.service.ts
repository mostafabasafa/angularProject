import {ElementRef, Injectable, ViewChild} from "@angular/core";
import * as XLSX from "xlsx";

import {saveAs} from 'file-saver';
import {WorkBook} from "xlsx";
import {Subject} from "rxjs";

const EXCEL_TYPE='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENTION='.xlsx';


// function require(id: string) {
//
// }
declare var require: any;

@Injectable()
export class ExcelService{
  FileSaver = require('file-saver');
  spinnerEnabled= false;
  keys!: string;
  datasheet= new Subject()
  @ViewChild('upload_excel') inputFile!: ElementRef;
  isExcelFile!: boolean

  constructor() {

  }

  public exportAsExcelFile(json:any[], excelFileName: string){
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json)
    console.log('worksheet', worksheet)
    const workbook: XLSX.WorkSheet = {Sheets: { 'data': worksheet}, SheetNames: ['data']};
    // @ts-ignore
    const excelBuffer: any= XLSX.write(workbook, {bookType: "xlsx", type: 'array'})
    this.saveAsExcelFile(excelBuffer, excelFileName)
  }

  public saveAsExcelFile(buffer: any, fileName:string): void{

    const data: Blob= new Blob([buffer], {type: EXCEL_TYPE});

    this.FileSaver.saveAs(data, fileName + '_export_'+ new Date().getTime()+ EXCEL_EXTENTION)

  }

  public importAsExcelFile(evt: any){
    let data, header;
    const target: DataTransfer= <DataTransfer>(evt.target);
    this.isExcelFile= !!target.files[0].name.match(/(.xls|.xlsx)/);
    if (target.files.length>1){
      this.inputFile.nativeElement.value='';
    }
    if (this.isExcelFile){
      this.spinnerEnabled=true
      const reader: FileReader= new FileReader()
      reader.onload= (e:any) => {
        /* read workbook */
        const bstr: string= e.target.result;
        const wb: XLSX.WorkBook= XLSX.read(bstr,{type: 'binary'});

        /* grub first sheet */
        const wsname: string= wb.SheetNames[0];
        const ws: XLSX.WorkSheet= wb.Sheets[wsname];

        /* save data */

        data= XLSX.utils.sheet_to_json(ws);
      };

      reader.readAsBinaryString(target.files[0]);



    }
  }


}
