import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as UserActions from 'src/app/shared/store/actions/user.actions';
import { Router } from '@angular/router';
import { selectUsers } from '../../../../shared/store/selectors/user.selector';
import { UserListColumn, UserListHeader, UserPageTitle } from '../../enums/user-list.enum';
import { User } from '../../../../shared/models/user.model';
import { MatTableDataSource } from '@angular/material/table';
import { UnSubscriptionComponent } from 'src/app/shared/components/un-subscription/un-subscription.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent extends UnSubscriptionComponent {

  filteredUsers: MatTableDataSource<User> = new MatTableDataSource<User>();
  users$: Observable<User[]>;
  pageTitle = UserPageTitle.UsersList;
  displayedColumns: string[] = [
    UserListColumn.FirstName,
    UserListColumn.Email,
    UserListColumn.PhoneNumber,
    UserListColumn.Age,
    UserListColumn.Address,
    UserListColumn.Action
  ];
  displayedColumnsArray = [
    { key: UserListColumn.FirstName, header: UserListHeader.NameHeader },
    { key: UserListColumn.Email, header: UserListHeader.EmailHeader },
    { key: UserListColumn.PhoneNumber, header: UserListHeader.PhoneNumberHeader },
    { key: UserListColumn.Age, header: UserListHeader.AgeHeader },
    { key: UserListColumn.Address, header: UserListHeader.AddressHeader }
  ];

  constructor(private store: Store, private router: Router) {
    super();
    this.users$ = this.store.select(selectUsers);
    this.subscription.add(this.users$.subscribe(users => this.filteredUsers.data = users));

  }

  ngOnInit() {
    this.store.dispatch(UserActions.getUsers());
  }

  public onDeleteUser(id: string) {
    this.store.dispatch(UserActions.deleteUser({ id }));
  }

  public onEditUser(id: string) {
    this.router.navigate([`/users/edit/${id}`]);
  }

  public onAddNewUser() {
    this.router.navigate(['/users/add']);
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredUsers.filter = filterValue;
    this.filteredUsers.filterPredicate = (data: User, filter: string): boolean => {
      filter = filter.trim().toLowerCase();
      return data.firstName.toLowerCase().includes(filter) || data.age.toString().includes(filter);
    };
  }

}
