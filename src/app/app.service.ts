import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class IP {  
  ipBackend: string = 'https://backend-fedepapa-9ck6e.ondigitalocean.app/'; //'http://localhost:5000/';
}
