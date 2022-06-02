import { Component } from '@angular/core';
import {User} from "./_models/user";
import {AccountService} from "./_services";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'userProject';
  user: User | undefined;

  constructor(private accountService: AccountService) {
    this.accountService.user.subscribe(x => this.user= x)
  }

}
