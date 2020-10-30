import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { AuthComponent } from './../components/auth/auth.component';
import { HomeComponent } from './../components/home/home.component'

const routes: Routes = [
  { path: '', component: HomeComponent },
  // { path: 'login', component: AuthComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
