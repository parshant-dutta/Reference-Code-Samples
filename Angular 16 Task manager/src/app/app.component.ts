import { ChangeDetectorRef, Component } from '@angular/core';
import { EventService } from './core/service/event.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Simple-Angular-App';
  loader: boolean = false
  constructor(private eventservice: EventService, private cdk: ChangeDetectorRef) {

  }
  ngOnInit() {

  }
  ngAfterViewInit() {
    this.eventservice.loaderObservable.subscribe((res) => {
      this.loader = res;
      this.cdk?.detectChanges()
    })
  }
}
