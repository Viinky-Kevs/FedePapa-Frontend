import { Component, OnInit, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { IP } from '../app.service';
import { take } from 'rxjs';
import Swal from 'sweetalert2';

import '@geoman-io/leaflet-geoman-free';
import * as L from 'leaflet';
import "leaflet-draw";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit  {

  constructor(
    private readonly geolocation$: GeolocationService, 
    private http: HttpClient, 
    private router: Router, 
    private renderer: Renderer2,
    private ipBackend: IP) {
    this.numbers = [4.685347, -74.191439];
    geolocation$.pipe(take(1)).subscribe(position => {
      this.numbers[0] = position.coords.latitude;
      this.numbers[1] = position.coords.longitude;
      this.LeafletMap?.setView(L.latLng(this.numbers[0], this.numbers[1]), 18);
    });
  }

  @ViewChild('movableDiv')
  movableDiv!: ElementRef;

  numbers: number[];
  LeafletMap: any;
  drawnItems: any;
  drawControl: L.Control.Draw | undefined;
  maker: L.Marker<any> | undefined; 

  modal = false;
  loading = false;

  userPolygon = {
    name: '',
    coordinates:'',
    user_id: sessionStorage.getItem('userID'),
    username: sessionStorage.getItem('idUserName'),
  }

  private isDragging = false;

  ngOnInit(): void {

    if(this.LeafletMap){
      this.LeafletMap.remove();
    }

    if(sessionStorage.getItem('userID') == null){
      Swal.fire('No has iniciado Sesión!', 'Por favor inicia sesión o registrate!', 'error');
      this.router.navigate(['/login']);
    }

    var layer_1 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    var layer_2 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3']
    });

    this.LeafletMap = L.map("map", { layers: [googleHybrid] }).setView(L.latLng(this.numbers[0], this.numbers[1]), 10);
    

    var baseMaps = {
      "Mapa Híbrido": googleHybrid,
      "Satelital": layer_1,
    };
    var overLay = {
      "Capa Base": layer_2,
    }

    L.control.layers(
      baseMaps,
      overLay).addTo(this.LeafletMap);

    this.LeafletMap.pm.addControls({
      position: 'topright',
      drawCircle: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: true,
      drawPolygon: true,
      editMode: true,
      dragMode: true,
      cutPolygon: true,
      removalMode: true,
      drawMarker: true,
      drawText:false,
    });

    this.LeafletMap.pm.setLang('es');

    this.LeafletMap.on('pm:create', (e: any) => {
      var shape = e.layer;
      this.userPolygon.coordinates = shape._latlngs;
      this.modal = true;
    });

  }

  closeModal(){
    this.modal = !this.modal;
  }

  saveContinue(){
    this.loading = true;
    this.http.post(this.ipBackend.ipBackend + 'get-draw-coords-tosave', this.userPolygon)
    .subscribe((response: any) => {
      console.log(response);
      if(response.ok){
        Swal.fire('Guardado!', response.message, 'success');
        this.router.navigate(['/analysis'], { state: { coordinatesPolygon: this.userPolygon.coordinates }});
      }else {
        Swal.fire('Error al guardar', response.message, 'error');
      }
      this.loading = false;
    })
  }

  continue(){
    Swal.fire({
      title: 'Continuar sin guardar!',
      text: 'Continuaras sin guardar y deberás vovler a dibujar el polígono',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.router.navigate(['/analysis'], { state: { coordinatesPolygon: this.userPolygon.coordinates }});
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        //
      }
    });
  }

  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    const div = this.movableDiv.nativeElement;
    this.renderer.setStyle(div, 'z-index', '2');
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      const div = this.movableDiv.nativeElement;
      this.renderer.setStyle(div, 'left', `${event.clientX}px`);
      this.renderer.setStyle(div, 'top', `${event.clientY}px`);
    }
  }

  onMouseUp(event: MouseEvent): void {
    this.isDragging = false;
    const div = this.movableDiv.nativeElement;
    this.renderer.removeStyle(div, 'z-index');
  }


}
