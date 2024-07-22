import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-checkbox',
  templateUrl: './Checkbox.Component.html',
  styleUrls: ['./Checkbox.Component.scss'],
})
export class CheckboxComponent {
  @Input() fieldData: any;
  @Input() form:FormGroup;
  @Input() controlName: string;

  updateFieldValue(value){   
    this.fieldData.formSectionFieldValue = this.form.get(this.controlName).value;
  }
}
