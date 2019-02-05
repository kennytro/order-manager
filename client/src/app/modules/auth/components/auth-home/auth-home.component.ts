import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-auth-home',
  templateUrl: './auth-home.component.html',
  styleUrls: ['./auth-home.component.css']
})
export class AuthHomeComponent implements OnInit {
  showSpinner = true;
  loggedIn = false;
  
  constructor(public auth: AuthService, private router: Router) { }

  ngOnInit() {
  	if (this.auth.isAuthenticated()) {
      this.loggedIn = true;
  	} else {
     
  	}
    this.showSpinner = false;
  }

  logout() {
    // TODO: confirm with user before logout.
    this.auth.logout();
  }
}
