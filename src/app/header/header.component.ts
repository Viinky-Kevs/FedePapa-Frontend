import { Component, HostListener, OnInit } from '@angular/core';
import { fedePapa, navbarData, logOut, navbarDataAdmin } from './nav-data';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{
  collapsed = false;
  navData: any[] = [];
  navPapa = fedePapa;
  navLog = logOut;
  screenWidth = 0;

  logo: boolean = true;

  @HostListener('window:resize', ['$event'])
  onResize(envent: any){
    this.screenWidth = window.innerWidth;
    if(this.screenWidth <= 768){
      this.collapsed = false;
    }
  }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;

    let isAdmin = sessionStorage.getItem('isAdmin');
    if(isAdmin === 'true'){
      this.navData = navbarDataAdmin;
    }else{
      this.navData = navbarData;
    }
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.logo = !this.logo;
  }

  closeSidenav(): void{
    this.collapsed = false;
    this.logo = !this.logo;
  }
}
