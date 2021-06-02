import { Component, OnInit, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd';
import { GoogleMapModalComponent } from '../../Modals/google-map-modal/google-map-modal.component';
// import { } from '@types/googlemaps';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  @Input() fieldData: any;  
  @Input() form:FormGroup;
  @Input() controlName: string;
  
  @ViewChild('gmap') gmapElement: any;
  map: any
  markers: google.maps.Marker[] = [];

  constructor(
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
  ) { }

  ngOnInit(): void { }

  openMap(fildData){
    const modal = this.modal.create({
      nzContent: GoogleMapModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzComponentParams: {
        data:fildData
      },
      nzWidth: '50%',
      nzFooter: [],
    });
    modal.afterClose.subscribe((result) => {
      if (result) {
        this.fieldData.formSectionFieldValue = result.latLng.lat() +","+ result.latLng.lng();
        this.form.get(this.controlName).setValue( result.latLng.lat() +","+ result.latLng.lng() );
      }
    })  
  }
}
 