import {RouterModule, Routes} from "@angular/router";
import {UsersListComponent} from "./user/users-list/users-list.component";
import {ProvinceComponent} from "./province/province.component";
import {NgModule} from "@angular/core";
import {CityComponent} from "./city/city.component";
import {MapComponent} from "./province/map/map.component";
import {AuthGuard} from "./_helpers/auth.guard";
import {LoginComponent} from "./account/login/login.component";

const accountService= ()=> import('./account/account.module').then(x=>x.AccountModule)

const routes: Routes=[
  {path: '', component: UsersListComponent, canActivate:[AuthGuard]},
  {path: 'province', component: ProvinceComponent, canActivate:[AuthGuard]},
  {path: 'city', component: CityComponent, canActivate:[AuthGuard]},
  {path: 'map', component: MapComponent, canActivate:[AuthGuard]},
  {path: 'login', component:LoginComponent},
  {path: '**', redirectTo: ''}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponent = [UsersListComponent, ProvinceComponent]
