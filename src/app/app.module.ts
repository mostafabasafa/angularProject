import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
// import { UsersListComponent } from './users-list/users-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatSliderModule } from '@angular/material/slider';
import {MatTableModule} from "@angular/material/table";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatNativeDateModule} from "@angular/material/core";
import {HttpClientModule} from "@angular/common/http";
import {MaterialExampleModule} from "../material.module";
import { AdduserComponent } from './user/adduser/adduser.component';
import {Routes, RouterModule} from "@angular/router";
import { EdituserComponent } from './user/edituser/edituser.component';
import { DeleteuserComponent } from './user/deleteuser/deleteuser.component';
// import { ProvinceComponent } from './province/province.component';
import {AppRoutingModule , routingComponent} from "./app-routing-module";
import {NgxGalleryModule} from "ngx-gallery-9";
import { CityComponent } from './city/city.component';
import { AddcityComponent } from './city/addcity/addcity.component';
import { AddprovinceComponent } from './province/addprovince/addprovince.component';
import {ExcelService} from "./_services/excel.service";
import { ChatroomComponent } from './chatroom/chatroom.component';
import { MapComponent } from './province/map/map.component';


// @ts-ignore
@NgModule({
  declarations: [
    AppComponent,
    // UsersListComponent,
    AdduserComponent,
    EdituserComponent,
    DeleteuserComponent,
    routingComponent,
    CityComponent,
    AddcityComponent,
    AddprovinceComponent,
    ChatroomComponent,
    MapComponent
    // ProvinceComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSliderModule,
    MatTableModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MatNativeDateModule,
    MaterialExampleModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgxGalleryModule,
  ],
  providers: [
    ExcelService
  ],
  bootstrap: [AppComponent ]
})
export class AppModule { }
