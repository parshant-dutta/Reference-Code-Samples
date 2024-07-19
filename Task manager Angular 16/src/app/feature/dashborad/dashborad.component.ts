import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApisService } from 'src/app/core/service/apis.service';

@Component({
  selector: 'app-dashborad',
  templateUrl: './dashborad.component.html',
  styleUrls: ['./dashborad.component.scss']
})
export class DashboradComponent {



  filteredCompletetask: any;
  filteredIncompletetask: any;
  totalIncompletetask: any
  totalCompletetask: any
  totalTaskLIast: any
  Complete: any = 'Complete';
  Incomplete: any = 'Incomplete';

  constructor(private apiService: ApisService, public router: Router,
    public toastrService: ToastrService) { }

  ngOnInit() {
    this.getTaskLiast();
  }


  //  Get Task List form db.json And Bind lst in table
  getTaskLiast() {
    this.apiService.getTaskList().subscribe((res: any) => {
      const task = res
      this.totalTaskLIast = task.length
      this.filter(res)

    })
  }
  filter(task: any) {

    // Get number of Complete task
    this.filteredCompletetask = task.filter((res: any) => res.status.includes(this.Complete));
    this.totalCompletetask = this.filteredCompletetask.length;

    // Get number of Incomplete task
    this.filteredIncompletetask = task.filter((res: any) => res.status.includes(this.Incomplete));
    this.totalIncompletetask = this.filteredIncompletetask.length;


  }
}
