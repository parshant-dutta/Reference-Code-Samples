import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import { Utils } from 'src/app/Utils/Utils';
import { ApplicationReceiptModalComponent } from '../../Modals/application-receipt-modal/application-receipt-modal.component';
import { CreateApplicationService } from '../../Services/CreateApplication.service';
import { SharedService } from 'src/app/Shared/Services/shared.service';
import { ApplicationCommentsComponent } from '../../Modals/application-comments/application-comments.component';

@Component({
  selector: 'app-timelines',
  templateUrl: './timelines.component.html',
  styleUrls: ['./timelines.component.scss'],
})
export class TimelinesComponent implements OnInit {
  @Input() logData: any;
  @Input() applicationFormData: any;
  @Input() applicationId: any;
  @ViewChild('outlet', { read: ViewContainerRef }) outletRef: ViewContainerRef;
  isSpinning: boolean = false;
  showMore: boolean = false;
  selectedComment: any;
  selectedFilter: any = '';
  filterOptions: any;

  constructor(
    private service: CreateApplicationService,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private sharedService: SharedService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.selectedFilter = 'All';
    this.filterOptions = [
      {
        value: 'All',
        id: 1,
        name: [
          { value: 'All', langId: 1 },
          { value: 'الجميع', langId: 2 },
        ],
      },
    ];
  }

  ngOnChanges(): void {
    this.selectedFilter = 'All';
    this.RemoveFilters();
  }
  RemoveFilters() {
    if (this.logData)
      this.logData.forEach((element) => {
        if (element.Stages)
          element.Stages.forEach((element) => {
            if (element.Actions)
              element.Actions.forEach((element) => {
                if (element.ApplicationCertificates) {
                  if (!this.filterOptions.some((x) => x.value == 'Certificate'))
                    this.filterOptions.push({
                      value: 'Certificate',
                      id: 3,
                      name: [
                        { value: 'Certificate', langId: 1 },
                        { value: 'شهادة', langId: 2 },
                      ],
                    });
                }
                if (element.TransactionDetail) {
                  if (!this.filterOptions.some((x) => x.value == 'Receipt'))
                    if (element.ApplicationCertificates) {
                      this.filterOptions.push({
                        value: 'Receipt',
                        id: 2,
                        name: [
                          { value: 'Receipt', langId: 1 },
                          { value: 'إيصال', langId: 2 },
                        ],
                      });
                    }
                }
              });
          });
      });
  }

  ReadMoreDetails(log, stage) {
    let newLogData = [stage];
    const modal = this.modal.create({
      nzContent: ApplicationCommentsComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzStyle: { top: '10px' },
      nzComponentParams: {
        logData: newLogData,
        serviceName: this.applicationFormData.serviceName,
        stageName: this.applicationFormData.stageName,
        applicationNumber: this.applicationFormData.applicationNumber,
        applicationId: this.applicationId,
        currentStatusId: this.applicationFormData.currentStatusId,
      },
      nzWidth: '60%',
      nzFooter: [],
    });
  }
  attachmentPreviewLink: any;
  isDownloading: boolean = false;
  downloadFile(attachmentId, type) {
    let requestParms = {
      ApplicationId: this.applicationId,
      ActionAttachmentId: attachmentId,
    };
    this.service
      .downloadFile('UploadAttachment/GetActionAttachmentById', requestParms)
      .subscribe((response) => {
        if (response) {
          this.isDownloading = false;
          if (type == 'preview') {
            let link = `data:${response.extension};base64,${response.fileName}`;
            this.attachmentPreviewLink = link;
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
  closePreview() {
    this.attachmentPreviewLink = '';
    let elementsToRemoveHideClass = document.getElementsByClassName(
      'data-show'
    );
    for (let i = 0; i < elementsToRemoveHideClass.length; i++) {
      elementsToRemoveHideClass[i].classList.remove('data-show');
    }
  }

  openReceiptModal(data) {
    const modal = this.modal.create({
      nzContent: ApplicationReceiptModalComponent,
      nzComponentParams: {
        orderNumber: data.OrderNumber,
      },
      nzWidth: '80%',
      nzFooter: [],
    });
  }

  paymentStatus: string = 'blue';
  checkStatus(status) {
    this.paymentStatus =
      status == 'Failed' ? 'Red' : status == 'Paid' ? 'Green' : 'Gold';
    return this.paymentStatus;
  }

  openUserInfoModal(name, userId?) {
    this.sharedService.openUserInfoModal(name, userId);
  }
  isFilterChage: boolean = false;
  changeFilter(e) {
    this.RemoveFilters();
    this.selectedFilter = e;
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
    this.isFilterChage = !this.isFilterChage;
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
    this.outletRef.clear();
  }
  downloadCertificate(certificate) {
    this.isDownloading = true;
    let requestParms = {
      ApplicationId: certificate.ApplicationId,
      ActionCertificateId: certificate.ApplicationcertificateId,
    };
    this.service
      .downloadFile(
        'UploadAttachment/GetApplicationCertificateById',
        requestParms
      )
      .subscribe((response) => {
        if (response) {
          this.isDownloading = false;
          if (response.fileName) {
            let fileBytesArray = Utils.base64ToArrayBuffer(response.fileName);
            Utils.saveFile(
              response.certificateNumber + '.pdf',
              'application/pdf',
              fileBytesArray
            );
          }
        }
      });
  }
}
