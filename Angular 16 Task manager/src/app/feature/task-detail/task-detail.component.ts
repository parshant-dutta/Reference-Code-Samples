import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ApisService } from 'src/app/core/service/apis.service';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent {
  taskId: any
  pageDes:any
  taskDetailList: any = []
  isReadonly = true;

  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    enableToolbar: true,
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]
  }

  mentionConfig = {
    mentions: [
      {
        triggerChar: '@',
        items: [
          {
            id: '1',
            name: 'TJ Peden',
          },
        ],
        labelKey: 'name',
        mentionSelect(user: { id: any; name: any; }) {
          return `<a href="#" id="${user.id}>${user.name}</a>`
        }
      }
    ]
  }
  status = [
    { id: 1, name: 'Complete' },
    { id: 2, name: 'Incomplete' }]

  constructor(public activatedRoute: ActivatedRoute, public apiservice: ApisService) {
    // Get Id form route url using  activated route
    this.activatedRoute.paramMap.subscribe((param) => {
      this.taskId = param.get("id");
    })
  }
  ngOnInit(): void {
    this.getParticularDetail();
  }
 
  // Get  particular id task Detail
  getParticularDetail() {
    this.apiservice.getDetail(this.taskId).subscribe((res: any) => {
      this.taskDetailList = res
      this.pageDes = this.taskDetailList.description
    })
  }

  // Go preview page 
  backPage() {
    history.back();

  }
  contenteditables: boolean = false
  newValue: any

  // In detail page after edit user want update task
  update() {
   const updatedData ={
      title:this.taskDetailList.title,
      status: this.taskDetailList.status,
      assignby:this.taskDetailList.assignby,
      assignto:this.taskDetailList.assignto,
      description:this.taskDetailList.description

    }
    this.apiservice.updataTask(this.taskId, updatedData).subscribe((res: any) => {

    })
    this.isReadonly = true
  }
  clear(oldData: any) {
    this.newValue = oldData;
    this.contenteditables = false;
}

// Toggle icon in deatail page user want edit than this ico help him
toggleReadonly() {
  this.isReadonly = !this.isReadonly;
}

}
