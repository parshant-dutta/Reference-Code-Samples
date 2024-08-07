import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { GoogleChartInterface, GoogleChartType } from 'ng2-google-charts';
import { Store } from '@ngrx/store';
import { selectUsers } from '../../store/selectors/user.selector';
import * as UserActions from 'src/app/shared/store/actions/user.actions';
import { UnSubscriptionComponent } from '../un-subscription/un-subscription.component';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent extends UnSubscriptionComponent {

  users$!: Observable<User[]>;
  chartData: (string | number)[][] = [];

  public barChart: GoogleChartInterface = {
    chartType: GoogleChartType.BarChart,
    dataTable: [['User', 'Age']],  
    options: {
      title: 'Users',
      hAxis: { title: 'User' },
      vAxis: { title: 'Age' }
    }
  };

  constructor(private store: Store) {
    super();
   }

  ngOnInit() {
    this.users$ = this.store.select(selectUsers);
    this.subscription.add(this.users$.subscribe((users: User[]) => {
      this.chartData = this.formatData(users);
      this.barChart.dataTable = [['User', 'Age'], ...this.chartData];
    }));
    this.store.dispatch(UserActions.getUsers());
  }

  private formatData(users: User[]) {
    return users.map(user => [user.firstName + ' ' + user.lastName, Number(user.age)]);
  }
  
}
