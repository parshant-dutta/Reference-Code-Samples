import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { EventService } from '../service/event.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

  constructor(private event:EventService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.event.loaderObservable.next(true);
    return next.handle(request).pipe(finalize(() => {
      this.event.loaderObservable.next(false)
    }))
  }
}
