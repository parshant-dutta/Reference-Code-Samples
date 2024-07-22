/*** Angular core modules ***/
import {
  Directive,
  OnInit,
  Input,
  ElementRef,
  OnChanges,
  HostListener,
  ViewContainerRef,
} from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import { AuthService } from 'src/app/Core/Services/AuthService';

/*** Services ***/
import { ResourceService } from '../../Shared/Services/Resoucre.Service';
import { UpdateTextResourceComponent } from '../Modals/update-text-resource/update-text-resource.component';
import { ResourceModel } from '../Model/Resource.Model';

@Directive({
  selector: '[labelValue]',
})
export class LableValueDirective implements OnInit, OnChanges {
  @Input('key') _key: string;
  @Input('isLoaded') isLoaded: string;
  @Input('category') category: string;
  @Input('replaceSelector') replaceSelector: string = null;
  spanText: string;
  languageList: any;
  resourceList: any = [];
  formFields: any = [];
  constructor(private el: ElementRef, private resourceService: ResourceService,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private authService: AuthService
  ) { }

  @HostListener('click', ['$event'])
  onClick(event) {
    if (this.authService.isAdmin() && event.ctrlKey) {
      event.preventDefault();
      event.stopPropagation();
      this.getlanguages();
    }
  }
  ngOnInit() {
    this.CreateLabel();
    this.resourceList = this.resourceService.getResouceData();
  }

  ngOnChanges() {
    this.resourceService.languageChange.subscribe((res) => {
      this.CreateLabel();
    });
  }

  private CreateLabel(): void {
    if (!localStorage.getItem('resources')) {
      return;
    }
    const ResourceModel: ResourceModel[] = this.resourceService.getResouceData();
    this.mapKeyValue(ResourceModel);
  }

  private mapKeyValue(ResourceModel): void {
    if (!ResourceModel || ResourceModel.error) {
      return;
    }
    let current: ResourceModel = ResourceModel.find(
      (key) => key.key === this._key && key.category == this.category
    );

    if (!current) {
      current = {
        id: -1,
        key: this._key,
        category: this.category,
        value: this.category + '_' + this._key
      }
      if (this.authService.isAdmin()) {
        this.resourceService.get('language').subscribe((result: any) => {
          if (result) {
            result.map((x) => {
              this.formFields.push({
                id: 0,
                languageId: x.id,
                languageName: x.languageName,
                value: this._key + '_' + this.category + '_' + x.languageName
              });
            });
            this.updateResource();
          }
        });
      }
    }

    this.spanText = current.value;

    if (this.replaceSelector) {
      this.spanText = this.spanText.replace('{{0}}', this.replaceSelector)
    }
    var span = document.createElement('span');
    span.innerHTML = this.spanText;
    span.setAttribute('id', current.id.toString());
    span.setAttribute('class', 'text-resource');
    this.el.nativeElement.innerHTML = span.outerHTML;
  }

  getlanguages() {
    this.resourceService.get('language').subscribe((result) => {
      if (result) {
        this.languageList = result;
        this.openEditModal();
      }
    });
  }

  // resource update modal
  openEditModal() {
    const modal = this.modal.create({
      nzContent: UpdateTextResourceComponent,
      nzComponentParams: {
        key: this._key,
        category: this.category,
        spanText: this.spanText,
        languageList: this.languageList
      },
      nzWidth: '50%',
      nzFooter: [],
    });
    modal.afterClose.subscribe((result) => { });
  }

  updateResource() {
    let requestParams = {
      key: this._key,
      category: this.category,
      values: this.formFields
    }

    this.resourceService.post('TextResources/AddUpdateTextResources', requestParams)
      .subscribe((result) => {
        if (result.addUpdateTextResourcesResult && result.addUpdateTextResourcesResult.status == 200) {
          this.resourceList = this.resourceService.getResouceData();
          let currentElementIndex = this.resourceList.findIndex((key) => key.key === this._key && key.category == this.category);
          let languageId = JSON.parse(localStorage.getItem('selectedLanguage')).id;
          let dataObject: ResourceModel = {
            id: JSON.parse(result.addUpdateTextResourcesResult.name).find(x => x.LanguageId == languageId).Id,
            key: this._key,
            category: this.category,
            value: requestParams.values.find(x => x.languageId == languageId).value
          }
          if (currentElementIndex > -1 && currentElementIndex != undefined) {
            this.resourceList[currentElementIndex] = dataObject;
          } else {
            this.resourceList.push(dataObject);
          }
          // localStorage.setItem('resources', JSON.stringify(this.resourceList));
          let resourceObject = {
            "languageId":languageId,
            "data": JSON.stringify(this.resourceList)
          }
          localStorage.setItem('resources', JSON.stringify(resourceObject));
          // this.resourceService.updateResources(this.resourceList);
        }
      })
  }
}