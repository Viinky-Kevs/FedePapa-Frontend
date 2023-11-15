import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { IP } from '../app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pass',
  templateUrl: './pass.component.html',
  styleUrls: ['./pass.component.css']
})
export class PassComponent implements OnInit {

  constructor(
    private http: HttpClient, 
    private router: Router,
    private ipBackend: IP){}

  data = {
    email:null,
    username:null,
  }

  loading = false;

  ngOnInit(): void {
    Swal.fire('A tener en cuenta', 'Para recuperar la contraseña debes tener el nombre de usuario o el correo electrónico con el cual te registraste!');
  }

  send(){
    if(!this.data.email && !this.data.username){
      Swal.fire('Datos faltantes', 'Debes diligenciar por lo menos un dato!', 'error');
    }
    else{
      this.loading = true;
      this.http.post(this.ipBackend.ipBackend + 'reset-password', this.data)
      .subscribe((response:any) => {
        this.loading = false;
        if(response.ok){
          Swal.fire('Completado con éxito!', response.message, 'success');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3500);
        }else {
          Swal.fire('Error', response.message, 'error');
        }
      });
    }
  }

}
