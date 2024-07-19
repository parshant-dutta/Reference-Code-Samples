import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor() { }
  loaderObservable = new Subject<boolean>();
  loaderObservable$ = this.loaderObservable.asObservable();
}
