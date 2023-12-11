import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { constantsFormMode } from 'src/app/Shared/Constants';
import { ConstraintTypeEnum } from '../../ConstraintTypeEnum';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
})
export class MultiSelectComponent implements OnInit, OnChanges {
  @Input() fieldData: any;
  @Input() dynamicData: any;
  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() formMode: number;
  data: any = [];
  isDisabled: boolean;

  @Output() optionChangeEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
    this.isDisabled =
      this.formMode == constantsFormMode.completed || this.fieldData?.isDisable
        ? true
        : false;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.isDisabled =
      this.formMode == constantsFormMode.completed || this.fieldData?.isDisable
        ? true
        : false;
    let getisCascaded = this.getIsCascading();
    if (getisCascaded > 0) {
      let key = `field_${this.fieldData.entityFieldId}`;
      if (
        changes.dynamicData?.currentValue &&
        changes.dynamicData.currentValue[key]
      ) {
        let res = changes.dynamicData?.currentValue[key];
        let response = res.filter(
          (x) =>
            'fieldControl_' + x.entityFieldId + '_' + x.fieldTypeId ==
            this.controlName
        );
        if (response) {
          response.forEach((lookup) => {
            let dynamicName =
              'fieldControl_' + lookup.entityFieldId + '_' + lookup.fieldTypeId;
            if (dynamicName == this.controlName) {
              this.data = lookup.entityData
                ? JSON.parse(lookup.entityData)
                : [];
            }
          });
        } else {
          this.data = [];
        }
        setTimeout(() => {
          let multiSelectValue = this.fieldData.formSectionFieldValue;
          if (typeof multiSelectValue == 'string') {
            multiSelectValue = this.fieldData.formSectionFieldValue.split(',');
          }
          if (multiSelectValue != this.form.controls[this.controlName].value) {
            this.form.controls[this.controlName].setValue(multiSelectValue);
          }
          document
            .getElementById('field_' + this.fieldData.entityFieldId)
            .setAttribute('value', multiSelectValue);
          $(`#spin_${this.fieldData.entityFieldId}`).addClass('hide');
          $(`#field_${this.fieldData.entityFieldId}`).removeClass(
            'disablepointer'
          );
          $(`#fieldDropdown_${this.fieldData.entityFieldId}`).removeClass(
            'disablepointer'
          );
          this.isDisabled =
            this.formMode == constantsFormMode.completed ||
              this.fieldData?.isDisable
              ? true
              : false;
        }, 300);
        this.fieldData["fieldLookupData"] = this.data;
        this.updateValuesOnChnage(this.fieldData.entityFieldId, null);
      }
    } else {
      if (changes.dynamicData?.currentValue?.data) {
        let res = changes.dynamicData?.currentValue.data;
        res?.forEach((lookup) => {
          if (lookup.entityData) {
            let dynamicName =
              'fieldControl_' + lookup.entityFieldId + '_' + lookup.fieldTypeId;
            if (dynamicName == this.controlName) {
              if (this.data.length < 1) {
                this.data = JSON.parse(lookup.entityData);
              }
            }
          }
        });
        this.fieldData["fieldLookupData"] = this.data;
        this.updateValuesOnChnage(this.fieldData.entityFieldId, null);
      }
    }
  }

  getIsCascading() {
    if (!this.fieldData?.constraints) {
      return 0;
    }
    let constraint = this.fieldData?.constraints.find(
      (x) => x.constraintTypeId == ConstraintTypeEnum.CascadingLoad
    );
    if (constraint) {
      return JSON.parse(constraint.Settings).Cascaded;
    }
    return 0;
  }

  getSelectedValues(controlName, data) {
    let controlValue = this.form.controls[controlName].value;
    if (controlValue == '' || !controlValue) {
      controlValue = [];
    }
    let multiSelectValue = controlValue;
    if (typeof multiSelectValue == 'string') {
      multiSelectValue = controlValue.split(',');
    }
    let result = [];
    if (multiSelectValue.length > 0) {
      result = data.filter((x) =>
        multiSelectValue?.find((v) => v == x.lookupValueId.toString())
      );
    }
    return result;
  }

  optionChange(event, entityId) {
    this.form.controls[this.controlName].updateValueAndValidity();
    // let obj = { entityFieldId: entityId, value: event };
    let selectedValue = this.form.get(this.controlName).value;
    this.fieldData.formSectionFieldValue = selectedValue;
    document
      .getElementById('field_' + entityId)
      .setAttribute('value', selectedValue);
    // this.optionChangeEvent.emit(obj);
    this.updateValuesOnChnage(entityId, event);
  }

  updateValuesOnChnage(entityId, val) {
    let obj = { entityFieldId: entityId, value: val };
    this.optionChangeEvent.emit(obj);
  }

  onFocusout() {
    this.form.controls[this.controlName].updateValueAndValidity();
  }
}
