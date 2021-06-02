import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ResourceService } from 'src/app/Shared/Services/Resoucre.Service';
import { ConstraintTypeEnum } from '../../ConstraintTypeEnum';
import * as _moment from 'moment';
import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MomentDateTimeAdapter } from 'ng-pick-datetime/date-time/adapter/moment-adapter/moment-date-time-adapter.class';

export const MY_CUSTOM_FORMATS = {
  fullPickerInput: 'DD/MM/yyyy LT',
};



@Component({
  selector: 'app-datetime',
  templateUrl: './datetime.component.html',
  styleUrls: ['./datetime.component.scss'],
  providers: [DatePipe,
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS },
  ],
})
export class DatetimeComponent implements OnInit {
  @Input() fieldData: any;
  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() formSection: any;

  @Output() optionChangeEvent: EventEmitter<any> = new EventEmitter<any>();
  datePlaceHolderText: string = "";
  selectedLanguageId: any = 1;

  constructor(private resourceService: ResourceService, private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    if (this.form?.controls[this.controlName].value) {
      this.form.controls[this.controlName].setValue(new Date(this.form.controls[this.controlName].value));
    }
    this.selectedLanguageId = this.resourceService.getSelectedLanguageId();
  }

  onChange(result: any): void {
    if (result.selected) {
      this.fieldData.formSectionFieldValue = result.selected.toISOString();
      let obj = { entityFieldId: this.fieldData.entityFieldId, value: result.selected };
      this.optionChangeEvent.emit(obj);
    }
  }

  checkGraterThan() {
    if (this.fieldData && this.fieldData.constraints && this.fieldData.constraints.length) {
      let field = this.fieldData.constraints.some(v => v.constraintTypeId === ConstraintTypeEnum.GreaterThan);

    }
  }


  getVisibleByConstraint() {
    if (this.fieldData && this.fieldData.constraints && this.fieldData.constraints.length)
      return this.fieldData.constraints.some(v => v.constraintTypeId === ConstraintTypeEnum.VisibleByValue);
  }

  onFocusout(e) {
    this.form.controls[this.controlName].markAsDirty();
    this.form.controls[this.controlName].updateValueAndValidity();
    let obj = { entityFieldId: this.fieldData.entityFieldId, value: e.target.value };
    this.optionChangeEvent.emit(obj);
  }

}
