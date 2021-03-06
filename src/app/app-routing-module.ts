import {RouterModule, Routes} from "@angular/router";
import {UsersListComponent} from "./user/users-list/users-list.component";
import {ProvinceComponent} from "./province/province.component";
import {NgModule} from "@angular/core";
import {CityComponent} from "./city/city.component";
import {ChatroomComponent} from "./chatroom/chatroom.component";


const routes: Routes=[
  {path: '', component: UsersListComponent},
  {path: 'province', component: ProvinceComponent},
  {path: 'city', component: CityComponent},
  {path: 'chatroom', component: ChatroomComponent}


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponent = [UsersListComponent, ProvinceComponent]
