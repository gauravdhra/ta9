// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
// import { environment } from './../../../environments/environment';
// import { Router } from '@angular/router';
// declare var M;
//
// @Component({
//   selector: 'app-auth',
//   templateUrl: './auth.component.html',
//   styleUrls: ['./auth.component.css']
// })
// export class AuthComponent implements OnInit {
//   // loginForm: FormGroup; //declare the reactive forms group for login
//   // authentication: boolean = false;
//   //
//   // constructor(private fb: FormBuilder, private route: Router)
//   // {
//   //   this.loginForm = this.fb.group({
//   //     'userName': ['',[Validators.required ]],
//   //     'password': ['', Validators.required],
//   //   });
//   // }
//   //
//   // ngOnInit(): void {
//   //   //if user already logged in, then redirecting him to home page
//   //   localStorage.getItem('authentication') === 'true' ? this.route.navigate(['']) : this.route.navigate(['/login']);
//   // }
//   //
//   // //logging user in
//   // login()
//   // {
//   //   console.log("login fields: ", this.loginForm.value);
//   //   ((this.loginForm.value.userName === environment.username) && (this.loginForm.value.password === environment.password)) ? this.authentication = true : this.authentication = false;
//   //   //after authentication redirecting uer to home page
//   //   if(this.authentication)
//   //   {
//   //     localStorage.setItem('authentication', 'true');
//   //     this.route.navigate(['']);
//   //     M.toast({html: 'Login Successful!'})
//   //   }
//   //   else
//   //   {
//   //     M.toast({html: 'Authentication failed!'})
//   //   }
//   // }
//
// }
