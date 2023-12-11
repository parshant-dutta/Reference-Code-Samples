import {
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ResourceService } from 'src/app/Shared/Services/Resoucre.Service';
import { Utils } from 'src/app/Utils/Utils';
import { CreateApplicationService } from '../../Services/CreateApplication.service';
import { constants } from '../../../../Shared/Constants';
import { FileConstraintTypeEnum } from '../../ConstraintTypeEnum';
import { DomSanitizer } from '@angular/platform-browser';
import { FileStatus, UploadService } from 'src/app/Shared/Services/upload.service';
import { Observable } from 'rxjs';
import { DataloadService } from '../../Services/dataload.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-file-upload',
  templateUrl: './FileUpload.Component.html',
  styleUrls: ['./FileUpload.Component.scss'],
})
export class FileUploadComponent {
  @Input() sectionData: any;
  @Input() fieldData: any;
  @Input() form: any;
  @Input('applicationStageId') stageId: any;
  @Input() controlName: string;
  @ViewChild('file') inputFile: ElementRef;
  @ViewChild('ManualFrame') documentElement: ElementRef;
  resources: any;
  applicationId: any;
  selectedLanguageId: any = 1;
  buttonYesText: string = '';
  buttonCancelText: string = '';
  deleteConfirmationText: string = '';
  noteText: string = '';
  UploadingText: string;
  errorText: string = '';
  successText: string = '';
  hasErrorMsg = '';
  uploadProgress: Observable<FileStatus[]>;
  apiURl: any;
  constructor(
    private service: CreateApplicationService,
    private route: ActivatedRoute,
    private resourceService: ResourceService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private uploadService: UploadService,
    public dataloadingService: DataloadService
  ) {
    this.apiURl = environment.apiGateway;
    this.resources = this.resourceService.getResouceData();
  }

  ngOnInit(): void {

    this.uploadProgress = this.uploadService.uploadProgress;

    this.selectedLanguageId = this.resourceService.getSelectedLanguageId();
    this.noteText =
      this.selectedLanguageId == 2
        ? constants.attachmentNoteAra
        : constants.attachmentNoteEng;

    let messageYes = this.resources.find(
      (x) =>
        x.category.toLowerCase() == 'alerts' && x.key.toLowerCase() == 'yes'
    );
    this.buttonYesText = messageYes
      ? messageYes.value
      : constants.buttonYesTextEng;

    let messageCancel = this.resources.find(
      (x) =>
        x.category.toLowerCase() == 'alerts' && x.key.toLowerCase() == 'cancel'
    );
    this.buttonCancelText = messageCancel
      ? messageCancel.value
      : constants.buttonCancelTextEng;

    let messageDeleteConfirm = this.resources.find(
      (x) =>
        x.category.toLowerCase() == 'alerts' &&
        x.key.toLowerCase() == 'confirmationtext'
    );
    this.deleteConfirmationText = messageDeleteConfirm
      ? messageDeleteConfirm.value
      : constants.deleteConfirmationTextEng;

    let messageUploading = this.resources.find(
      (x) =>
        x.category.toLowerCase() == 'alerts' &&
        x.key.toLowerCase() == 'uploading'
    );
    this.UploadingText = messageUploading
      ? messageUploading.value
      : constants.UploadingTextEng;

    let messageError = this.resources.find(
      (x) =>
        x.category.toLowerCase() == 'alerts' && x.key.toLowerCase() == 'error'
    );
    this.errorText = messageError ? messageError.value : constants.errorTextEng;

    let messageSuccess = this.resources.find(
      (x) =>
        x.category.toLowerCase() == 'alerts' && x.key.toLowerCase() == 'success'
    );
    this.successText = messageSuccess
      ? messageSuccess.value
      : constants.successTextEng;

    this.route.params.subscribe((param) => {
      if (param.id) {
        this.applicationId = param.id;
      }
    });
  }
  fileOrderNo: any = 0;
  fileUploadCount: any = 0;
  selectedFileData:any;
  async upload(file, fieldData) {
    if (file.length === 0) return;
    let fileValid = await this.validateConstraint(file[0], fieldData);
    if (fileValid) {
      this.dataloadingService.setLoaderObs(true);
      this.fileUploadCount = this.fileUploadCount + 1;
      let timestamp = new Date().getUTCMilliseconds()
      this.fileOrderNo = `${fieldData.AttachmentId}_${timestamp}`;
      let filedata = {
        file: file[0],
        status: UploadStatus.uploading,
        id: 0,
        AttachmentId: fieldData.AttachmentId,
        FileName: file[0].name,
        Extension: file[0].type,
        Size: file[0].size,
        fileOrderNo: this.fileOrderNo
      };
      if (fieldData?.AttachmentFiles && fieldData.AttachmentFiles.length > 0) {
        fieldData.AttachmentFiles.push(filedata);
        this.selectedFileData = fieldData;
        sessionStorage.setItem('attachments', JSON.stringify(fieldData))
        this.saveAttachment(file[0], fieldData.AttachmentId, fieldData);
      } else {
        fieldData['AttachmentFiles'] = [filedata];
        this.selectedFileData = fieldData;
        sessionStorage.setItem('attachments', JSON.stringify(fieldData))
        this.saveAttachment(file[0], fieldData.AttachmentId, fieldData);
      }
      // await this.saveAttachment(file[0], fieldData.AttachmentId, fieldData);

    } else {
      this.inputFile.nativeElement.value = '';
    }
  }

  async validateConstraint(file, field) {
    if (field.constraints?.length > 0) {
      try {
        field.constraints.forEach((constarint) => {
          switch (constarint.typeName) {
            case 'MaxFiles': {
              if (constarint.Settings) {
                let allowFile = Utils.parse(constarint.Settings)
                  .AllowedTotalFiles;
                if (field?.ItemIndex > 0) {
                  let currentFile = field?.AttachmentFiles?.filter(
                    (x) => x.ItemIndex == field?.ItemIndex
                  );
                  if (currentFile && currentFile?.length >= allowFile) {
                    let messageMaxFile = this.resources.find(
                      (x) =>
                        x.category.toLowerCase() == 'alerts' &&
                        x.key.toLowerCase() == 'uploadlimit'
                    );
                    this.service.notify(
                      'error',
                      this.errorText,
                      messageMaxFile
                        ? messageMaxFile.value.replace('{0}', allowFile)
                        : constants.maxFilesEngKey.replace('{0}', allowFile)
                    );
                    this.hasErrorMsg = messageMaxFile
                      ? messageMaxFile.value.replace('{0}', allowFile)
                      : constants.maxFilesEngKey.replace('{0}', allowFile);
                    throw 'Max files contraint failed';
                  }
                } else {
                  if (field.AttachmentFiles?.length >= allowFile) {
                    let messageMaxFile = this.resources.find(
                      (x) =>
                        x.category.toLowerCase() == 'alerts' &&
                        x.key.toLowerCase() == 'uploadlimit'
                    );
                    this.service.notify(
                      'error',
                      this.errorText,
                      messageMaxFile
                        ? messageMaxFile.value.replace('{0}', allowFile)
                        : constants.maxFilesEngKey.replace('{0}', allowFile)
                    );
                    this.hasErrorMsg = messageMaxFile
                      ? messageMaxFile.value.replace('{0}', allowFile)
                      : constants.maxFilesEngKey.replace('{0}', allowFile);
                    throw 'Max files contraint failed';
                  }
                }
              }
              break;
            }
            case 'MaxSize': {
              if (constarint.Settings) {
                let requiredSize = Utils.calculateBytes(
                  Utils.parse(constarint.Settings).AllowedFileSize
                );
                // let fileSize = Utils.calculateBytes(file.size);
                if (
                  file.size > Utils.parse(constarint.Settings).AllowedFileSize
                ) {
                  let messageMaxSize = this.resources.find(
                    (x) =>
                      x.category.toLowerCase() == 'alerts' &&
                      x.key.toLowerCase() == 'MaxFileSize'
                  );
                  this.service.notify(
                    'error',
                    this.errorText,
                    messageMaxSize
                      ? messageMaxSize.value.replace('{0}', requiredSize)
                      : constants.maxFileSizeEngKey.replace('{0}', requiredSize)
                  );
                  this.hasErrorMsg = messageMaxSize
                    ? messageMaxSize.value.replace('{0}', requiredSize)
                    : constants.maxFileSizeEngKey.replace('{0}', requiredSize);
                  throw 'Max size contraint failed';
                }
              }
              break;
            }
            case 'AllowedExtensions': {
              if (constarint.Settings) {
                let allowedExtension = Utils.parse(constarint.Settings)
                  .AllowedExtensions;
                let fileExtension = file.name.split('.').pop();
                let isAllowed = allowedExtension.includes(fileExtension);
                if (!isAllowed) {
                  let messageAllowedExt = this.resources.find(
                    (x) =>
                      x.category.toLowerCase() == 'alerts' &&
                      x.key.toLowerCase() == 'allowed'
                  );
                  this.service.notify(
                    'error',
                    this.errorText,
                    (messageAllowedExt
                      ? messageAllowedExt.value
                      : constants.allowedExtEngKey) +
                    ' ' +
                    allowedExtension
                  );
                  this.hasErrorMsg =
                    messageAllowedExt.value + ' ' + allowedExtension;
                  throw 'Allowed extensions contraint failed';
                }
              }
              break;
            }
            default:
              this.hasErrorMsg = '';
              break;
          }
        });
      } catch (e) {
        return false;
      }
    }
    return true;
  }

  attachmentTempArray = [];
  saveAttachment(file, attachmentId, data) {
    //let fieldData = { ...data, data }

    let fileObject = {
      name: file.name,
      applicationId: this.applicationId,
      applicationStageId: this.stageId,
      attachmentId: attachmentId,
      itemIndex: data.ItemIndex ? data.ItemIndex : '',
      attachmentContainerTypeId: '1'
    }
    this.uploadService.uploadFile(file, fileObject, this.fileOrderNo);
  
    this.updateLoaclFiles(attachmentId, file);
  }

  updateLoaclFiles(attachmentId, file){
    this.uploadProgress.subscribe(response => {
      if(response){
        let fieldData = this.selectedFileData;
        if (response[0]?.requestFail == true && response[0]?.uuid == '') {
          let index = fieldData['AttachmentFiles'].findIndex(x => x.AttachmentId != attachmentId && x.fileOrderNo == response[0].fileOrderNo); //find index in your array
          fieldData['AttachmentFiles'].splice(index, 1);
        } else {
          //update index for child attachment
          if (fieldData?.ItemIndex) {
            let currentAttachment = fieldData['AttachmentFiles'].find((x) => x.AttachmentId == attachmentId && x.id == 0 && x.fileOrderNo == this.fileOrderNo);
            if (currentAttachment && !currentAttachment?.ItemIndex) {
              //if(currentAttachment){
                currentAttachment['ItemIndex'] = fieldData.ItemIndex ? fieldData.ItemIndex : '';
              //}            
            }
          }
          let current = response?.find((x) => x.attachmentId == attachmentId && x['progress'] == 100 && x['uuid'] && x['showProgress'] == true); //
          if (current) {        
            let attachmentIndex = fieldData['AttachmentFiles'].find(
              (x) => x.AttachmentId == attachmentId && x.id == 0 && x.fileOrderNo == current.fileOrderNo
            );
           
            if (attachmentIndex) {
              if (current['progress'] == 100) {
                current['showProgress'] = false;
              }
              attachmentIndex.id = current['uuid']
              attachmentIndex.status = UploadStatus.done;
            }
          }
          this.form.controls[this.controlName].setValue({ value: file.name });
          let checkAllCompleted = response.filter((x) => x.progress == 100 && x['showProgress'] == false);
          if (response.length == checkAllCompleted.length) {
            this.dataloadingService.setLoaderObs(false);
          }
        }
      }
     
    })
  }


  removeFile(fileData, fieldData) {
    this.hasErrorMsg = '';
    let attachmentIndex = fieldData['AttachmentFiles'].findIndex(
      (x) => x.id == fileData.id
    );
    if (attachmentIndex != -1) {
      if (fileData.id > 0) {
        let requestParams = {
          attachmentId: fileData.id,
        };
        this.service
          .deleteAttachment('UploadAttachment', requestParams)
          .subscribe((resp) => {
            if (resp.deleteResult.status == 200) {
              let filteredResult = fieldData['AttachmentFiles'].filter(
                (x) => x.id != fileData.id
              );
              fieldData['AttachmentFiles'] = filteredResult;
              this.service.notify(
                'success',
                this.successText,
                resp.deleteResult.successMessage
              );

              if (fieldData?.ItemIndex > 0) {
                let currentFile = fieldData?.AttachmentFiles?.filter(
                  (x) => x.ItemIndex == fieldData?.ItemIndex
                );
                if (currentFile && currentFile.length < 1) {
                  this.form.controls[this.controlName].setValue('');
                }
              }

              //add validate true
              if (fieldData['AttachmentFiles']?.length < 1) {
                this.form.controls[this.controlName].setValue('');
                if (fieldData.constraints) {
                  fieldData.constraints.forEach((constraint) => {
                    if (constraint.typeName == 'Required') {
                      this.form.controls[this.controlName].setValidators([
                        Validators.required,
                      ]);
                    }
                  });
                }
              }
              //end
            } else {
              this.service.notify(
                'error',
                this.errorText,
                resp.deleteResult.errorMessage
              );
            }
          });
      }
    }
    this.inputFile.nativeElement.value = '';
  }
  attachmentPreviewLink: any;
  isDownloading: boolean = false;
  downloadFile(attachmentId, type?) {
    if (type == 'preview') {
      this.isDownloading = false;
      this.attachmentPreviewLink = `${this.apiURl}/UploadAttachment/GetAttachmentById?attachmentId=${attachmentId}&download=false`; //"http://161.97.168.229/api/v1.1/UploadAttachment/GetAttachmentById?attachmentId="+attachmentId;
      let elementsToRemoveHideClass = document.getElementsByClassName("data");
      for (let i = 0; i < elementsToRemoveHideClass.length; i++) {
        elementsToRemoveHideClass[i].classList.add("data-show");
      }
    }
  }

  returnObj(string) {
    if (string && typeof string === 'string') {
      return Utils.parse(string);
    } else {
      return string;
    }
  }

  cancel(): void { }

  public getVisibleByConstraint() {
    if (
      this.fieldData &&
      Utils.parse(this.fieldData.constraints) &&
      Utils.parse(this.fieldData.constraints).length
    ) {
      let constraints = Utils.parse(this.fieldData.constraints);
      return constraints.some(
        (v) => v.constraintTypeId === FileConstraintTypeEnum.VisibleByValue
      );
    }
  }

  onFocusout(e) {
    this.form.controls[this.controlName].markAsDirty();
    this.form.controls[this.controlName].updateValueAndValidity();
  }
  visible: boolean = false;

  clickMe(): void {
    this.visible = false;
  }

  change(value: boolean): void {
    console.log(value);
  }

  returnLink(name, ext, buytesArray) {
    let link = `data:${ext};base64,${buytesArray}`;
    this.attachmentPreviewLink = link;
  }

  closePreview() {
    this.attachmentPreviewLink = '';
    let elementsToRemoveHideClass = document.getElementsByClassName(
      'data-show'
    );
    for (let i = 0; i < elementsToRemoveHideClass.length; i++) {
      elementsToRemoveHideClass[i].classList.remove('data-show');
    }
  }
  cancelUpload(fileOrderNo, fieldData, fileObject) {
    let index = fieldData['AttachmentFiles'].findIndex(x => x.fileOrderNo == fileOrderNo);
    fieldData['AttachmentFiles'].splice(index, 1);
    this.inputFile.nativeElement.value = '';

    if (fieldData?.ItemIndex > 0) {
      let currentFile = fieldData?.AttachmentFiles?.filter(
        (x) => x.ItemIndex == fieldData?.ItemIndex
      );
      if (currentFile && currentFile.length < 1) {
        this.form.controls[this.controlName].setValue('');
      }
    }

    //add validate true
    if (fieldData['AttachmentFiles']?.length < 1) {
      this.form.controls[this.controlName].setValue('');
      if (fieldData.constraints) {
        fieldData.constraints.forEach((constraint) => {
          if (constraint.typeName == 'Required') {
            this.form.controls[this.controlName].setValidators([
              Validators.required,
            ]);
          }
        });
      }
    }
    //end

    let result = this.uploadService.abortUpload(fileOrderNo, fileObject)
  }
}

export enum UploadStatus {
  uploading,
  done,
  error,
}
