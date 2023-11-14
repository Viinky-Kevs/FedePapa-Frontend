import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { IP } from '../app.service';
import { Chart } from 'chart.js';
import Swal from 'sweetalert2';
import * as L from 'leaflet';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {

  constructor(
    private http: HttpClient, 
    private router: Router,
    private ipBackend: IP
  ) {}

  @ViewChild('tempMChart') tempMChart: ElementRef | undefined;
  @ViewChild('prepChart') prepChart: ElementRef | undefined;
  @ViewChild('hrChart') hrChart: ElementRef | undefined;
  @ViewChild('windChart') windChart: ElementRef | undefined;

  @ViewChild('tempPChart') tempPChart: ElementRef | undefined;
  @ViewChild('prepPChart') prepPChart: ElementRef | undefined;
  @ViewChild('hrPChart') hrPChart: ElementRef | undefined;
  @ViewChild('windPChart') windPChart: ElementRef | undefined;

  currentPosition = 0;
  loading = false;
  dates = {
    initial:null,
    end:null,
  }

  // declaración de Mapa y controles de dibujo
  LeafletMap: any;
  drawnItems: any;
  drawControl: L.Control.Draw | undefined;
  maker: L.Marker<any> | undefined;
  coordinatesPolygon: any | null = null;
  lat: number = 4.2; 
  lng: number = -73.85;
  zoom: number = 5

  // Valores para gráficos
  dateValues: any;
  tempMeanValues: any;
  tempMaxValues: any;
  tempMinValues: any;
  hrValues: any;
  prepValues: any;
  windMeanValues: any;
  windMaxValues: any;
  windMinValues: any;

  datePValues: any;
  tempPMeanValues: any;
  tempPMaxValues: any;
  tempPMinValues: any;
  hrPValues: any;
  prepPValues: any;
  windPMeanValues: any;
  windPMaxValues: any;
  windPMinValues: any;

  // Declaración de gráficos
  chartTempMean: any;
  chartPrep: any;
  chartHR: any;
  chartWind: any;

  chartPTempMean: any;
  chartPPrep: any;
  chartPHR: any;
  chartPWind: any;

  // Información de Back
  dataC: any;
  dataP: any;
  area: any;
  datesX: any;

  data = [
    {'date':'2023-01-01', 'day': 'Martes', 'prep': 10, 'temp': 10, 'ws': 10, 'hr':10},
    {'date':'2023-01-01', 'day': 'Miércoles', 'prep': 20, 'temp': 10, 'ws': 10, 'hr':10},
    {'date':'2023-01-01', 'day': 'Jueves', 'prep': 30, 'temp': 10, 'ws': 10, 'hr':10},
    {'date':'2023-01-01', 'day': 'Viernes', 'prep': 40, 'temp': 10, 'ws': 10, 'hr':10},
    {'date':'2023-01-01', 'day': 'Sábado', 'prep': 50, 'temp': 10, 'ws': 10, 'hr':10},
    {'date':'2023-01-01', 'day': 'Domingo', 'prep': 60, 'temp': 10, 'ws': 10, 'hr':10},
    {'date':'2023-01-01', 'day': 'Lunes', 'prep': 70, 'temp': 10, 'ws': 10, 'hr':10},
  ];

  dataOptions: any | null = null;
  dataSelect = {
    polygon: null,
  }

  ngOnInit(): void {

    if(sessionStorage.getItem('userID') == null){
      Swal.fire('No has iniciado Sesión!', 'Por favor inicia sesión o registrate!', 'error');
      this.router.navigate(['/login']);
    }

    this.http.post(this.ipBackend.ipBackend + 'get-polygons-user', 
      {'user_id': sessionStorage.getItem('userID')})
      .subscribe((response:any)=> {
        if(response.ok){
          this.dataOptions = response.data;
        }else{
          Swal.fire('No tienes polígonos guardados!', 'Vuelve a dibujar uno y si quieres puedes guardarlo', 'error');
          this.router.navigate(['/map']);
        }
        
      });

    this.coordinatesPolygon = window.history.state.coordinatesPolygon;
    if(this.coordinatesPolygon){
      this.loading = true;
      this.http.post(this.ipBackend.ipBackend + 'find-centroid', 
      {'polygon':JSON.stringify(this.coordinatesPolygon)})
      .subscribe((response:any)=> {
        this.lat = response.centroid.lat;
        this.lng = response.centroid.lng;
        this.area = response.area;
        this.zoom = 17;
        if(this.LeafletMap){
          this.LeafletMap.remove();
        }
        this.drawMap();
      });

      this.http.post(this.ipBackend.ipBackend + 'nasa-power-data', 
      {'polygon':JSON.stringify(this.coordinatesPolygon)})
      .subscribe((response:any)=> {
        const data = JSON.parse(response.data);
        this.dataC = data.data;
        try{
          this.datesX = response.dates;
          this.dateValues = this.dataC.map((d: { [x: string]: any; }) => d['anyo_sem']);
          this.tempMeanValues = this.dataC.map((d: { [x: string]: any; }) => d['temperatura']);
          this.tempMaxValues = this.dataC.map((d: { [x: string]: any; }) => d['temperatura_maxima']);
          this.tempMinValues = this.dataC.map((d: { [x: string]: any; }) => d['temperatura_minima']);
          this.hrValues = this.dataC.map((d: { [x: string]: any; }) => d['RH2M']);
          this.prepValues = this.dataC.map((d: { [x: string]: any; }) => d['precipitacion']);
          this.windMeanValues = this.dataC.map((d: { [x: string]: any; }) => d['vel_viento']);
          this.windMaxValues = this.dataC.map((d: { [x: string]: any; }) => d['vel_viento_max']);
          this.windMinValues = this.dataC.map((d: { [x: string]: any; }) => d['vel_viento_min']);
          this.drawTempChart();
          this.drawChartPrep();
          this.drawChartHR();
          this.drawWindChart();
          this.loading = false;
        } catch{
          console.log('Error en asignar valores para gráfico!');
        }
      });

      this.http.post(this.ipBackend.ipBackend + 'get-ideam-data', 
      {'polygon':JSON.stringify(this.coordinatesPolygon)})
      .subscribe((response:any)=> {
        this.data = response.data;
      });
      
    }
    this.drawMap();
  }

  /* Scroll top */

  scrollLeft() {
    this.currentPosition = Math.max(this.currentPosition - 1, 0);
  }

  scrollRight() {
    this.currentPosition = Math.min(this.currentPosition + 1, 6);
  }

  /* Options */

  changeDate(){
    if(this.dates.initial && this.dates.end && this.coordinatesPolygon){
      this.loading = true;
      this.http.post(this.ipBackend.ipBackend + 'get-model-data', {dates:this.dates, coords:this.coordinatesPolygon})
      .subscribe((response: any) => {
        if(response.ok){
          const data = JSON.parse(response.data);
          this.dataP = data.data;
          this.loading = false;
          try{
            this.datePValues = this.dataP.map((d: { [x: string]: any; }) => d['date']);
            this.tempPMeanValues = this.dataP.map((d: { [x: string]: any; }) => d['temp_mean']);
            this.tempPMaxValues = this.dataP.map((d: { [x: string]: any; }) => d['temp_max']);
            this.tempPMinValues = this.dataP.map((d: { [x: string]: any; }) => d['temp_min']);
            this.hrPValues = this.dataP.map((d: { [x: string]: any; }) => d['hr']);
            this.prepPValues = this.dataP.map((d: { [x: string]: any; }) => d['prep']);
            this.windPMeanValues = this.dataP.map((d: { [x: string]: any; }) => d['ws_mean']);
            this.windPMaxValues = this.dataP.map((d: { [x: string]: any; }) => d['ws_max']);
            this.windPMinValues = this.dataP.map((d: { [x: string]: any; }) => d['ws_min']);
            this.drawPTempChart();
            this.drawPChartPrep();
            this.drawPChartHR();
            this.drawPWindChart();
          } catch{
            console.log('Error en asignar valores para gráfico!');
          }
        }else{
          this.loading = false;
          Swal.fire('Problema!', response.message, 'error');    
        }
      })
    }else{
      Swal.fire('Falta seleccionar fechas!', 'Debes ingresar la fecha incial y final de siembra propuesta, dibujar o seleccionar un polígono!', 'error');
    }
  }

  changeOpt(){
    this.loading = true;
    this.http.post(this.ipBackend.ipBackend + 'get-polygon-selected', 
      {'user_id': sessionStorage.getItem('userID'),
      'id_polygon': this.dataSelect.polygon})
      .subscribe((response:any)=> {
        this.loading = false;
        const data = JSON.parse(response.data_np);
        this.datesX = response.dates;
        this.dataC = data.data;
        this.data = response.data_i;
        this.coordinatesPolygon = response.polygon;
        this.area = response.area;
        this.lat = response.centroid.lat;
        this.lng = response.centroid.lng;
        this.zoom = 17;
        if(this.LeafletMap){
          this.LeafletMap.remove();
        }
        this.drawMap();
        try{
          this.dateValues = this.dataC.map((d: { [x: string]: any; }) => d['anyo_sem']);
          this.tempMeanValues = this.dataC.map((d: { [x: string]: any; }) => d['temperatura']);
          this.tempMaxValues = this.dataC.map((d: { [x: string]: any; }) => d['temperatura_maxima']);
          this.tempMinValues = this.dataC.map((d: { [x: string]: any; }) => d['temperatura_minima']);
          this.hrValues = this.dataC.map((d: { [x: string]: any; }) => d['RH2M']);
          this.prepValues = this.dataC.map((d: { [x: string]: any; }) => d['precipitacion']);
          this.windMeanValues = this.dataC.map((d: { [x: string]: any; }) => d['vel_viento']);
          this.windMaxValues = this.dataC.map((d: { [x: string]: any; }) => d['vel_viento_max']);
          this.windMinValues = this.dataC.map((d: { [x: string]: any; }) => d['vel_viento_min']);
          this.drawTempChart();
          this.drawChartPrep();
          this.drawChartHR();
          this.drawWindChart();
        } catch{
          console.log('Error en asignar valores para gráfico!');
        }
      });
  }


  // Mapa

  drawMap(): void{
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

    this.LeafletMap = L.map("map", { layers: [googleHybrid] }).setView(L.latLng(this.lat, this.lng), this.zoom);
    
    L.polygon(this.coordinatesPolygon, { color: 'red' }).addTo(this.LeafletMap); //var layer_3 = 

    var baseMaps = {
      "Híbrido": googleHybrid,
      "Cartográfica": layer_1,
      "Topografía": layer_2
    };

    L.control.layers(baseMaps).addTo(this.LeafletMap);
    
  }

  // Gráficos

  drawTempChart(): void {
    this.chartTempMean = new Chart(this.tempMChart?.nativeElement, {
      type: 'line',
      data: {
        labels: this.dateValues,
        datasets: [
          {
            label: 'Temperatura media',
            data: this.tempMeanValues,
            backgroundColor: 'rgba(213, 222, 75, 0.2)',
            borderColor: 'rgba(213, 222, 75, 1)',
            borderWidth: 2
          },
          {
            label: 'Temperatura máxima',
            data: this.tempMaxValues,
            backgroundColor: 'rgba(242, 72, 64, 0.2)',
            borderColor: 'rgba(242, 72, 64, 1)',
            borderWidth: 2
          },
          {
            label: 'Temperatura mínima',
            data: this.tempMinValues,
            backgroundColor: 'rgba(64, 202, 242, 0.2)',
            borderColor: 'rgba(64, 202, 242, 1)',
            borderWidth: 2
          },
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            display: true,
            title: {
              display: true,
              text: 'Temperatura (°C)'
            }
          },
          x:
          {
            display: true,
            title: {
              display: true,
              text: 'Fecha (Año-Semana)'
            }
          },
          x2:{
            position:'bottom',
            min:0,
            max:5,
            title: {
              display: true,
              text: 'Fecha (Día-Mes-Año)'
            },
            grid:{
              display:false,
            },
            ticks: {
              callback: (value:any) => {
                const customLabels = this.datesX;
                return customLabels[value] || '';
              }
            }
          }
        }
      }
    }); 
  }

  drawChartPrep(): void {
    this.chartPrep = new Chart(this.prepChart?.nativeElement, {
      type: 'line',
      data: {
        labels: this.dateValues,
        datasets: [
          {
            label: 'Precipitación',
            data: this.prepValues,
            backgroundColor: 'rgba(64, 202, 242, 0.2)',
            borderColor: 'rgba(64, 202, 242, 1)',
            borderWidth: 2
          },
        ]
      },
      options: {
        scales: {
          y: {
            display: true,
            title: {
              display: true,
              text: 'Precipitación (mm)'
            }
          },
          x:
          {
            display: true,
            title: {
              display: true,
              text: 'Fecha (Año-Semana)'
            }
          },
          x2:{
            position:'bottom',
            min:0,
            max:5,
            title: {
              display: true,
              text: 'Fecha (Día-Mes-Año)'
            },
            grid:{
              display:false,
            },
            ticks: {
              callback: (value:any) => {
                const customLabels = this.datesX;
                return customLabels[value] || '';
              }
            }
          }
        }
      }
    });
  }

  drawChartHR(): void {
    this.chartHR = new Chart(this.hrChart?.nativeElement, {
      type: 'line',
      data: {
        labels: this.dateValues,
        datasets: [
          {
            label: 'Humedad Relativa',
            data: this.hrValues,
            backgroundColor: 'rgba(64, 202, 242, 0.2)',
            borderColor: 'rgba(64, 202, 242, 1)',
            borderWidth: 2
          },
        ]
      },
      options: {
        scales: {
          y: {
            display: true,
            title: {
              display: true,
              text: 'Humedad Relativa (%)'
            }
          },
          x:
          {
            display: true,
            title: {
              display: true,
              text: 'Fecha (Año-Semana)'
            }
          },
          x2:{
            position:'bottom',
            min:0,
            max:5,
            title: {
              display: true,
              text: 'Fecha (Día-Mes-Año)'
            },
            grid:{
              display:false,
            },
            ticks: {
              callback: (value:any) => {
                const customLabels = this.datesX;
                return customLabels[value] || '';
              }
            }
          }
        }
      }
    });
  }

  drawWindChart(): void {
    this.chartWind = new Chart(this.windChart?.nativeElement, {
      type: 'line',
      data: {
        labels: this.dateValues,
        datasets: [
          {
            label: 'Velocidad del Viento media',
            data: this.windMeanValues,
            backgroundColor: 'rgba(213, 222, 75, 0.2)',
            borderColor: 'rgba(213, 222, 75, 1)',
            borderWidth: 2
          },
          {
            label: 'Velocidad del Viento máxima',
            data: this.windMaxValues,
            backgroundColor: 'rgba(242, 72, 64, 0.2)',
            borderColor: 'rgba(242, 72, 64, 1)',
            borderWidth: 2
          },
          {
            label: 'Velocidad del Viento mínima',
            data: this.windMinValues,
            backgroundColor: 'rgba(64, 202, 242, 0.2)',
            borderColor: 'rgba(64, 202, 242, 1)',
            borderWidth: 2
          },
        ]
      },
      options: {
        scales: {
          y: {
            display: true,
            title: {
              display: true,
              text: 'Velocidad del viento (m/s)'
            }
          },
          x:
          {
            display: true,
            title: {
              display: true,
              text: 'Fecha (Año-Semana)'
            }
          },
          x2:{
            position:'bottom',
            min:0,
            max:5,
            title: {
              display: true,
              text: 'Fecha (Día-Mes-Año)'
            },
            grid:{
              display:false,
            },
            ticks: {
              callback: (value:any) => {
                const customLabels = this.datesX;
                return customLabels[value] || '';
              }
            }
          }
        }
      }
    });
  }

  /* Pronsótico de variables */

  drawPTempChart(): void {
    this.chartPTempMean = new Chart(this.tempPChart?.nativeElement, {
      type: 'line',
      data: {
        labels: this.datePValues,
        datasets: [
          {
            label: 'Temperatura media',
            data: this.tempPMeanValues,
            backgroundColor: 'rgba(213, 222, 75, 0.2)',
            borderColor: 'rgba(213, 222, 75, 1)',
            borderWidth: 2
          },
          {
            label: 'Temperatura máxima',
            data: this.tempPMaxValues,
            backgroundColor: 'rgba(242, 72, 64, 0.2)',
            borderColor: 'rgba(242, 72, 64, 1)',
            borderWidth: 2
          },
          {
            label: 'Temperatura mínima',
            data: this.tempPMinValues,
            backgroundColor: 'rgba(64, 202, 242, 0.2)',
            borderColor: 'rgba(64, 202, 242, 1)',
            borderWidth: 2
          },
        ]
      },
      options: {
        scales: {
          y: {
            display: true,
            title: {
              display: true,
              text: 'Temperatura (°C)'
            }
          },
          x:
          {
            display: true,
            title: {
              display: true,
              text: 'Fecha (Año-Semana)'
            }
          },
        }
      }
    }); 
  }

  drawPChartPrep(): void {
    this.chartPPrep = new Chart(this.prepPChart?.nativeElement, {
      type: 'line',
      data: {
        labels: this.datePValues,
        datasets: [
          {
            label: 'Precipitación',
            data: this.prepPValues,
            backgroundColor: 'rgba(64, 202, 242, 0.2)',
            borderColor: 'rgba(64, 202, 242, 1)',
            borderWidth: 2
          },
        ]
      },
      options: {
        scales: {
          y: {
            display: true,
            title: {
              display: true,
              text: 'Precipitación (mm)'
            }
          },
          x:
          {
            display: true,
            title: {
              display: true,
              text: 'Fecha (Año-Semana)'
            }
          },
        }
      }
    });
  }

  drawPChartHR(): void {
    this.chartPHR = new Chart(this.hrPChart?.nativeElement, {
      type: 'line',
      data: {
        labels: this.datePValues,
        datasets: [
          {
            label: 'Humedad Relativa',
            data: this.hrPValues,
            backgroundColor: 'rgba(64, 202, 242, 0.2)',
            borderColor: 'rgba(64, 202, 242, 1)',
            borderWidth: 2
          },
        ]
      },
      options: {
        scales: {
          y: {
            display: true,
            title: {
              display: true,
              text: 'Humedad Relativa (%)'
            }
          },
          x:
          {
            display: true,
            title: {
              display: true,
              text: 'Fecha (Año-Semana)'
            }
          },
        }
      }
    });
  }

  drawPWindChart(): void {
    this.chartPWind = new Chart(this.windPChart?.nativeElement, {
      type: 'line',
      data: {
        labels: this.datePValues,
        datasets: [
          {
            label: 'Velocidad del Viento media',
            data: this.windPMeanValues,
            backgroundColor: 'rgba(213, 222, 75, 0.2)',
            borderColor: 'rgba(213, 222, 75, 1)',
            borderWidth: 2
          },
          {
            label: 'Velocidad del Viento máxima',
            data: this.windPMaxValues,
            backgroundColor: 'rgba(242, 72, 64, 0.2)',
            borderColor: 'rgba(242, 72, 64, 1)',
            borderWidth: 2
          },
          {
            label: 'Velocidad del Viento mínima',
            data: this.windPMinValues,
            backgroundColor: 'rgba(64, 202, 242, 0.2)',
            borderColor: 'rgba(64, 202, 242, 1)',
            borderWidth: 2
          },
        ]
      },
      options: {
        scales: {
          y: {
            display: true,
            title: {
              display: true,
              text: 'Velocidad del viento (m/s)'
            }
          },
          x:
          {
            display: true,
            title: {
              display: true,
              text: 'Fecha (Año-Semana)'
            }
          },
        }
      }
    });
  }

}
