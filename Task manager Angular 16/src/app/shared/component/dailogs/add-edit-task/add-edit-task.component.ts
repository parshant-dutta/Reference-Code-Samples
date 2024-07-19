import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularEditorConfig } from "@kolkov/angular-editor";

@Component({
  selector: 'app-add-edit-task',
  templateUrl: './add-edit-task.component.html',
  styleUrls: ['./add-edit-task.component.scss']
})
export class AddEditTaskComponent {

  public taskForm!: FormGroup;

  editData: any

  status = [
    { id: 1, name: 'Complete' },
    { id: 2, name: 'Incomplete' }]

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<AddEditTaskComponent>, private fb: FormBuilder) {

    this.editData = data.key;

    this.taskForm = this.fb.group({
      title: new FormControl('', [Validators.required]),
      assignby: new FormControl('', [Validators.required]),
      assignto: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      status: new FormControl('', [Validators.required])

    });

    //  Bind data in input feild
    this.taskForm?.controls['title'].patchValue(data.data.title)
    this.taskForm?.controls['assignby'].patchValue(data?.data.assignby)
    this.taskForm?.controls['assignto'].patchValue(data.data.assignto)
    this.taskForm?.controls['description'].patchValue(data?.data.description)
    this.taskForm?.controls['status'].patchValue(data?.data.status)
  }

  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    // height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
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
  ngOnInit(): void {}


  // when close dailog box send data task list component
  submitTask(data: any) {
    this.taskForm.markAllAsTouched();
    
    if(this.taskForm.valid){

      this.dialogRef.close(data);
    }
  }
}
