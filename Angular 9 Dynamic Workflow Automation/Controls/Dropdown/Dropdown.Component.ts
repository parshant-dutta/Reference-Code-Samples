import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ConstraintTypeEnum } from '../../ConstraintTypeEnum';

@Component({
  selector: 'app-dropdown',
  templateUrl: './Dropdown.Component.html',
  styleUrls: ['./Dropdown.Component.scss'],
})
export class DropdownComponent implements OnInit, OnChanges {
  @Input() fieldData: any;
  @Input() formSection: any;
  @Input() dynamicData: any;
  @Input() form: FormGroup;
  @Input() controlName: string;
  data: any = [];
  size: number = 50;
  previousValue: any;
  @Output() optionChangeEvent: EventEmitter<any> = new EventEmitter<any>();

  public selectedId: number = 0;
  constructor() {}
  ngOnChanges(changes: SimpleChanges) {
    // this.form.controls[this.controlName].setValue(this.fieldData.formSectionFieldValue);
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
              this.filteredData = this.data;
              this.newIndex = 0;
              this.loadMore();
            }
          });
        } else {
          this.data = [];
          this.filteredData = this.data;
        }
        setTimeout(() => {
          if (
            this.fieldData.formSectionFieldValue !=
            this.form.controls[this.controlName].value
          ) {
            this.form.controls[this.controlName].setValue(
              this.fieldData.formSectionFieldValue
            );
          }
          document
            .getElementById('field_' + this.fieldData.entityFieldId)
            .setAttribute('value', this.fieldData.formSectionFieldValue);
          $(`#spin_${this.fieldData.entityFieldId}`).addClass('hide');
          $(`#field_${this.fieldData.entityFieldId}`).removeClass(
            'disablepointer'
          );
          $(`#fieldDropdown_${this.fieldData.entityFieldId}`).removeClass(
            'disablepointer'
          );
        }, 300);
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
                this.filteredData = this.data;
                // this.optionList = this.data.slice(0, this.size);
                this.newIndex = 0;
                this.loadMore();
              }
            }
          }
        });
      }
    }
  }

  isLoading: boolean;
  optionList: any = [];
  newIndex: number = 0;
  filteredData: any = [];
  loadMore(): void {
    if (this.newIndex == 0) {
      this.optionList = [];
    }
    if (this.filteredData.length > this.newIndex) {
      this.isLoading = true;
      this.newIndex = this.newIndex + this.size;
      this.optionList = this.filteredData.slice(0, this.newIndex);
      this.isLoading = false;
    }
  }

  onSearch(event) {
    this.newIndex = 0;
    this.filteredData = this.data.filter((x) =>
      x.lookupValue.toLowerCase().includes(event.toLowerCase())
    );
    this.loadMore();
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

  ngOnInit(): void {
    this.previousValue = this.fieldData.formSectionFieldValue;
  }

  optionChange(event, entityId) {
    let selectValue = event.value;
    if (this.previousValue != selectValue) {
      this.previousValue = selectValue;
      this.form.controls[this.controlName].updateValueAndValidity();
      let obj = { entityFieldId: entityId, value: selectValue };
      let selectedValue = this.form.get(this.controlName).value;
      this.fieldData.formSectionFieldValue = selectedValue;
      document
        .getElementById('field_' + entityId)
        .setAttribute('value', selectedValue);
      this.optionChangeEvent.emit(obj);
    }
  }

  onFocusout() {
    this.form.controls[this.controlName].updateValueAndValidity();
  }
}
