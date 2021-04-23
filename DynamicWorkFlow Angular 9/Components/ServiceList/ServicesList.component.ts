/*** Angular core modules ***/
import {
  Component,
  Output,
  EventEmitter,
  Input
} from '@angular/core';


@Component({
  selector: 'app-services-list',
  templateUrl: './ServicesList.component.html',
  styleUrls: ['./ServicesList.component.scss'],
})
export class ServicesListComponent {
  /// Properties
  @Output() serviceClickEvent = new EventEmitter();
  @Input('isLoad') isSpinning: string;
  @Input('serviceData') servicesList: any;
  @Input() isApiCall: boolean;

  //Event
  createApplication(index) {
    this.serviceClickEvent.emit(index);
  }
}
