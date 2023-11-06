import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { IP } from '../app.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private http: HttpClient, 
    private router: Router,
    private ipBackend: IP){}

  userLogin = {
    username:'',
    password:'',
  }

  userRegister = {
    username: '',
    email:'',
    password:'',
    confirm:'',
  }

  loading = false;


  ngOnInit(): void {
    if(sessionStorage.getItem('userID') != null){
      this.router.navigate(['/map']);
    }
  }

  isRegister = false;
  isLogin = true;

  change(div:number){
    if(div === 1){
      this.isRegister = !this.isRegister;
      this.isLogin = !this.isLogin;
    }else if (div === 2){
      this.isRegister = !this.isRegister;
      this.isLogin = !this.isLogin;
    }
  }

  login(){
    if(this.userLogin.password != '' && this.userLogin.username != ''){
      this.loading = true;
      this.http.post(this.ipBackend.ipBackend + 'login-user', this.userLogin)
      .subscribe((response:any) => {
        if(response.ok){
          sessionStorage.setItem('idUserName', response.username);
          sessionStorage.setItem('isAdmin', response.isadmin);
          sessionStorage.setItem('userID', response.user_id);
          this.loading = false;
          this.router.navigate(['/map']);
        }else {
          this.loading = false;
          Swal.fire('Error en el Inicio de Sesión', response.message, 'error');
        }
      });
    }else if(this.userLogin.username == '' && this.userLogin.password == ''){
      Swal.fire('Campos requeridos', 'Nombre de Usuario y Contraseña', 'error');
    }else if(this.userLogin.username == ''){
      Swal.fire('Campos requeridos', 'Nombre de Usuario', 'error');
    }else if(this.userLogin.password == ''){
      Swal.fire('Campos requeridos', 'Contraseña', 'error');
    }
  }

  register(){
    if(this.userRegister.username != '' && this.userRegister.email != '' && this.userRegister.password != '' && this.userRegister.confirm != ''){
      if(this.userRegister.password === this.userRegister.confirm){
        Swal.fire({
          title: 'Registrarse',
          text: '¿Desea registrar este usuario? Sugerimos revisar la información ingresada antes de enviar',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Confirmar',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.value) {
            this.loading = true;
            this.http.post(this.ipBackend.ipBackend + 'register-user', this.userRegister)
            .subscribe((reponse:any)=>{
              if(reponse.ok){
                sessionStorage.setItem('idUserName', this.userRegister.username);
                this.loading = false;
                Swal.fire('Registro exitoso!', 'Usuario registrado con éxito!', 'success');
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
