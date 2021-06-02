import {
  Component,
  Input,
  Output,
  OnInit,
  ViewContainerRef,
  EventEmitter,
  OnChanges,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd';
import { AuthService } from 'src/app/Core/Services/AuthService';
import { Utils } from 'src/app/Utils/Utils';
import { constants, constantsFormMode } from '../../../../Shared/Constants';
import { ResourceService } from '../../../../Shared/Services/Resoucre.Service';
import {
  ConstraintTypeEnum,
  FileConstraintTypeEnum,
} from '../../ConstraintTypeEnum';
import { EntityFieldTypeEnum } from '../../EntityFieldTypeIdEnum';
import { DynamicFieldModalComponent } from '../../Modals/dynamic-field-modal/dynamic-field-modal.component';
import { DynamicSectionModalComponent } from '../../Modals/dynamic-section-modal/dynamic-section-modal.component';
import { SingleSelectionModalComponent } from '../../Modals/single-selection-modal/single-selection-modal.component';
import { CreateApplicationService } from '../../Services/CreateApplication.service';
import * as XLSX from 'xlsx';
import { DataloadService } from '../../Services/dataload.service';
@Component({
  selector: 'app-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class FieldsComponent implements OnInit, OnChanges {
  @Input() fieldData: any;
  @Input() form;
  @Input() formSectionData;
  @Input() formsValidateStatus;
  @Input() dynamicData: any = {};
  @Input() applicationStageId;
  @Input() attachments;
  @Input() enableCheckBoxes;
  @Input() appProfileAppId;
  @Input() appGlobalData;
  @Input() noBorders: boolean;
  @Input() languageChanged: any;
  @Output() loaderEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() selectEvent: EventEmitter<any> = new EventEmitter<any>();
  isLoading: boolean = true;
  resources: any;
  childrenFieldsData: any[] = [];
  tableRows: any[] = [];
  applicationId: number = 0;
  cascadedLookupsData: any;
  isFormTouched: boolean = false;

  isSpinning: boolean = false;
  buttonYesText: string = '';
  buttonCancelText: string = '';
  deleteConfirmationText: string = '';
  selectedLanguageId: any = 0;
  listOfParentData: any[] = [];
  listOfChildrenData: any[] = [];
  showLoader: boolean = false;
  expandSet = new Set<number>();
  modalMode: string = 'add';
  selectedOptionId: any;
  seletedReferenceFields: any;
  childFormFields: any[] = [];
  childFormFieldsAttachments: any[] = [];
  cascadedArray = [];
  childrenIndexObj: any;

  constructor(
    private route: ActivatedRoute,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private resourceService: ResourceService,
    private applicationService: CreateApplicationService,
    private ref: ChangeDetectorRef,
    private authservice: AuthService,
    public dataloadingService: DataloadService
  ) {
    this.resources = this.resourceService.getResouceData();
    this.selectedLanguageId = this.resourceService.getSelectedLanguageId();
    this.deleteConfirmationText =
      this.selectedLanguageId == 2
        ? constants.deleteConfirmationTextAra
        : constants.deleteConfirmationTextEng;
    this.buttonYesText =
      this.selectedLanguageId == 2
        ? constants.buttonYesTextAra
        : constants.buttonYesTextEng;
    this.buttonCancelText =
      this.selectedLanguageId == 2
        ? constants.buttonCancelTextAra
        : constants.buttonCancelTextEng;

    //Get application id
    this.route.params.subscribe((param) => {
      this.applicationId = param.id;
    });
  }

  ngOnInit(): void { }
  ngOnChanges() {
    this.dynamicData = { ...this.dynamicData };
    if (this.languageChanged) {
      this.isFormCompiled = 0;
    }
    if (this.formsValidateStatus) {
      this.isFormTouched = this.formsValidateStatus.find(
        (x) => x.formId == this.formSectionData.formId
      )?.isTouched;
    }
  }

  isFormCompiled: number = 0;
  async checkFieldsVisibility(islast) {
    if (islast && this.isFormCompiled < 1) {
      this.isFormCompiled = this.isFormCompiled + 1;
      let sectionName =
        'form_' +
        this.formSectionData.formId +
        '_mode_' +
        this.formSectionData.formMode;
      this.makeFieldsVisible();
      if (
        this.formSectionData &&
        this.formSectionData.formMode == constantsFormMode.completed
      ) {
        // this.fieldData.map((field) => {
        for (
          let fieldloop = 0;
          fieldloop < this.fieldData?.length;
          fieldloop++
        ) {
          let field = this.fieldData[fieldloop];

          // field.constraints?.map((constraint) => {
          for (let i = 0; i < field.constraints?.length; i++) {
            let constraint = field.constraints[i];
            let cascadedkey = `field_${field.entityFieldId}`;
            if (
              constraint.Settings &&
              JSON.parse(constraint.Settings)?.Cascaded
            ) {
              let selectedCascadedFieldValue = this.fieldData.find(
                (x) =>
                  x.entityFieldId == JSON.parse(constraint.Settings)?.Cascaded
              );
              if (selectedCascadedFieldValue) {
                // Bind cascaded fields only when creating groups
                // if (!this.dynamicData[cascadedkey]) {
                if (selectedCascadedFieldValue.formSectionFieldValue) {
                  this.cascadedFieldOperation(
                    JSON.parse(constraint.Settings)?.Cascaded,
                    field,
                    selectedCascadedFieldValue.formSectionFieldValue
                  );
                }
                // }
              }
            }
          }
          // });
        }
        // });

        setTimeout(() => {
          $('.' + sectionName + " [id*='field_']").prop('disabled', true);
          $('.' + sectionName + " [id*='field_']").prop('nzDisabled', true);

          $('.' + sectionName + " [id*='fieldDropdown_']").prop(
            'disabled',
            true
          );
          $('.' + sectionName + " [id*='fieldDropdown_']").prop(
            'nzDisabled',
            true
          );
        }, 200);
      } else {
        // this.makeFieldsVisible();
        // this.checkFieldCascaded();
        this.MakeModalFieldsVisible(this.fieldData);
        // this.fieldData.map(async (field) => {
        for (
          let fieldloop = 0;
          fieldloop < this.fieldData?.length;
          fieldloop++
        ) {
          let field = this.fieldData[fieldloop];
          if (field.fieldTypeId == 7 && field.relationType == 'Single') {
            this.seletedReferenceFields = field;
            this.getMappingValue();
          }
          for (let i = 0; i < field.constraints?.length; i++) {
            let constraint = field.constraints[i];

            if (
              constraint.Settings &&
              JSON.parse(constraint.Settings)?.Cascaded
            ) {
              let selectedCascadedFieldValue = this.fieldData.find(
                (x) =>
                  x.entityFieldId == JSON.parse(constraint.Settings)?.Cascaded
              );

              if (selectedCascadedFieldValue) {

                // Bind cascaded fields only when creating groups
                if (selectedCascadedFieldValue.formSectionFieldValue) {
                  await this.cascadedFieldOperation(
                    JSON.parse(constraint.Settings)?.Cascaded,
                    field,
                    selectedCascadedFieldValue.formSectionFieldValue
                  );
                }
              }
            }
            this.setDynamicValidator(field, constraint);

          }
        }
      }
    }
  }

  setDynamicValidator(field, constraint) {
    if (constraint['constraintTypeId'] === ConstraintTypeEnum.Required) {
      if (
        constraint['Settings'] &&
        JSON.parse(constraint['Settings'])?.Required
      ) {
        let constraintValue = JSON.parse(constraint['Settings'])['Required'];
        let fieldRequiredNumberOfTimes = 0;
        for (const key in constraintValue.ControlBy) {
          let control = $(`#field_${constraintValue.ControlBy[key]}`).attr(
            'aria-label'
          );
          if (control) {
            let value =
              control != 'undefined' ? this.form.get(control).value : '';
            if (value) {
              if (
                constraintValue.Values.find(
                  (x) => x.toString() == value.toString()
                )
              ) {
                fieldRequiredNumberOfTimes = fieldRequiredNumberOfTimes + 1;
              }
              let currentControl = $(`#field_${field.entityFieldId}`).attr(
                'aria-label'
              );
              if (fieldRequiredNumberOfTimes > 0) {
                if (currentControl) {
                  this.form
                    .get(currentControl)
                    .setValidators([Validators.required]);
                  $(`#label_${field.entityFieldId}`).addClass('field-required');
                  this.form.controls[currentControl].updateValueAndValidity();
                  return;
                }
              } else {
                this.form
                  .get(currentControl)
                  ?.clearValidators([Validators.required]);
                $(`#label_${field.entityFieldId}`).removeClass(
                  'field-required'
                );
                this.form.controls[currentControl].updateValueAndValidity();
              }
              this.ref.detectChanges();
            }
          }
        }
      }
    }
  }

  getVisibleByConstraint(fieldData) {
    const control = `fieldControl_${fieldData.entityFieldId}_${fieldData.fieldTypeId}`;
    let constraints = Utils.parse(fieldData.constraints);
    if (fieldData && fieldData.constraints && fieldData.constraints.length) {
      var isValid = fieldData.constraints.some(
        (v) => v.constraintTypeId === ConstraintTypeEnum.VisibleByValue
      );
      return isValid;
    }
  }
  checkIfDisabled(field) {
    let constraint = field?.constraints?.find((x) => x.constraintTypeId == 1);
    if (constraint) {
      if (
        constraint['Settings'] &&
        JSON.parse(constraint['Settings'])?.isOwner
      ) {
        if (
          !this.appGlobalData.isOwner ||
          !JSON.parse(constraint['Settings']).isOwner
        ) {
          $(`#label_${field.entityFieldId}`).removeClass('field-required');
        }
      }
    }
    let controlName = `fieldControl_${field.entityFieldId}_${field.fieldTypeId}`;
    let result;
    if (this.form && controlName) {
      result = this.form.controls[controlName].disabled;
    }

    if (field.fieldModeId == 2 && this.formSectionData.formMode == 1) {
      // this.disableSpecificField(field);
      if (field.formSectionFieldSettings) {
        let settings = JSON.parse(field.formSectionFieldSettings);
        if (settings.editable) {
          if (
            (this.appGlobalData.isOwner && settings.editable.isOwner) ||
            (this.appGlobalData?.isAssigned && settings?.editable.isAssigned)
          ) {
            this.form.controls[controlName].enable();
          } else if (
            !(this.appGlobalData.isOwner && settings.editable.isOwner)
          ) {
            if (field.fieldTypeId == 3 || field.fieldTypeId == 5) {
              field['isDisable'] = true;
            }
            this.disableSpecificField(field);
            let sectionIndex = field?.constraints?.findIndex(
              (x) => x.constraintTypeId == 1
            );
            field.constraints?.splice(sectionIndex, 1);
            this.form.get(controlName)?.clearValidators([Validators.required]);
          }
          let loginUserRole = this.authservice.getRole;
          if (settings?.editable?.roles && loginUserRole) {
            let newValue = loginUserRole
              .toString()
              .toLowerCase()
              .includes(settings?.editable?.roles.toString().toLowerCase());
            if (newValue) {
              this.form.controls[controlName].enable();
            }
          }
        } else {
          this.disableSpecificField(field);
        }
      } else {
        // if(field.fieldModeId == 2){       
        //   field['isDisable'] = true;
        //   this.form.get(controlName)?.clearValidators([Validators.required]);
        // } 
        this.disableSpecificField(field);
      }
    }

    // check for the copy from fields
    if (field.formSectionFieldSettings) {
      let settings = JSON.parse(field.formSectionFieldSettings);
      if (settings.copyFromFields) {
        settings.copyFromFields.map((entityId) => {
          this.fieldData.find((x) => x.entityFieldId == entityId)[
            'linkedWith'
          ] = field.entityFieldId;
          $('#choosefieldcontainer_' + entityId).removeClass('hide');
        });
      }
    }
    return result;
  }

  chooseDate(field, event) {
    let selectedValue = '';
    let linkedwithfield = field['linkedWith'];
    if (linkedwithfield > 0) {
      let chosendatefield = this.fieldData.find(
        (x) => x.entityFieldId == linkedwithfield
      );
      let chosenfieldcontrolname = (
        'fieldControl_' +
        chosendatefield.entityFieldId +
        '_' +
        chosendatefield.fieldTypeId
      ).trim();
      if (event.target.checked) {
        if (chosendatefield.formSectionFieldSettings) {
          let settings = JSON.parse(chosendatefield.formSectionFieldSettings);
          if (settings.copyFromFields) {
            settings.copyFromFields.map((entityId) => {
              if (field.entityFieldId != entityId) {
                $('#choosefieldcheckbox_' + entityId).prop('checked', false);
              }
            });
          }
        }
        selectedValue = field.formSectionFieldValue;
      } else {
        selectedValue = '';
      }

      if (
        selectedValue &&
        (field.fieldTypeId == 3 || field.fieldTypeId == 10)
      ) {
        this.form.controls[chosenfieldcontrolname].setValue(
          new Date(selectedValue).toISOString()
        );
        this.fieldData.find((x) => x.entityFieldId == linkedwithfield)[
          'formSectionFieldValue'
        ] = new Date(selectedValue).toISOString();
      } else {
        this.form.controls[chosenfieldcontrolname].setValue(selectedValue);
        this.fieldData.find((x) => x.entityFieldId == linkedwithfield)[
          'formSectionFieldValue'
        ] = selectedValue;
      }
    }
  }

  async uploadExcel(field, ev) {
    this.loaderEvent.emit(true);
    await this.getRelatedFieldsOptions();
    this.ref.detectChanges();
    setTimeout(() => {
      //ToDo: Need to find the solution for loader
      let isValidSheet = false;
      let errorExecutedFromCatch = false;
      try {
        if (
          ev.target.files[0].type ==
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          ev.target.files[0].type == 'application/vnd.ms-excel'
        ) {
          let workBook = null;
          let jsonData = null;
          const reader = new FileReader();
          const file = ev.target.files[0];
          reader.onload = (event) => {
            const data = reader.result;
            workBook = XLSX.read(data, { type: 'binary' });
            jsonData = workBook.SheetNames.filter(
              (x, index) => index == 0
            ).reduce((initial, name) => {
              const sheet = workBook.Sheets[name];
              // initial[name] = XLSX.utils.sheet_to_json(sheet);
              // return initial;
              return XLSX.utils.sheet_to_json(sheet);
            }, {});

            let configfields = field.childrens.fields;

            jsonData.forEach((item, index) => {
              let childrendata = {};
              if (index > 0) {
                // let itemkeys = Object.keys(item);
                let lastIndex =
                  field.childrens?.values.length > 0
                    ? Math.max.apply(
                      Math,
                      field.childrens.values.map(function (o) {
                        return o.ItemIndex;
                      })
                    )
                    : 1;
                let nextIndex = lastIndex + 1;
                childrendata = {
                  RowIndex: nextIndex,
                  canDelete: true,
                  canEdit: true,
                  AllFields: [],
                };

                isValidSheet = true;
                configfields.map(async (configField) => {
                  let key = configField.entityFieldId;

                  let fieldvalue = item[key]?.toString();

                  if ((configField.fieldTypeId == 5 || configField.fieldTypeId == 4) && configField.Settings && JSON.parse(configField.Settings).relatedField) {
                    let relatedSetting = JSON.parse(configField.Settings).relatedField;
                    let uniqueKey = `${relatedSetting.id}_${relatedSetting.textFieldId}`;
                    let lookupsdata = field.childrenLookupsData.find(x => x.relatedParentAndFieldId == uniqueKey);
                    if (lookupsdata) {
                      let optionsAvailable = JSON.parse(lookupsdata.entityData);
                      if (configField.fieldTypeId == 4) {
                        let updatedvalues = [];
                        let multiSelectValue = fieldvalue;
                        if (typeof multiSelectValue == 'string') {
                          multiSelectValue = fieldvalue.split(',');
                        }
                        multiSelectValue.forEach(value => {
                          if (value) {
                            let isValueAvailable = optionsAvailable.find(x => x.lookupValue.toLowerCase() == value.toLowerCase())
                            if (isValueAvailable) {
                              updatedvalues.push(isValueAvailable.lookupValueId);
                            } else {
                              isValidSheet = false;
                              throw "Please validate the sheet data";
                            }
                          }
                        })

                        fieldvalue = updatedvalues;
                      } else {
                        if (fieldvalue) {
                          let isValueAvailable = optionsAvailable.find(x => x.lookupValue.toLowerCase() == fieldvalue.toLowerCase());
                          if (!isValueAvailable) {
                            fieldvalue = "";
                            isValidSheet = false;
                            throw "Please validate the sheet data";
                          } else {
                            fieldvalue = isValueAvailable.lookupValueId;
                          }
                        }
                      }
                    }
                  } else if (configField.fieldTypeId == 5) {
                    let result = JSON.parse(
                      field.childrenLookupsData?.find(
                        (x) =>
                          x.entityFieldId == configField.entityFieldId
                      )?.entityData
                    ).find((x) => x.lookupValueId.toString() == fieldvalue)
                      ? fieldvalue
                      : '';
                    fieldvalue = result;
                  } else if (configField.fieldTypeId == 4) {
                    let multiSelectValue = [];
                    if (typeof fieldvalue == 'string') {
                      multiSelectValue = fieldvalue.split(',').filter((x) => x);
                    } else {
                      multiSelectValue = fieldvalue;
                    }
                    let updatedValue = [];
                    multiSelectValue.forEach(x => {
                      let result = JSON.parse(
                        field.childrenLookupsData?.find(
                          (x) =>
                            x.entityFieldId == configField.entityFieldId
                        )?.entityData
                      ).find((x) => x.lookupValueId.toString() == fieldvalue)
                        ? fieldvalue
                        : '';
                      updatedValue.push(result);
                    })
                    fieldvalue = updatedValue;
                  }
                  let childrenrowdata = {
                    Fields: [],
                    ItemIndex: nextIndex,
                    canDelete: configField.canAdd,
                    canEdit: configField.canAdd,
                  };
                  let valObj = {
                    entityFieldId: Number(key),
                    itemIndex: nextIndex,
                    formSectionFieldValue: fieldvalue,
                  };
                  // if (isValidSheet) {
                    if (field?.childrens?.values) {
                      if (field.childrens.values.length > 0) {
                        if (
                          nextIndex ==
                          field.childrens.values[
                            field.childrens.values.length - 1
                          ].ItemIndex
                        ) {
                          field.childrens.values
                            .find(
                              (x) =>
                                x.ItemIndex ==
                                field.childrens.values[
                                  field.childrens.values.length - 1
                                ].ItemIndex
                            )
                            .Fields.push(valObj);
                        } else {
                          childrenrowdata['Fields'].push(valObj);
                          field?.childrens?.values?.push(childrenrowdata);
                        }
                      } else {
                        childrenrowdata['Fields'].push(valObj);
                        field?.childrens?.values?.push(childrenrowdata);
                      }
                    }

                    let AllFields = {
                      Fields: [],
                      ItemIndex: nextIndex,
                      canDelete: configField.canAdd,
                      canEdit: configField.canAdd,
                    };
                    let obj = {
                      constraints: configField.constraints,
                      entityFieldId: Number(key),
                      fieldModeId: configField.fieldModeId,
                      fieldTypeId: configField.fieldTypeId,
                      formSectionFieldName:
                        configField.formSectionFieldName,
                      formSectionFieldOrder:
                        configField.formSectionFieldOrder,
                      formSectionFieldTypeName:
                        configField.formSectionFieldTypeName,
                      showOnMainForm: configField.showOnMainForm,
                      formSectionFieldValue: fieldvalue,
                      formSectionFieldNameKey:
                        configField.formSectionFieldNameKey, // (jsonData[0])[key].toString(),
                      formSectionFieldid: field.formSectionFieldid,
                      itemIndex: nextIndex,
                    };
                    if (field?.childrens?.AllFields) {
                      if (field.childrens.AllFields.length > 0) {
                        if (
                          nextIndex ==
                          field.childrens.AllFields[
                            field.childrens.AllFields.length - 1
                          ].ItemIndex
                        ) {
                          field.childrens.AllFields.find(
                            (x) =>
                              x.ItemIndex ==
                              field.childrens.AllFields[
                                field.childrens.AllFields.length - 1
                              ].ItemIndex
                          ).Fields.push(obj);
                        } else {
                          AllFields['Fields'].push(obj);
                          field?.childrens?.AllFields?.push(AllFields);
                        }
                      } else {
                        AllFields['Fields'].push(obj);
                        field?.childrens?.AllFields?.push(AllFields);
                      }
                    }
                  // }
                });
              }
            });

            $(`#uploadfromexcel_${field.entityFieldId}`).val('');
            this.loaderEvent.emit(false);
            if (!isValidSheet) {
              let messageUploading = this.resources.find(
                (x) =>
                  x.category.toLowerCase() == 'alerts' &&
                  x.key.toLowerCase() == 'invalidFile'
              );
              this.applicationService.notify(
                'error',
                messageUploading?.value ? messageUploading?.value : 'Error',
                messageUploading?.value
                  ? messageUploading?.value
                  : 'Invalid File'
              );
            }
          };

          reader.readAsBinaryString(file);
        } else {
          throw new Error('Invalid File');
        }
      } catch (ex) {
        errorExecutedFromCatch = true;
        let messageUploading = this.resources.find(
          (x) =>
            x.category.toLowerCase() == 'alerts' &&
            x.key.toLowerCase() == 'invalidFile'
        );
        this.applicationService.notify(
          'error',
          messageUploading?.value ? messageUploading?.value : 'Error',
          messageUploading?.value ? messageUploading?.value : 'Invalid File'
        );
      }
    }, 100);
  }

  async validateValueInList(field, fieldValue, lookupsdata) {
    if (field.fieldTypeId == 5 || field.fieldTypeId == 4) {
      // let responseResult = [];
      // let key = `field_${field.entityFieldId}`;
      // if (this.dynamicData[key]) {
      //   responseResult = this.dynamicData[key];
      // } else if (this.dynamicData?.data) {
      //   responseResult = this.dynamicData?.data;
      // }
      let result = lookupsdata.find(
        (x) => x.entityFieldId == field.entityFieldId
      );
      // .forEach((result) => {
      if (result.entityFieldId == field.entityFieldId) {
        // let currentControl = `fieldControl_${field.entityFieldId}_${field.fieldTypeId}`;
        let valueAvaiable;
        if (field.fieldTypeId == 4 && result.entityData) {
          valueAvaiable = [];
          let multiSelectValue = [];
          if (typeof field.fieldValue == 'string') {
            multiSelectValue = field.fieldValue.split(',').filter((x) => x);
          } else {
            multiSelectValue = field.fieldValue;
          }
          multiSelectValue?.map((value) => {
            JSON.parse(result.entityData).find(
              (x) => x.lookupValueId.toString() == value
            )
              ? valueAvaiable.push(value)
              : '';
          });
          // this.form.get(currentControl).setValue(valueAvaiable);
          // field.formSectionFieldValue = valueAvaiable;
          fieldValue = valueAvaiable;
        } else if (result.entityData) {
          valueAvaiable = JSON.parse(result.entityData).find(
            (x) => x.lookupValueId.toString() == field.formSectionFieldValue
          )
            ? field.formSectionFieldValue
            : null;
          // this.form.get(currentControl).setValue(valueAvaiable);
          // field.formSectionFieldValue = valueAvaiable;
          fieldValue = valueAvaiable;
        }
      }
      // });
    }

    return fieldValue;
  }

  checkListControlForValues(field) {
    if (this.formSectionData?.formMode == 2 || field?.isDisable) {
      return;
    }

    // if (field.fieldTypeId == 5 || field.fieldTypeId == 4) {
    //   let responseResult = [];
    //   let key = `field_${field.entityFieldId}`;
    //   if (this.dynamicData[key]) {
    //     responseResult = this.dynamicData[key];
    //   } else if (this.dynamicData?.data) {
    //     responseResult = this.dynamicData?.data;
    //   }

    //   responseResult.forEach(res => {
    //     if (res.entityFieldId == field.entityFieldId) {
    //       let currentControl = `fieldControl_${field.entityFieldId}_${field.fieldTypeId}`;
    //       let valueAvaiable;
    //       if (field.fieldTypeId == 4 && res.entityData) {
    //         valueAvaiable = [];
    //         let multiSelectValue = [];
    //         if (typeof (field.formSectionFieldValue) == "string") {
    //           multiSelectValue = field.formSectionFieldValue.split(',').filter(x => x);
    //         } else {
    //           multiSelectValue = field.formSectionFieldValue
    //         }
    //         multiSelectValue?.map(value => {
    //           JSON.parse(res.entityData).find(x => x.lookupValueId.toString() == value) ? valueAvaiable.push(value) : "";
    //         })
    //         this.form.get(currentControl).setValue(valueAvaiable);
    //         field.formSectionFieldValue = valueAvaiable;
    //       } else if (res.entityData) {
    //         valueAvaiable = JSON.parse(res.entityData).find(x => x.lookupValueId.toString() == field.formSectionFieldValue) ? field.formSectionFieldValue : "";
    //         this.form.get(currentControl).setValue(valueAvaiable);
    //         field.formSectionFieldValue = valueAvaiable;
    //       }

    //     }
    //   })
    // }
  }

  checkIfFileDisabled(field) {
    let constraint = field?.constraints?.find((x) => x.constraintTypeId == 1);
    if (constraint) {
      if (
        constraint['Settings'] &&
        JSON.parse(constraint['Settings'])?.isOwner
      ) {
        if (
          !this.appGlobalData.isOwner ||
          !JSON.parse(constraint['Settings']).isOwner
        ) {
          $(`#label_${field.AttachmentId}`).removeClass('field-required');
        }
      }
    }
    let controlName = `fieldControl_${field.FormSectionAttachmentId}_${field.AttachmentTypeId}`;
    // field.FieldModeId == 2 &&
    if (this.formSectionData.formMode == 1) {
      // if(field.FieldModeId == 2){       
      //   field['isDisable'] = true;
      //   this.form.get(controlName)?.clearValidators([Validators.required]);
      // } 
      if (field.Settings) {
        let settings = JSON.parse(field.Settings);
        if (settings.editable) {
          if (
            (this.appGlobalData.isOwner && settings.editable.isOwner) ||
            (this.appGlobalData?.isAssigned && settings?.editable.isAssigned)
          ) {
            field['isDisable'] = false;
            this.form.controls[controlName].enable();
          } else if (
            !(this.appGlobalData.isOwner && settings.editable.isOwner)
          ) {
            field['isDisable'] = true;
          }
        }
      }
    }
    if (this.form && controlName) {
      return this.form.controls[controlName]?.disabled;
    }
  }
  onSelectionChange(object) {
    this.selectedOptionId = object.entityFieldId;
    this.makeFieldsVisible();
    this.checkFieldCascaded(true, this.selectedOptionId);
    this.ref.detectChanges();
    this.getRelatedFieldsOptions();
  }

  checkFieldCascaded(selectionChanged, selectionChangedFor) {
    if (!this.formSectionData) {
      return;
    }
    for (var section in this.formSectionData.formSection) {
      let currentSection = this.formSectionData.formSection[section];
      if (!currentSection.hasOwnProperty('formSectionFields')) continue;
      this.checkfieldsCascaded(
        currentSection.formSectionFields,
        selectionChanged,
        selectionChangedFor
      );
    }

    //child modal cascaded fields
    if (this.fieldData) {
      this.checkfieldsCascaded(
        this.fieldData,
        selectionChanged,
        selectionChangedFor
      );
    }
  }

  async checkfieldsCascaded(fields, selectionChanged, selectionChangedFor) {
    for (let field in fields) {
      let currentField = fields[field];
      if (!currentField.hasOwnProperty('constraints')) continue;

      if (
        currentField.fieldTypeId == EntityFieldTypeEnum.Options ||
        currentField.fieldTypeId == EntityFieldTypeEnum.MultiSelect
      ) {
        let isCascaded = this.checkCascadedConstraints(
          currentField.constraints
        );

        //let control = $(`#field_${isCascaded}`).attr('ng-reflect-name');
        //let value = this.form.get(control).value;
        if (isCascaded > 0 && this.selectedOptionId == isCascaded) {
          let value = this.fieldData.find((x) => x.entityFieldId == isCascaded)
            ?.formSectionFieldValue;
          // let value = $(`#field_${isCascaded}`).val();
          //clear selected value
          if (
            selectionChanged &&
            isCascaded == selectionChangedFor.toString()
          ) {
            // clear values when parent value changed
            let fieldPreviousValue = this.fieldData.find(
              (x) => x.entityFieldId == currentField.entityFieldId
            ).formSectionFieldValue;
            if (fieldPreviousValue) {
              let controlName = `fieldControl_${currentField.entityFieldId}_${currentField.fieldTypeId}`;
              $(`#fieldDropdown_${currentField.entityFieldId}`).val('');
              $(`#field_${currentField.entityFieldId}`).val('');
              this.fieldData.find(
                (x) => x.entityFieldId == currentField.entityFieldId
              ).formSectionFieldValue = '';
              this.form.controls[controlName].setValue(null);
            }
          }
          await this.cascadedFieldOperation(isCascaded, currentField, value);
        }
      }

      if (currentField.fieldTypeId == EntityFieldTypeEnum.DateTime) {
        this.checkDateConstraint(
          currentField.constraints,
          currentField.entityFieldId,
          currentField.fieldTypeId
        );
      }

      currentField['constraints'].forEach((constraint) => {
        this.setDynamicValidator(fields[field], constraint);
      });
    }
  }

  async cascadedFieldOperation(isCascaded, currentField, value) {
    return new Promise(async (resolve, reject) => {
      let cascadedkey = `field_${currentField.entityFieldId}`;
      delete this.dynamicData[cascadedkey];
      $(`#spin_${currentField.entityFieldId}`).removeClass('hide');
      $(`#field_${currentField.entityFieldId}`).addClass('disablepointer');
      $(`#fieldDropdown_${currentField.entityFieldId}`).addClass(
        'disablepointer'
      );
      // const promise = new Promise(async (resolve, reject) => {
      let casCadedData = await this.getCascadedData(
        isCascaded,
        currentField,
        value
      );
      resolve(casCadedData);
      // });
      // return promise.then((value: any) => {
      //   return value;
      // });
    });
  }

  checkCascadedConstraints(constraints) {
    let constraint = constraints.find(
      (x) => x.constraintTypeId == ConstraintTypeEnum.CascadingLoad
    );
    if (constraint) {
      return JSON.parse(constraint.Settings).Cascaded;
    }
    return 0;
  }

  async getCascadedData(cascadedFildId, currentselectedfield, value) {
    let entityFieldId = currentselectedfield.entityFieldId;
    let requestParams = {
      EntityFieldId: entityFieldId,
      Value: value,
      // LookupParentId: this.selectedOptionlookupId,
    };

    let lookupObject: any;
    let data = this.dynamicData.data;
    let cascadedkey = `field_${entityFieldId}`;
    const promise = new Promise((resolve, reject) => {
      if (data) {
        let currentCascadedField = data.find(
          (field) => field.entityFieldId == cascadedFildId
        );
        // const promise = new Promise((resolve, reject) => {
        if (currentCascadedField) {
          let entityData = JSON.parse(currentCascadedField.entityData);
          lookupObject = entityData?.find(
            (lookup) => lookup.lookupValueId == value
          );
          // resolve(lookupObject?.lookupId);
          // }
          // });
          // return promise.then((value: any) => {
          let dynamicDataAvailable = this.dynamicData.data.find(
            (x) => x.entityFieldId == entityFieldId
          );

          if (!dynamicDataAvailable) {
            let newLookupData = {
              entityData: null,
              entityFieldId: entityFieldId,
              fieldTypeId: currentselectedfield.fieldTypeId,
              fieldTypeName: currentselectedfield.formSectionFieldTypeName,
              formSectionId: currentselectedfield.formSectionFieldid,
            };
            dynamicDataAvailable = newLookupData;
            this.dynamicData.data.push(newLookupData);
          }

          if (lookupObject?.lookupId) {
            requestParams['LookupParentId'] = lookupObject?.lookupId;
            let casCadedData = this.applicationService.getChildrenLookups(
              'Application/CascadedLookups',
              requestParams
            );

            if (casCadedData) {
              casCadedData?.subscribe((data) => {
                this.dynamicData.data.find(
                  (x) => x.entityFieldId == entityFieldId
                ).entityData = data?.find(
                  (x) => x.entityFieldId == entityFieldId
                )?.entityData;
                this.dynamicData[cascadedkey] = data;
                this.dynamicData = { ...this.dynamicData };
                resolve(this.dynamicData);
              });
            } else {
              dynamicDataAvailable.entityData = null;
              this.dynamicData[cascadedkey] = [dynamicDataAvailable];
              this.dynamicData = { ...this.dynamicData };
              resolve(this.dynamicData);
            }
          } else {
            dynamicDataAvailable.entityData = null;
            this.dynamicData[cascadedkey] = [dynamicDataAvailable];
            this.dynamicData = { ...this.dynamicData };
            resolve(this.dynamicData);
          }
        }
      }
    });
    return promise.then((value: any) => {
      return value;
    });
  }

  makeFieldsVisible(): void {
    if (!this.formSectionData) {
      return;
    }
    for (var section in this.formSectionData.formSection) {
      let currentSection = this.formSectionData.formSection[section];
      if (!currentSection.hasOwnProperty('formSectionFields')) continue;
      currentSection?.formSectionFields.map((currentField) => {
        if (currentField.fieldTypeId == 7) {
          for (let field in this.fieldData) {
            let newCurrentField = this.fieldData[field];
            if (!newCurrentField.hasOwnProperty('constraints')) continue;
            let controlName = `fieldControl_${newCurrentField.entityFieldId}_${newCurrentField.fieldTypeId}`;
            let isValidate = this.checkVisibleExpression(
              newCurrentField.constraints,
              controlName
            );
            if (isValidate) {
              newCurrentField['isVisible'] = true;
              this.form.controls[controlName].enable();
            }
          }
          for (let file in this.attachments) {
            let newCurrentField = this.attachments[file];
            if (!newCurrentField.hasOwnProperty('constraints')) continue;
            let controlName = `fieldControl_${newCurrentField.FormSectionAttachmentId}_${newCurrentField.AttachmentTypeId}`;
            let isValidate = this.attachmentVisibleExpression(
              newCurrentField.constraints,
              controlName
            );
            if (isValidate) {
              this.form.controls[controlName].enable();
            }
          }
        } else {
          // for (let field in currentSection.formSectionFields) {
          // let currentField = currentSection.formSectionFields[field];
          if (!currentField.hasOwnProperty('constraints')) return;
          let controlName = `fieldControl_${currentField.entityFieldId}_${currentField.fieldTypeId}`;
          let isValidate = this.checkVisibleExpression(
            currentField.constraints,
            controlName
          );
          if (isValidate) {
            currentField['isVisible'] = true;
            this.form.controls[controlName]?.enable();
            if (currentField['isDisable']) {
              $('#field_' + currentField.entityFieldId).prop('disabled', true);
              $('#field_' + currentField.entityFieldId).prop(
                'nzDisabled',
                true
              );
              $('#fieldDropdown_' + currentField.entityFieldId).prop(
                'disabled',
                true
              );
              $('#fieldDropdown_' + currentField.entityFieldId).prop(
                'nzDisabled',
                true
              );
            }
          }
          // }
        }
      });
      for (let file in currentSection.FormSectionAttachments) {
        let currentField = currentSection.FormSectionAttachments[file];
        if (!currentField.hasOwnProperty('constraints')) continue;
        let controlName = `fieldControl_${currentField.FormSectionAttachmentId}_${currentField.AttachmentTypeId}`;
        let isValidate = this.attachmentVisibleExpression(
          currentField.constraints,
          controlName
        );
        if (isValidate) {
          this.form.controls[controlName]?.enable();
        }
      }
    }
  }

  disableSpecificField(field) {
    // let controlTo = `fieldControl_${field.entityFieldId}_${field.fieldTypeId}`;
    // this.form.controls[controlTo].clearValidators([
    //   Validators.required,
    // ]);
    // $(`#label_${field.entityFieldId}`).removeClass("field-required");
    $('#field_' + field.entityFieldId).prop('disabled', true);
    $('#field_' + field.entityFieldId).prop('nzDisabled', true);
    $('#fieldDropdown_' + field.entityFieldId).prop('disabled', true);
    $('#fieldDropdown_' + field.entityFieldId).prop('nzDisabled', true);
  }

  checkVisibleExpression(constraints, controlName) {
    let flag = true;
    constraints.forEach((constraint) => {
      if (
        constraint['constraintTypeId'] ===
        ConstraintTypeEnum.VisibleByExpression ||
        constraint['constraintTypeId'] === ConstraintTypeEnum.VisibleByValue
      ) {
        this.form.controls[controlName]?.disable();
        flag = this.makeItVibleOnTheForm(
          constraint,
          controlName,
          constraint['constraintTypeId']
        );
      }
    });
    return flag;
  }

  attachmentVisibleExpression(constraints, controlName) {
    let flag = true;
    constraints.forEach((constraint) => {
      if (
        constraint['constraintTypeId'] ===
        FileConstraintTypeEnum.VisibleByValue ||
        constraint['constraintTypeId'] ===
        FileConstraintTypeEnum.VisibleByExpression
      ) {
        this.form.controls[controlName]?.disable();
        flag = this.makeItVibleOnTheForm(
          constraint,
          controlName,
          constraint['constraintTypeId']
        );
      }
    });
    return flag;
  }

  makeItVibleOnTheForm(
    visibleByValueConstraint,
    controlName,
    constraintTypeId
  ) {
    let settings = visibleByValueConstraint.Settings
      ? JSON.parse(visibleByValueConstraint.Settings)
      : '';
    if (
      constraintTypeId == ConstraintTypeEnum.VisibleByExpression ||
      constraintTypeId == FileConstraintTypeEnum.VisibleByExpression
    ) {
      return eval(settings.Expression);
    } else {
      for (const key in settings.ControlBy) {
        // let control = $(`#field_${settings.ControlBy[key]}`).attr('ng-reflect-name');
        let control = $(`#field_${settings.ControlBy[key]}`).attr('aria-label');

        if (control) {
          let value =
            control != 'undefined' ? this.form.get(control)?.value : '';
          if (value) {
            return eval(settings.Values.includes(value));
          }
        }
      }
    }
  }

  checkDateConstraint(constraints, entityFieldId, fieldTypeId) {
    if (constraints && constraints.length) {
      let constraint = constraints.find(
        (x) => x.constraintTypeId == ConstraintTypeEnum.GreaterThan
      );
      if (constraint && constraint.Settings) {
        let setting = JSON.parse(constraint.Settings);
        if (setting) {
          for (const key in setting.ControlBy) {
            const element = setting.ControlBy[key];
            let controlTo = `fieldControl_${entityFieldId}_${fieldTypeId}`;
            let controlFrom = `fieldControl_${element}_${fieldTypeId}`;

            // this.form.controls[controlName2].
            let dateFrom = this.form.get(controlFrom).value;
            let dateTo = this.form.get(controlTo).value;
            if (dateTo && dateFrom) {
              if (dateFrom > dateTo) {
                this.form.controls[controlTo].setValidators([Validators.email]);
              } else {
                this.form.controls[controlTo]?.clearValidators([
                  Validators.email,
                ]);
              }
              this.form.controls[controlTo].updateValueAndValidity();
            }
          }
        }
      }
    }
  }

  getChildrensToDisplay(childrens) {
    if (childrens) {
      // return childrens?.filter((x) => x.RowIndex > 0);
      return childrens?.AllFields?.filter((x) => x.ItemIndex > 0);
    } else {
      return [];
    }
  }

  //modal functions
  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  childrenSectionsData: any;
  dynamicModalTitle: any;
  async showChildrenFieldModal(field, mode = 'add') {
    this.dynamicModalTitle = field.relationShipNameTranslation;
    if (field.relationType == 'Single') {
      this.getRelationData(field);
    } else {
      let settings: any = '';
      if (field?.Settings) {
        settings = JSON.parse(field.Settings);
      }
      if (settings && settings?.Max != '') {
        if (
          this.getChildrensToDisplay(field?.childrens) &&
          this.getChildrensToDisplay(field?.childrens)?.length >= settings.Max
        ) {
          let messageMaxFile = this.resources.find(
            (x) =>
              x.category.toLowerCase() == 'alerts' &&
              x.key.toLowerCase() == 'childmaxlimit'
          );
          let messageError = this.resources.find(
            (x) =>
              x.category.toLowerCase() == 'alerts' &&
              x.key.toLowerCase() == 'error'
          );
          let errorText = messageError
            ? messageError.value
            : constants.errorTextEng;
          this.applicationService.notify(
            'error',
            errorText,
            messageMaxFile
              ? messageMaxFile.value.replace('{0}', settings.Max)
              : constants.maxAuthRepresentativesEngKey.replace(
                '{0}',
                settings.Max
              )
          );
          return;
        }
      }
      this.seletedReferenceFields = field;
      this.loaderEvent.emit(true);

      await this.getRelatedFieldsOptions();

      this.dynamicData = {
        data: await this.getChildrenLookups(field.formSectionFieldid, field),
      };

      let response = Object.assign({}, field.childrens);
      if (response) {
        this.childrenFieldsData = response?.fields;
        this.childrenSectionsData = response?.sections;
        this.childFormFieldsAttachments = response?.attachments
          ? response?.attachments
          : [];
        this.childrenAttachments = response?.attachments
          ? response?.attachments
          : [];
        this.childrenIndexObj = {
          itemIndex:
            field.childrens && field.childrens?.values?.length > 0
              ? field.childrens?.values[field.childrens?.values.length - 1]
                ?.ItemIndex + 1
              : 1,
          isAdded: false,
        };
        let index = this.childrenIndexObj.itemIndex;
        this.childFormFieldsAttachments?.filter((e) => {
          e['ItemIndex'] = index;
          e['AttachmentFiles'] = e['AttachmentFiles'] ? e['AttachmentFiles'] : []; //this.childFormFieldsAttachments[0].AttachmentFiles;
        });

        if (this.childrenSectionsData && this.childrenSectionsData.length > 0) {
          let index = this.childrenIndexObj.itemIndex;
          this.childrenSectionsData.map((section) => {
            section.SectionAttachments?.filter((e) => {
              e['ItemIndex'] = index;
              e['AttachmentFiles'] = e.AttachmentFiles;
            });
          });
          this.openWithSectionsModal(mode, field);
        } else {
          this.openModal(mode, field);
        }
      }
      this.loaderEvent.emit(false);
      // });
    }
  }

  lookupsAPISent: boolean = false;
  lookupEntityFieldId: any = 0;
  isChildrenLookupsLoading: boolean = false;
  async getChildrenLookups(entityFieldId, field) {

    let requestParams = {
      FormSectionParentId: entityFieldId,
    };
    if (field['childrenLookupsData']) {

      return field['childrenLookupsData'];
    }
    // else {
    //   this.loaderEvent.emit(true);
    // }

    if (!this.lookupsAPISent && this.lookupEntityFieldId != entityFieldId) {
      this.lookupEntityFieldId = entityFieldId;
      this.isChildrenLookupsLoading = true;
      this.dataloadingService.setLoaderObs(true);
      this.lookupsAPISent = true;
      const promise = new Promise((resolve, reject) => {
        let result = this.applicationService.getChildrenLookups(
          'Application/GetChildEntityFieldLookups',
          requestParams
        );
        result.subscribe((data) => {
          if (data.length > 0) {
            field['childrenLookupsData'] = data;
            resolve(data);
          } else {
            field['childrenLookupsData'] = [];
            resolve([]);
          }
        });
      });
      return promise.then(async (data: any) => {
        // this.loaderEvent.emit(false);
        setTimeout(() => {
          this.isChildrenLookupsLoading = false;
          this.dataloadingService.setLoaderObs(false);
        }, 500);
        this.lookupsAPISent = false;
        await this.getRelatedFieldsOptions();
        return data;
      });
    }
  }

  async clearValueAfterRemovingRelatedField() {
    this.formSectionData.formSection.forEach(mainsection => {
      mainsection.formSectionFields.filter(x => x.fieldTypeId == 7).forEach(sectionfield => {
        sectionfield?.childrens?.AllFields.map(childfield => {
          let fieldswithrelatedoption = childfield.Fields.filter(x => (x.fieldTypeId == 5 || x.fieldTypeId == 4) && x.Settings && JSON.parse(x.Settings).relatedField);
          fieldswithrelatedoption.map(relatedOptionField => {
            if (sectionfield.childrenLookupsData) {
              let relatedSetting = JSON.parse(relatedOptionField.Settings).relatedField;
              let uniqueKey = `${relatedSetting.id}_${relatedSetting.textFieldId}`;
              let lookupsdata = sectionfield.childrenLookupsData.find(x => x.relatedParentAndFieldId == uniqueKey);
              if (lookupsdata) {
                let optionsAvailable = JSON.parse(lookupsdata.entityData);
                if (relatedOptionField.fieldTypeId == 4) {
                  let updatedvalues = [];
                  let multiSelectValue = relatedOptionField.formSectionFieldValue;
                  if (typeof multiSelectValue == 'string') {
                    multiSelectValue = relatedOptionField.formSectionFieldValue.split(',');
                  }
                  multiSelectValue.map(value => {
                    let isValueAvailable = optionsAvailable.find(x => x.lookupValueId == value)
                    if (isValueAvailable) {
                      updatedvalues.push(value);
                    }
                  })

                  relatedOptionField.formSectionFieldValue = updatedvalues.toString();
                  sectionfield.childrens.values.find(x => x.ItemIndex == childfield.ItemIndex).Fields.find(x => x.entityFieldId == relatedOptionField.entityFieldId).formSectionFieldValue = updatedvalues.toString();
                } else {
                  let isValueAvailable = optionsAvailable.find(x => x.lookupValueId == relatedOptionField.formSectionFieldValue)
                  if (!isValueAvailable) {
                    relatedOptionField.formSectionFieldValue = "";
                    sectionfield.childrens.values.find(x => x.ItemIndex == childfield.ItemIndex).Fields.find(x => x.entityFieldId == relatedOptionField.entityFieldId).formSectionFieldValue = "";
                  }
                }
              } else {
                // relatedOptionField.formSectionFieldValue = "";
                //   sectionfield.childrens.values.find(x=>x.ItemIndex == childfield.ItemIndex).Fields.find(x=>x.entityFieldId == relatedOptionField.entityFieldId).formSectionFieldValue = "";
              }
            }
          })
        })
      })
    })
  }

  async getRelatedFieldsOptions() {
    this.formSectionData.formSection.forEach(mainsection => {
      mainsection.formSectionFields?.filter(x => x.fieldTypeId == 7).forEach(sectionfield => {
        let checkFieldsForRelatedOptionalFields = sectionfield?.childrens?.fields.filter(x => (x.fieldTypeId == 5 || x.fieldTypeId == 4) && x.Settings && JSON.parse(x.Settings).relatedField);
        // let relatedFieldsOptions = {};
        if (checkFieldsForRelatedOptionalFields) {
          checkFieldsForRelatedOptionalFields.map(relatedOptionField => {
            if (sectionfield.childrenLookupsData) {
              let relatedFieldsOptions = [];
              let relatedSetting = JSON.parse(relatedOptionField.Settings).relatedField;
              this.formSectionData.formSection.forEach(sectionelement => {
                let relatedfield = sectionelement.formSectionFields.find(x => x.entityFieldId == relatedSetting.id);
                if (relatedfield?.fieldTypeId == 7) {
                  relatedfield?.childrens?.values.map(chldvalues => {
                    let relatedfieldvalue = chldvalues.Fields.find(fld => fld.entityFieldId == relatedSetting.textFieldId);
                    let data = {
                      EntityFieldId: relatedOptionField.entityFieldId,
                      LookupTranslationId: relatedfieldvalue.entityFieldId,
                      lookupFieldValue: relatedfieldvalue.formSectionFieldValue,
                      lookupId: relatedfieldvalue.entityFieldId,
                      lookupValue: relatedfieldvalue.formSectionFieldValue,
                      lookupValueId: relatedfieldvalue.itemIndex.toString()
                    }
                    relatedFieldsOptions.push(data);
                  })
                } else if (relatedfield?.fieldTypeId == 4 && relatedfield.fieldLookupData) {
                  let multiSelectValue = [];
                  if (typeof relatedfield.formSectionFieldValue == 'string') {
                    multiSelectValue = relatedfield.formSectionFieldValue.split(',').filter((x) => x);
                  } else {
                    multiSelectValue = relatedfield.formSectionFieldValue;
                  }

                  relatedFieldsOptions = relatedfield.fieldLookupData?.filter(x => multiSelectValue.find(y => y.toString() == x.lookupValueId.toString()));
                }
              });
              if (relatedFieldsOptions) {
                let data = {
                  entityData: JSON.stringify(relatedFieldsOptions),
                  entityFieldId: relatedOptionField.entityFieldId,
                  fieldTypeId: relatedOptionField.fieldTypeId,
                  fieldTypeName: relatedOptionField.formSectionFieldTypeName,
                  formSectionId: null,
                  relatedParentAndFieldId: `${relatedSetting.id}_${relatedSetting.textFieldId}`,
                }

                sectionfield["childrenLookupsData"] = sectionfield["childrenLookupsData"]?.filter(x => x.entityFieldId != relatedOptionField.entityFieldId);
                sectionfield["childrenLookupsData"].push(data);
              }
            }
          })
        }
      })
    })

    this.dataloadingService.setDynamicLookupsDataObs(this.formSectionData.formSection);
  }

  childEditObject: any;
  childrenAttachments: any;
  selectedRowsData: any;
  async editRowFields(data, field) {
    if (data.type == 'editMultiRows') {
      this.selectedRowsData = data.selectedRows;
    }
    this.childrenFieldsData = [];
    this.loaderEvent.emit(true);
    this.childEditObject = data.rowData;
    this.dynamicModalTitle = field.relationShipNameTranslation;
    // this.dynamicModalTitle = field.formSectionFieldName;
    this.childrenFieldsData = data.rowData.Fields;
    // this.childrenFieldsData = [];
    this.showLoader = true;
    this.seletedReferenceFields = data.field;

    await this.getRelatedFieldsOptions();

    this.dynamicData = {
      data: await this.getChildrenLookups(data.formSectionFieldid, field),
    };
    this.childrenAttachments = data.field?.childrens.attachments;

    if (
      data.field?.childrens?.sections &&
      data.field?.childrens?.sections?.length > 0
    ) {
      data.field?.childrens?.sections?.map((section) => {
        section.SectionAttachments?.filter((e) => {
          e['ItemIndex'] = data.rowData.ItemIndex;
          //e['AttachmentFiles'] = e.AttachmentFiles;
        });
      });
      this.childrenSectionsData = data.field?.childrens?.sections;
      this.openWithSectionsModal('edit', field);
    } else {
      if (data?.attachments && data?.attachments.length > 0) {
        data.attachments?.filter((e) => {
          e['ItemIndex'] = data.rowData.ItemIndex;
          //e['AttachmentFiles'] = e['AttachmentFiles'] ? e['AttachmentFiles'] : []; //this.childFormFieldsAttachments[0].AttachmentFiles;
        });

        //data.attachments[0]['ItemIndex'] = data.rowData.ItemIndex;
        this.childFormFieldsAttachments = data.attachments;
      }
      this.openModal('edit', field);
    }
  }

  openWithSectionsModal(mode, field) {
    sessionStorage.setItem(
      'SectionData',
      JSON.stringify(this.childrenSectionsData)
    );

    const modal = this.modal.create({
      nzContent: DynamicSectionModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzMaskClosable: false,
      nzClosable: false,
      nzComponentParams: {
        sections: JSON.parse(sessionStorage.getItem('SectionData')), //this.childrenSectionsData,
        childFieldAttachments: this.childFormFieldsAttachments,
        lookupData: this.dynamicData,
        sectionData: this.formSectionData,
        appCurrentStateId: this.applicationStageId,
        appProfileAppId: this.appProfileAppId,
        globalData: this.appGlobalData,
        mode: mode,
        //parentFieldData: this.seletedReferenceFields,
        editObjectData: this.childEditObject,
        childrenAttachments: this.childrenAttachments,
        createdDate: field.childrens.CreatedDate,
        modifiedDate: field.childrens.ModifiedDate,
      },
      nzWidth: '80%',
      nzFooter: [],
    });
    modal.afterOpen.subscribe((e) => {
      this.loaderEvent.emit(false);
      this.modalMode = mode;
    });
    //Return a result when closed
    modal.afterClose.subscribe(async (result) => {
      if (result?.tabSectionsAttachments) {
        this.seletedReferenceFields.childrens.attachments = [];
        this.seletedReferenceFields.childrens.sections = result.data;
        this.seletedReferenceFields.childrens.attachments = result.tabSectionsAttachments;
      }
      if (result?.data && result?.mode) {
        this.addSectionFildsToTabels(result);
        if (result?.isSubmitAndAddMore) {
          this.showChildrenFieldModal(this.seletedReferenceFields, 'add');
        }
      }
      await this.getRelatedFieldsOptions();
    });
  }
  dynamicClass: any = {};
  setDynamicClass(field) {
    if (field.Width) {
      this.dynamicClass[`${field.entityFieldId}`] = `col-lg-${field.Width}`;
    } else if (
      field.fieldTypeId == 7 ||
      field.fieldTypeId == 6 ||
      field.fieldTypeId == 11 ||
      field.fieldTypeId == 4 ||
      field.fieldTypeId == 14 ||
      field.fieldTypeId == 15
    ) {
      this.dynamicClass[`${field.entityFieldId}`] =
        'col-lg-12 col-md-12 col-sm-12';
    }
    return this.dynamicClass;
  }

  openModal(mode, field) {
    this.loaderEvent.emit(true);
    sessionStorage.setItem(
      'FieldData',
      JSON.stringify(this.childrenFieldsData)
    );
    const modal = this.modal.create({
      nzContent: DynamicFieldModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzMaskClosable: false,
      nzClosable: false,
      nzComponentParams: {
        data: sessionStorage.getItem('FieldData') != "undefined" ? JSON.parse(sessionStorage.getItem('FieldData')) : '', //this.childrenFieldsData,
        childFieldAttachments: this.childFormFieldsAttachments,
        lookupData: this.dynamicData,
        title: this.dynamicModalTitle, //this.formSectionData.formName,
        sectionData: this.formSectionData,
        appCurrentStateId: this.applicationStageId,
        appProfileAppId: this.appProfileAppId,
        globalData: this.appGlobalData,
        mode: mode,
        childrenAttachments: this.childrenAttachments,
        selectedRowsData: this.selectedRowsData,
      },
      nzWidth: '80%',
      nzFooter: [],
    });
    modal.afterOpen.subscribe((e) => {
      this.loaderEvent.emit(false);
      this.modalMode = mode;
    });
    //Return a result when closed
    modal.afterClose.subscribe(async (result) => {
      this.addFildsToTabels(result);
      if (result?.isSubmitAndAddMore) {
        this.showChildrenFieldModal(this.seletedReferenceFields, 'add');
      }
      await this.getRelatedFieldsOptions();
    });
  }

  MakeModalFieldsVisible(fieldData) {
    if (fieldData) {
      for (let field in fieldData) {
        let currentField = fieldData[field];
        if (!currentField.hasOwnProperty('constraints')) continue;
        let controlName = `fieldControl_${currentField.entityFieldId}_${currentField.fieldTypeId}`;
        let isValidate = this.checkVisibleExpression(
          currentField.constraints,
          controlName
        );
        if (isValidate) {
          currentField['isVisible'] = true;
          this.form.controls[controlName].enable();
        }
      }
    }
  }

  rowIndex: number = 0;
  addSectionFildsToTabels(response) {
    if (!response) {
      return;
    }
    let result = { ...response };
    this.rowIndex =
      this.seletedReferenceFields['childrens'].values.length > 0
        ? this.seletedReferenceFields['childrens'].values[
          this.seletedReferenceFields['childrens'].values.length - 1
        ].ItemIndex + 1
        : this.rowIndex + 1;

    let valueFields = [];
    let sectionFields = [];
    if (result.mode == 'add') {
      result.data.forEach((section) => {
        section.fields.forEach((field) => {
          sectionFields.push(field);
          valueFields.push({
            entityFieldId: field.entityFieldId,
            formSectionFieldValue: field.formSectionFieldValue,
            itemIndex: this.rowIndex,
          });
        });
      });
      let formData = sectionFields.map((y, i) =>
        Object.assign({}, y, { itemIndex: this.rowIndex })
      );
      let addFieldObject = {
        ItemIndex: this.rowIndex,
        canDelete: true,
        canEdit: true,
        Fields: formData//sectionFields,
      };
      // addFieldObject.Fields.map((y, i) =>
      //   Object.assign({}, y, { itemIndex: this.rowIndex })
      // );
      let valueObject = {
        ItemIndex: this.rowIndex,
        canDelete: true,
        canEdit: true,
        Fields: valueFields,
      };

      this.seletedReferenceFields.childrens.AllFields.push(addFieldObject);
      this.seletedReferenceFields.childrens.values.push(valueObject);
      this.childrenIndexObj = {
        isAdded: true,
      };
      this.silentSubmit(this.seletedReferenceFields);
    } else {
      let editValues: any = [];
      result.data.forEach((section) => {
        section.fields.forEach((field) => {
          field.itemIndex = this.childEditObject.ItemIndex;
          sectionFields.push(field);
          editValues.push({
            entityFieldId: field.entityFieldId,
            formSectionFieldValue: field.formSectionFieldValue,
            itemIndex: this.childEditObject.ItemIndex,
          });
        });
      });
      let selectedIndexFields = this.seletedReferenceFields.childrens.AllFields.find(
        (x) => x.ItemIndex == this.childEditObject.ItemIndex
      );
      selectedIndexFields.Fields = sectionFields;

      let selectedObject = this.seletedReferenceFields.childrens.values.find(
        (x) => x.ItemIndex == this.childEditObject.ItemIndex
      );
      selectedObject.Fields = editValues;
      this.silentSubmit(this.seletedReferenceFields);
    }
  }
  addFildsToTabels(result) {
    if (!result) {
      return;
    }
    this.rowIndex =
      this.seletedReferenceFields['childrens'].values.length > 0
        ? this.seletedReferenceFields['childrens'].values[
          this.seletedReferenceFields['childrens'].values.length - 1
        ].ItemIndex + 1
        : this.rowIndex + 1;

    let formData = result?.data?.map((x, i) => Object.assign({}, x, { itemIndex: this.rowIndex }));
    let addFieldObject = {
      ItemIndex: this.rowIndex,
      canDelete: true,
      canEdit: true,
      Fields: formData//result.data,
    };
    // addFieldObject.Fields.map((y, i) =>
    //   Object.assign({}, y, { itemIndex: this.rowIndex })
    // );

    let valueFields = [];
    result.data.map((x) => {
      valueFields.push({
        entityFieldId: x.entityFieldId,
        formSectionFieldValue: x.formSectionFieldValue,
        itemIndex: this.rowIndex,
      });
    });
    let valueObject = {
      ItemIndex: this.rowIndex,
      canDelete: true,
      canEdit: true,
      Fields: valueFields,
    };

    if (result.mode == 'add') {
      this.seletedReferenceFields.childrens.AllFields.push(addFieldObject);
      this.seletedReferenceFields.childrens.values.push(valueObject);
      this.childrenIndexObj = {
        isAdded: true,
      };
      this.silentSubmit(this.seletedReferenceFields);
    } else {
      // If multiple edit
      if (this.selectedRowsData && this.selectedRowsData?.length > 0) {
        this.selectedRowsData?.map((element) => {
          let selectedIndexFields = this.seletedReferenceFields.childrens.AllFields.find(
            (x) => x.ItemIndex == element.ItemIndex
          );
          let formData = result?.data?.map((x, i) => Object.assign({}, x, { itemIndex: element.ItemIndex }));
          selectedIndexFields.Fields = formData;//result.data;

          let selectedObject = this.seletedReferenceFields.childrens.values.find(
            (x) => x.ItemIndex == element.ItemIndex
          );
          selectedObject.Fields = formData;//result.data;
        });
        this.silentSubmit(this.seletedReferenceFields);
      } else {
        //Single edit update
        let selectedIndexFields = this.seletedReferenceFields.childrens.AllFields.find(
          (x) => x.ItemIndex == this.childEditObject.ItemIndex
        );
        let formData = result?.data?.map((x, i) => Object.assign({}, x, { itemIndex: this.childEditObject.ItemIndex }));
        selectedIndexFields.Fields = formData;//result.data;

        let selectedObject = this.seletedReferenceFields.childrens.values.find(
          (x) => x.ItemIndex == this.childEditObject.ItemIndex
        );
        selectedObject.Fields = formData;//result.data;
        this.silentSubmit(this.seletedReferenceFields);
      }
    }
  }

  async remove(fieldsToDelete) {
    let currentEntity = this.fieldData.find(
      (x) => x.entityFieldId == fieldsToDelete.field.entityFieldId
    );
    if (currentEntity) {
      fieldsToDelete.data.map((data) => {
        let filteredResult = currentEntity['childrens'].AllFields.filter(
          (x) => x.ItemIndex != data.index
        );
        let filterChildrenRows = currentEntity['childrens'].values.filter(
          (x) => x.ItemIndex != data.index
        );
        currentEntity['childrens'].values = filterChildrenRows;
        currentEntity['childrens'].AllFields = filteredResult;
      });
    }
    this.silentSubmit(currentEntity);

    await this.getRelatedFieldsOptions();
    await this.clearValueAfterRemovingRelatedField();
  }

  //silent submit for child
  executeObjectArr: any = [];
  silentSubmit(element) {
    let object = {};
    if (this.appGlobalData.stageSettings) {
      let stageSetting = JSON.parse(this.appGlobalData.stageSettings);
      let matched = stageSetting?.silentSaveSettings?.find(
        (x) => x.fieldId == element.entityFieldId
      );
      if (matched) {
        this.dataloadingService.setLoaderObs(true);
        this.executeObjectArr = [];
        if (element.fieldTypeId == 7) {
          let relationFieldValue =
            element.relationType == 'Single'
              ? element.childrens?.ApplicationId.toString() == undefined
                ? ''
                : element.childrens?.ApplicationId.toString()
              : '';

          //Get child values from children values array
          let childFieldsValues = [];
          element?.childrens?.values
            ?.filter((x) => x.ItemIndex > 0)
            .map((x) => {
              x?.Fields.map((field) => {
                let childrenFieldsValue = {
                  itemIndex: field.itemIndex,
                  entityFieldId: field.entityFieldId,
                  value: field?.formSectionFieldValue
                    ? field.formSectionFieldValue
                    : '',
                };
                childFieldsValues.push(childrenFieldsValue);
              });
            });

          object = {
            entityFieldId: element.entityFieldId,
            value: relationFieldValue,
            childrens: childFieldsValues, //element.childrens.values.filter((x) => x.itemIndex > 0),
          };
          //end child field values
        }
        this.executeObjectArr.push(object);
        let requestPayload = {
          applicationId: Number(this.applicationId),
          stageActionId: matched.actionId,
          comments: '',
          data: this.executeObjectArr,
          users: '',
          currentApplicationStageId: this.appGlobalData.applicationStageId,
          lastApplicationStageActionId: this.appGlobalData
            .applicationStageActionId
            ? this.appGlobalData.applicationStageActionId
            : null,
        };

        this.applicationService
          .saveApplicationFormData('Application/ExecuteAction', requestPayload)
          .subscribe(
            (response) => {
              this.dataloadingService.setLoaderObs(false);
              if (response && response?.executeActionResult?.status == 200) {
                let message = this.resources.find(
                  (x) =>
                    x.category.toLowerCase() == 'messages' &&
                    x.key.toLowerCase() == 'silentsubmit'
                );
                let messageTodisplay = message
                  ? message.value
                  : 'messages_SilentSubmit';
                this.applicationService.notify(
                  'success',
                  messageTodisplay,
                  null
                );
              }
            },
            (error) => {
              this.dataloadingService.setLoaderObs(false);
            }
          );
      }
    }
  }
  //End silent submit

  relationFildData: any;
  totalSearchRelatedCount: any = 0;
  getRelationData(field) {
    this.dynamicModalTitle = field.formSectionFieldName;
    this.seletedReferenceFields = field;
    let inputRequest = {
      FormSectionFieldId: field.formSectionFieldid,
      RecordId:
        this.seletedReferenceFields['childrens'] &&
          this.seletedReferenceFields['childrens'].values.length > 0
          ? this.seletedReferenceFields['childrens'].ApplicationId
          : '',
      PageNumber: 1,
      PageSize: 10,
    };
    if (!this.relationFildData) {
      this.applicationService
        .getApplicationChildForm(
          'Services/GetSearchRelatedRecords',
          inputRequest
        )
        .subscribe((response) => {
          if (response && response.relatedData != null) {
            this.relationFildData = JSON.parse(response.relatedData);
            this.totalSearchRelatedCount = response?.totalCount;
            this.openSelectionModal(field.formSectionFieldid);
          } else {
            let error = this.resources.find(
              (x) =>
                x.category.toLowerCase() == 'alerts' &&
                x.key.toLowerCase() == 'error'
            );
            let message = this.resources.find(
              (x) =>
                x.category.toLowerCase() == 'messages' &&
                x.key.toLowerCase() == 'norecord'
            );
            let norecord = message ? message.value : 'No record found!';
            this.applicationService.notify('error', error.value, norecord);
          }
        });
    } else {
      this.openSelectionModal(field.formSectionFieldid);
    }
  }

  // Open pick record modal
  openSelectionModal(formSectionFieldId) {
    const modal = this.modal.create({
      nzContent: SingleSelectionModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzMaskClosable: false,
      nzClosable: false,
      nzComponentParams: {
        data: this.relationFildData,
        totalCount: this.totalSearchRelatedCount,
        title: this.dynamicModalTitle, //this.formSectionData.formName,
        formSectionFieldId: formSectionFieldId,
        pickedRecordId:
          this.seletedReferenceFields['childrens'] &&
            this.seletedReferenceFields['childrens'].values.length > 0
            ? this.seletedReferenceFields['childrens'].ApplicationId
            : '',
        appProfileAppId: this.appProfileAppId,
      },
      nzWidth: '80%',
      nzFooter: [],
    });
    modal.afterOpen.subscribe((e) => {
      // this.loaderEvent.emit(false);
    });

    modal.afterClose.subscribe((selectedRow) => {
      if (selectedRow) {
        this.removePickedRecord(formSectionFieldId);
        setTimeout(() => {
          let result = selectedRow.data;
          this.seletedReferenceFields['childrens'] = '';
          this.isSpinning = true;
          let values: any = [];
          result[0]?.Fields.forEach((field) => {
            let rowObject = {
              itemIndex: 1,
              entityFieldId: field.entityFieldId,
              formSectionFieldValue: field.formSectionFieldValue
                ? field.formSectionFieldValue.toString()
                : '',
            };
            values.push(rowObject);
            //this.seletedReferenceFields['childrenRows'].push(rowObject);
          });
          // this.rowIndex
          this.seletedReferenceFields.formSectionFieldValue =
            result[0].applicationId;
          let allFieldsObject = [
            {
              ItemIndex: 1,
              Fields: result[0].Fields,
              canDelete: true,
              canEdit: true,
            },
          ];
          let valuesObject = [
            { ItemIndex: 1, Fields: values, canDelete: true, canEdit: true },
          ];

          let childrenObject = {
            ApplicationId: result[0].applicationId,
            fields: result[0].Fields,
            values: valuesObject,
            sections: '',
            attachments: '',
            AllFields: allFieldsObject,
          };
          this.seletedReferenceFields['childrens'] = childrenObject;
          this.form.markAllAsTouched();
          //this.createSelectionData(1, result);
          this.getMappingValue('picked');
        }, 10);
      }
    });
  }

  createSelectionData(index, result) {
    result[0].Fields.forEach((element) => {
      element.itemIndex = index;
    });
    let fieldsObject = {
      canDelete: true,
      canEdit: true,
      ApplicationId: result[0].applicationId,
      RowIndex: index,
      AllFields: result[0].Fields,
      Attachments: result?.attachments,
    };
    this.seletedReferenceFields['childrens'].push(fieldsObject);
  }
  mappingKeyValue: any = [];
  getMappingValue(isPicked?, isRemove?) {
    this.mappingKeyValue = [];
    const fieldSettings = this.seletedReferenceFields.formSectionFieldSettings
      ? JSON.parse(this.seletedReferenceFields.formSectionFieldSettings)
      : '';
    let currentControl = `fieldControl_${this.seletedReferenceFields.entityFieldId}_${this.seletedReferenceFields.fieldTypeId}`;
    let parentFieldValue =
      this.seletedReferenceFields['childrens']?.AllFields?.length > 0
        ? this.seletedReferenceFields['childrens']?.ApplicationId
        : '';
    if (isRemove) {
      this.form.markAllAsTouched();
      this.form.get(currentControl).setValue('');
      this.seletedReferenceFields.formSectionFieldValue = '';
      // this.seletedReferenceFields['childrens'] = "";
    } else {
      this.form.get(currentControl).setValue(parentFieldValue);
      this.seletedReferenceFields.formSectionFieldValue = parentFieldValue;
    }
    if (this.seletedReferenceFields?.['childrens']?.values) {
      this.seletedReferenceFields?.['childrens']?.values[0]?.Fields.forEach(
        (element) => {
          if (
            fieldSettings?.mappings &&
            fieldSettings?.mappings[element.entityFieldId]
          ) {
            let mappingValue = {
              entityFieldId: fieldSettings.mappings[element.entityFieldId],
              value: element.formSectionFieldValue,
            };
            this.mappingKeyValue.push(mappingValue);
          }
        }
      );
    }
    if (this.mappingKeyValue.length > 0) {
      this.form.get(currentControl)?.clearValidators([Validators.required]);
      this.formSectionData.formSection.map((section) => {
        section.formSectionFields.map((field) => {
          let mappingValue = this.mappingKeyValue.find(
            (x) => x.entityFieldId == field.entityFieldId
          );
          let controlName = `fieldControl_${field.entityFieldId}_${field.fieldTypeId}`;
          if (mappingValue) {
            if (isPicked) {
              this.form.controls[controlName].setValue('');
              field.formSectionFieldValue = '';
            }
            let fieldValue = '';
            if (mappingValue.value) {
              fieldValue = mappingValue.value;
            }
            field.formSectionFieldValue = fieldValue;
            this.form.controls[controlName].setValue(fieldValue, {
              emitEvent: true,
            });

            if (isRemove) {
              this.seletedReferenceFields['childrens'] = '';
              // this.seletedReferenceFields['childrens'].values = [];
            }
            field['isDisable'] = isRemove ? false : true;
            setTimeout(() => {
              this.makeFieldsVisible();
              $('#field_' + field.entityFieldId).prop(
                'disabled',
                isRemove ? false : true
              );
              $('#field_' + field.entityFieldId).prop(
                'nzDisabled',
                isRemove ? false : true
              );
              $('#radioGroup_' + field.entityFieldId).css(
                'pointer-events',
                isRemove ? 'auto' : 'none'
              );
              $('#fieldDropdown_' + field.entityFieldId).prop(
                'disabled',
                isRemove ? false : true
              );
              $('#fieldDropdown_' + field.entityFieldId).prop(
                'nzDisabled',
                isRemove ? false : true
              );
              // this.form.controls[controlName].disable();
            }, 1000);
          }
          if (!isRemove) {
            this.loadDependentData(field, isPicked);
          }
        });
      });
    }
  }

  loadDependentData(field, isPicked) {
    field.constraints?.map(async (constraint) => {
      if (constraint.Settings && JSON.parse(constraint.Settings)?.Cascaded) {
        let selectedCascadedFieldValue = this.fieldData.find(
          (x) => x.entityFieldId == JSON.parse(constraint.Settings)?.Cascaded
        );
        if (selectedCascadedFieldValue) {
          let cascadedkey = `field_${field.entityFieldId}`;
          // Bind cascaded fields only when creating groups
          if (selectedCascadedFieldValue.formSectionFieldValue && isPicked) {
            await this.cascadedFieldOperation(
              JSON.parse(constraint.Settings)?.Cascaded,
              field,
              selectedCascadedFieldValue.formSectionFieldValue
            );
          } else {
            if (!this.dynamicData[cascadedkey]) {
              if (selectedCascadedFieldValue.formSectionFieldValue) {
                await this.cascadedFieldOperation(
                  JSON.parse(constraint.Settings)?.Cascaded,
                  field,
                  selectedCascadedFieldValue.formSectionFieldValue
                );
              }
            }
          }
        }
      }
      this.setDynamicValidator(field, constraint);
    });
  }
  removePickedRecord(field) {
    this.getMappingValue('', 'remove');
  }
  checkNewLine(field) {
    let isNewLine = field?.constraints?.find((x) => x.constraintTypeId == 12);
    if (isNewLine) {
      return true;
    }
    return false;
  }

  isDownloading: boolean = false;
  selectedTemplateId: any = 0;
  downloadTemplate(templateId, type) {
    this.selectedTemplateId = templateId;
    let requestParms = {
      attachmentTemplateId: templateId,
    };
    this.isDownloading = true;

    this.applicationService
      .downloadFile(
        'UploadAttachment/GetServiceAttachmentTemplateById',
        requestParms
      )
      .subscribe((response) => {
        if (response) {
          this.isDownloading = false;
          if (type == 'preview') {
            let link = `data:${response.extension};base64,${response.fileName}`;
            //this.attachmentPreviewLink = link;
            let elementsToRemoveHideClass = document.getElementsByClassName(
              'data'
            );
            for (let i = 0; i < elementsToRemoveHideClass.length; i++) {
              elementsToRemoveHideClass[i].classList.add('data-show');
            }
          } else {
            let fileBytesArray = Utils.base64ToArrayBuffer(response.fileName);
            Utils.saveFile(response.name, response.extension, fileBytesArray);
          }
        }
      });
  }
}
