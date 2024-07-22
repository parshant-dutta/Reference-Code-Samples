import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ResourceService } from '../../../../Shared/Services/Resoucre.Service';
import { ConstraintTypeEnum } from '../../ConstraintTypeEnum';

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss']
})
export class DateTimeFieldComponent implements OnInit {

  @Input() fieldData: any;
  @Input() form:FormGroup;
  @Input() controlName: string;
  @Input() formSection: any;
  
  @Output() optionChangeEvent: EventEmitter<any> = new EventEmitter<any>();
  datePlaceHolderText: string="";
  selectedLanguageId: any = 1;

  constructor(private resourceService: ResourceService) { 

  }

  ngOnInit(): void {
    this.selectedLanguageId = this.resourceService.getSelectedLanguageId();
  }

  onChange(result: Date): void {   
    if(result){ 
      let formatedDate = typeof(result) != "string" ? result.toISOString() : result; //.split('T')[0];
      this.fieldData.formSectionFieldValue = formatedDate;
      let obj = { entityFieldId: this.fieldData.entityFieldId, value: result };
      this.optionChangeEvent.emit(obj);
    }
  }

  checkGraterThan(){
    if (this.fieldData && this.fieldData.constraints && this.fieldData.constraints.length){
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
