import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-task',
  templateUrl: './delete-task.component.html',
  styleUrls: ['./delete-task.component.scss']
})
export class DeleteTaskComponent {
  label: any;
  valueMsg: any;
  additionalMsg: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  public dialogRef: MatDialogRef<DeleteTaskComponent>,) { }

  ngOnInit(): void {
    this.label =this.data.label;
    this.valueMsg = this.data.msg;
    this.additionalMsg = this.data?.additionalMsg || '';
  }

  
  onDelete() {
    this.dialogRef.close({ key: 'delete' });
  }
}
