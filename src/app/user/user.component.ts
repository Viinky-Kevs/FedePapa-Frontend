import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { IP } from '../app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  constructor(
    private http: HttpClient, 
    private router: Router,
    private ipBackend: IP){}

  userData = {
    user_id: '',
    username: '',
    email:'',
    created_on: '',
    last_login:'',
  }

  userPasword = {
    userID: sessionStorage.getItem('userID'),
    password:'',
    confirm:''
  }

  displayedColumns: string[] = ['id_polygon', 'name_polygon', 'geometry', 'polygon_area', 'created_on'];
  data: any[] = [];
  loading = false;

  ngOnInit(): void {

    if(sessionStorage.getItem('userID') == null){
      Swal.fire('No has iniciado Sesión!', 'Por favor inicia sesión o registrate!', 'error');
      this.router.navigate(['/login']);
    }

    let userid = sessionStorage.getItem('userID') || 4;
    this.http.post(this.ipBackend.ipBackend + 'get-current-user-data', {userID: userid})
    .subscribe((response:any)=>{
      this.userData = response;
    });

    this.http.post(this.ipBackend.ipBackend + 'get-current-user-polygons', {userID: userid})
    .subscribe((response:any)=>{
      this.data = response.data[0];
    });
  }

  changeP(){
    if(this.userPasword.password != '' && this.userPasword.confirm != ''){
      if(this.userPasword.password === this.userPasword.confirm){
        Swal.fire({
          title: 'Cambiar Contraseña',
          text: '¿Desea cambiar la contraseña? Sugerimos revisar la información ingresada antes de enviar',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Confirmar',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.value) {
            this.loading = true;
            this.http.post(this.ipBackend.ipBackend + 'change-password-user', this.userPasword)
            .subscribe((reponse:any)=>{
              if(reponse.ok){
                this.loading = false;
                Swal.fire('Cambio exitoso!', reponse.message, 'success');
                window.location.reload();
              }else{
                this.loading = false;
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

}
