import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { IP } from '../app.service';
import Swal from 'sweetalert2';
import * as L from 'leaflet';
import { elements } from 'chart.js';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(
    private http: HttpClient, 
    private router: Router,
    private ipBackend: IP){}

  displayedColumns: string[] = ['user_id', 'username', 'email', 'created_on', 'last_login', 'isadmin'];
  data: any[] = [];
  loading = false;

  polygonsColumns: string[] = ['id_polygon', 'name_polygon', 'geometry', 'polygon_area', 'user_id', 'username', 'created_on'];
  dataPolygons: any[] = [];

  userRegister = {
    username: '',
    email: '',
    password:'',
    confirm:'',
  }

  users: any;

  usersData = {
    toDelete:'',
    toAdmin:'',
  }

  LeafletMap: any;
  drawnItems: any;
  drawControl: L.Control.Draw | undefined;
  maker: L.Marker<any> | undefined;
  coordinatesPolygon: any | null = null;
  lat: number = 4.2; 
  lng: number = -73.85;
  zoom: number = 5

  dataP: any[] = [];
  showPolygon: any[] = [];

  polyOption = {
    polygon: null,
  }

  ngOnInit(): void {
    if(sessionStorage.getItem('userID') == null){
      Swal.fire('No has iniciado Sesión!', 'Por favor inicia sesión o registrate!', 'error');
      this.router.navigate(['/login']);
    }

    this.http.get(this.ipBackend.ipBackend + 'admin-data-users')
    .subscribe((response:any) => {
      this.data = response.data[0];
    });

    this.http.get(this.ipBackend.ipBackend + 'get-users-data')
    .subscribe((response:any)=>{
      this.users = response.data[0]
    })

    this.http.get(this.ipBackend.ipBackend + 'get-all-polygons-users')
    .subscribe((response:any)=>{
      this.dataPolygons = response.data;
      this.dataP = response.data_poly;
    })
  }

  register(){
    if(this.userRegister.username != '' && this.userRegister.email != '' && this.userRegister.password != '' && this.userRegister.confirm != ''){
      if(this.userRegister.password === this.userRegister.confirm){
        Swal.fire({
          title: 'Registrar Usuario',
          text: '¿Desea registrar este usuario? Sugerimos revisar la información ingresada antes de enviar',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Confirmar',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.value) {
            this.http.post(this.ipBackend.ipBackend + 'register-user', this.userRegister)
            .subscribe((reponse:any)=>{
              if(reponse.ok){
                Swal.fire('Registro exitoso!', 'Usuario registrado con éxito!', 'success');
                window.location.reload();
              }else{
                Swal.fire('Problema!', reponse.message, 'error');
              }
            });
            
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            //
          }
        });
      }else{
        Swal.fire('Error!', 'Las contraseñas no coinciden', 'error');
      }
    }else{
      Swal.fire('Error!', 'Todos los campos son requeridos!', 'error');
    }
  }

  toAdmin(){
    Swal.fire({
      title: 'Administrador',
      text: '¿Desea registrar este usuario como administrador?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.http.post(this.ipBackend.ipBackend + 'to-admin', this.usersData)
        .subscribe((reponse:any)=>{
          if(reponse.ok){
            Swal.fire('Registro exitoso!', reponse.message, 'success');
            window.location.reload();
          }else{
            Swal.fire('Problema!', reponse.message, 'error');
          }
        }); 
      }
    });
  }

  deleteUser(){
    Swal.fire({
      title: 'Eliminar',
      text: '¿Desea eliminar este usuario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.http.post(this.ipBackend.ipBackend + 'delete-user', this.usersData)
        .subscribe((reponse:any)=>{
          if(reponse.ok){
            Swal.fire('Eliminación exitosa!', reponse.message, 'success');
            window.location.reload();
          }else{
            Swal.fire('Problema!', reponse.message, 'error');
          }
        });
      }
    });
  }

  drawMap(): void{
    var layer_1 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    var layer_2 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    this.LeafletMap = L.map("map", { layers: [layer_1] }).setView(L.latLng(this.lat, this.lng), this.zoom);
    
    var layer_3 = L.polygon(this.coordinatesPolygon, { color: 'red' }).addTo(this.LeafletMap);

    var baseMaps = {
      "Cartográfica": layer_1,
      "Topografía": layer_2
    };

    L.control.layers(baseMaps).addTo(this.LeafletMap);
  }

  polySelected(){

    let d = this.dataP.filter(element => element.id_polygon == this.polyOption.polygon);

    this.coordinatesPolygon = d[0].geometry;
    this.lat = d[0].lat;
    this.lng = d[0].lng;
    this.zoom = 17;
    
    if(this.LeafletMap){
      this.LeafletMap.remove();
      this.drawMap();
    }
    else{
      this.drawMap();
    }
  }
}
