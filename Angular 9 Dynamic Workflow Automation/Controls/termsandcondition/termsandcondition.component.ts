import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { constantsFormMode } from 'src/app/Shared/Constants';

@Component({
  selector: 'app-termsandcondition',
  templateUrl: './termsandcondition.component.html',
  styleUrls: ['./termsandcondition.component.scss'],
})
export class TermsandconditionComponent implements OnInit {
  @Input() fieldData: any;
  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() formMode: number;
  isDisabled: boolean = false;
  constructor() {}

  ngOnInit(): void {
    if (this.formMode == constantsFormMode.completed) {
      this.isDisabled = true;
    } else {
      this.form.get(this.controlName).setValidators([Validators.required]);
    }
    this.form.get(this.controlName).value == ''
      ? this.form.get(this.controlName).setValue(null)
      : '';
  }

  updateFieldValue(value) {
    this.fieldData.formSectionFieldValue = this.form.get(
      this.controlName
    ).value;
  }
}
