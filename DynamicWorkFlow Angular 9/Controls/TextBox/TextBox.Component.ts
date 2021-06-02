import { Component, Input, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ConstraintTypeEnum } from '../../ConstraintTypeEnum';
@Component({
  selector: 'app-textbox',
  templateUrl: './TextBox.Component.html',
  styleUrls: ['./TextBox.Component.scss'],
})
export class TextboxComponent {
  @Input() fieldData: any;
  @Input() form: FormGroup;
  @Input() controlName: string;
  constraintTypeEnum: ConstraintTypeEnum;

  ngOnChanges(changes: SimpleChanges) {  }

  updateFieldValue() {    
    // this.form.get(this.controlName).markAsTouched({onlySelf:true});  
    this.form.controls[this.controlName].updateValueAndValidity();
    this.fieldData.formSectionFieldValue = this.form.get(this.controlName).value;
    if(this.form.get(this.controlName).value){
      this.fieldData['invalidField'] = false;
    }
  }

  public getVisibleByConstraint() {  
    if (this.fieldData && this.fieldData.constraints && this.fieldData.constraints.length)
      return this.fieldData.constraints.some(v => v.constraintTypeId === ConstraintTypeEnum.VisibleByValue);
  } 
}
