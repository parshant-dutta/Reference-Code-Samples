import { Component, OnInit, Input} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit {

  @Input() fieldData: any;  
  @Input() form:FormGroup;
  @Input() controlName: string;

  constructor() { }

  ngOnInit(): void {
  }


}
