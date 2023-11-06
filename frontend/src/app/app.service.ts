import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class IP {  
  ipBackend: string = 'http://localhost:5000/';
}