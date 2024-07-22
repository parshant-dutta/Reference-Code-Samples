import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-boolean',
  templateUrl: './boolean.component.html',
  styleUrls: ['./boolean.component.scss']
})
export class BooleanComponent implements OnInit {
  @Input() fieldData: any;
  @Input() form: FormGroup;
  @Input() controlName: string;
  @Output() public optionChangeEvent: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }

  updateFieldValue(e,entityId){ 
       let obj = {entityFieldId: entityId, value:e.target.value}; 
       this.fieldData.formSectionFieldValue = e.target.value;
       this.optionChangeEvent.emit(obj);
  }

}
