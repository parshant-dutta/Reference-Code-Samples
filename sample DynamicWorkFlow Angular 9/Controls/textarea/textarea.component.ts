import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss']
})
export class TextareaComponent {

  @Input() fieldData: any;
  @Input() form:FormGroup;
  @Input() controlName: string;  
  
  updateFieldValue(){   
    this.form.controls[this.controlName].updateValueAndValidity();
    this.fieldData.formSectionFieldValue = this.form.get(this.controlName).value;     
  }
  
}
