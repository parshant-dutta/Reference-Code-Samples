import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd';
import { ConstraintTypeEnum } from '../../ConstraintTypeEnum';
import { ChooseServiceCodeComponent } from '../../Modals/choose-service-code/choose-service-code.component';
import { CreateApplicationService } from '../../Services/CreateApplication.service';
@Component({
  selector: 'app-payment-code',
  templateUrl: './payment-code.component.html',
  styleUrls: ['./payment-code.component.scss']
})
export class PaymentCodeComponent implements OnChanges {

  constructor(
    private service: CreateApplicationService,
    private modal: NzModalService,
  ) { }
  @Input() fieldData: any;
  @Input() form: FormGroup;
  @Input() controlName: string;
  @Input() formSection: any;
  isSpinning: boolean = false;
  selectedServiceCodes:any=[]; 
  constraintTypeEnum: ConstraintTypeEnum;
  searchText:string;

  checked = false;
  loading = false;
  indeterminate = false;
  listOfData: any= [];
  listOfCurrentPageData: any = [];
  setOfCheckedId = new Set<number>();
  showServiceCode:boolean = false;

  ngOnChanges(changes: SimpleChanges) {    
    if(this.fieldData?.ServiceCodesList){
      this.listOfData = this.fieldData?.ServiceCodesList;
      this.setSelectedCode()
    }else{
      let isServiceCode = false;
      if(this.fieldData.Settings){
        if(JSON.parse(this.fieldData.Settings)?.serviceCodes){
          isServiceCode = true
        }
      } 
      let inputRequest = {
        "EntityFieldId": isServiceCode ? this.fieldData.entityFieldId : ''
      }
      this.service.getActivityLog('Payment/GetServiceCodeList',inputRequest)
      .subscribe((response)=>{
        if(response){
          this.listOfData = response;
          this.setSelectedCode()
        }
      })
    }
  }

  setSelectedCode(){
    let value = this.fieldData.formSectionFieldValue;
    let valueArr = value.split(',');
    if(this.fieldData){
      this.listOfData.map((x)=>{
        valueArr.map((value)=>{
          if(x.serviceCode ==  value){
            x['checked'] = true;           
            this.selectedServiceCodes.push(x);
            this.showServiceCode = true;
          }
        })
      })
    }
  }

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
  
  allChecked:boolean;
  checkAll(value: boolean): void {
   this.listOfData?.forEach(data => {
      data.checked = value;
    });
  }
  
  currentPageDataChange($event): void {
    this.listOfData = $event;   
    this.refreshStatus();
  }
  refreshStatus(): void {
    const validData = this.listOfData.filter(value => !value.disabled);
    const allChecked = validData.length > 0 && validData.every(value => value.checked === true);
    const allUnChecked = validData.every(value => !value.checked);
    this.allChecked = allChecked;
    this.indeterminate = !allChecked && !allUnChecked;
    //this.isAnySelctetd()
   
  }
  isAnySelctetd(){
    if(this.selectedServiceCodes){
      let checkedRecords = this.selectedServiceCodes.filter((x)=> x.checked == true);
      if(checkedRecords && checkedRecords.length > 0){
        let serviceCodeArr = []
        checkedRecords.map((y)=>{
          serviceCodeArr.push(y.serviceCode)
        })
        this.fieldData.formSectionFieldValue = serviceCodeArr ? serviceCodeArr.toString():'';
      }else{
        this.fieldData.formSectionFieldValue = '';
      }
      return checkedRecords;
    }else{
      this.form.get(this.controlName).setValue('');
      this.fieldData.formSectionFieldValue = '';
      return; 
    }
   
  }

  
  choosePaymentCode(){
    const modal = this.modal.create({
      nzContent: ChooseServiceCodeComponent,      
      nzMaskClosable: false,
      nzClosable: false,
      nzComponentParams: {
        data: this.listOfData       
      },
      nzWidth: '80%',
      nzFooter: [],
    });
    modal.afterOpen.subscribe((e) => {
      
    });
    modal.afterClose.subscribe((data) => {
      if(data && data.length > 0){
        this.selectedServiceCodes = data;
      }
    });
  
  }

  removeServiceCode(data){
    data.checked = false;
    this.selectedServiceCodes = this.selectedServiceCodes.filter((x)=>x.serviceCode != data.serviceCode);
  }
 
}
