import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { UserComponent } from './user/user.component';
import { MapComponent } from './map/map.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { AdminComponent } from './admin/admin.component';
import { ErrorComponent } from './error/error.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'map', component: MapComponent },
  { path: 'user', component: UserComponent },
  { path: 'analysis', component: AnalysisComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', pathMatch: 'full', component: ErrorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
