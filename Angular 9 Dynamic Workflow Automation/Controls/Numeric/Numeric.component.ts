import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-numeric',
  templateUrl: './Numeric.Component.html',
  styleUrls: ['./Numeric.Component.scss'],
})
export class NumericComponent {
  @Input() fieldData: any;
  @Input() form:FormGroup;
  @Input() controlName: string;

  updateFieldValue(){
    this.form.controls[this.controlName].updateValueAndValidity();
    this.fieldData.formSectionFieldValue = this.form.get(this.controlName).value  ? this.form.get(this.controlName).value.toString() : '';
  }
}
