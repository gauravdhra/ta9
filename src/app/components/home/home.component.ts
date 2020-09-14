import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  auth: boolean = false;

  constructor(private route: Router  ) { }

  ngOnInit(): void {
    localStorage.getItem('authentication') === 'true' ? this.auth = true : this.auth = false;
    this.unauthorizedNavigation();
  }

  // navigate to login page if unauthorized access
  unauthorizedNavigation()
  {
    !this.auth ? this.route.navigate(['/login']) : this.route.navigate([''])
  }

}
