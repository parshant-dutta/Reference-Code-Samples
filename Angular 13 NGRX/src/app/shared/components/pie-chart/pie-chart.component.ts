import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { GoogleChartInterface, GoogleChartType } from 'ng2-google-charts';
import { Store } from '@ngrx/store';
import { selectUsers } from '../../store/selectors/user.selector';
import * as UserActions from 'src/app/shared/store/actions/user.actions';
import { UnSubscriptionComponent } from '../un-subscription/un-subscription.component';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent extends UnSubscriptionComponent {

  users$!: Observable<User[]>;
  chartData: (string | number)[][] = [];

  public pieChart: GoogleChartInterface = {
    chartType: GoogleChartType.PieChart,
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
      this.pieChart.dataTable = [['User', 'Age'], ...this.chartData];
    }));
    this.store.dispatch(UserActions.getUsers());
  }

  private formatData(users: User[]) {
    return users.map(user => [user.firstName + ' ' + user.lastName, Number(user.age)]);
  }
  
}

