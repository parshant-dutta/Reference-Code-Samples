import { Router } from '@angular/router';
import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApisService } from 'src/app/core/service/apis.service';
import { AddEditTaskComponent } from 'src/app/shared/component/dailogs/add-edit-task/add-edit-task.component';
import { DeleteTaskComponent } from 'src/app/shared/component/dailogs/delete-task/delete-task.component';
import { ToastrService } from 'ngx-toastr';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-tasklist',
  templateUrl: './tasklist.component.html',
  styleUrls: ['./tasklist.component.scss']
})
export class TasklistComponent {

  totalRecords: any;
  pageSize: any = 5

  columnHeadings: string[] = ['id', 'title', 'description', 'assignby', 'assignto', 'status', 'action'];
  displayedColumns = ['Id', 'Title', 'Description', 'Assign By', 'Assign To', 'Status', 'Action'];

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private apiService: ApisService, public matdailog: MatDialog, public router: Router,
    public toastrService: ToastrService) { }

  ngOnInit() {
    this.getTaskLiast();
  }

  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  //  Get Task List form db.json And Bind lst in table
  getTaskLiast() {
    this.apiService.getTaskList().subscribe((res: any) => {
      this.dataSource = new MatTableDataSource(res)
      this.totalRecords = this.dataSource.filteredData.length;
      this.dataSource.paginator = this.paginator;

    })
  }

  //  Sort Task List Table
  sortData(column: any) {
    this.dataSource.sort = this.sort;

    // Distable Sorting Icon
    switch (column) {
      case 'action':
        break;
    }
  }

  // Search Tasl in list
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  //  We using this Dailog Add and Edit/Update Task in Table List
  openDailog(data: any, key: any) {
    let taskTd = data.id
    const dialogRef = this.matdailog.open(AddEditTaskComponent, {
      width: '40%',
      disableClose: true,

      data: {
        data: data,
        key: key
      }
    })

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        if (key === 'addTask') {
          this.apiService.postTaskList(data).subscribe((res: any) => {
            this.getTaskLiast();
            this.toastrService.success('Add Task Success!', 'Title Success!');
          })
        }
        else if (key === 'editTask') {

          this.apiService.updataTask(taskTd, data).subscribe((res: any) => {
            this.getTaskLiast();
            this.toastrService.success('Update Task Success!', 'Title Success!');

          })
        }
      }
    })
  }


  // Delete Task according to selected id delete that id data
  deleteTask(id: any, key: any) {
    if (key == 'delete') {
      const dialogRef = this.matdailog.open(DeleteTaskComponent, {
        width: '20%',
        disableClose: true,
        data: {
          msg: 'areYouSure',
          additionalMsg: 'youWantToDeleteThisItem',
          label: 'Permission',
        },
      });

      dialogRef.afterClosed().subscribe((data) => {
        if (data) {
          this.apiService.deleteTask(id).subscribe((res: any) => {
            this.getTaskLiast();
            this.toastrService.success('Delete Task Success!', 'Title Success!');

          })
        }

      })
    }
  }

  // Go/ Route Detail Task page using id
  detailPage(id: any) {
    this.router.navigate(['taskdetail/', id])
  }
}
