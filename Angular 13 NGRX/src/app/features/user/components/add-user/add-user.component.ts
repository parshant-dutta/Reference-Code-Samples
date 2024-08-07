import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as UserActions from 'src/app/shared/store/actions/user.actions';
import { Observable, Subscription } from 'rxjs';
import { selectUsers } from '../../../../shared/store/selectors/user.selector';
import { UserPageTitle } from '../../enums/user-list.enum';
import { User } from '../../../../shared/models/user.model';
import { UnSubscriptionComponent } from 'src/app/shared/components/un-subscription/un-subscription.component';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent extends UnSubscriptionComponent {

  pageTitle = UserPageTitle.UserForm;
  users$: Observable<User[]>;
  registerForm: FormGroup;
  filterData: any;
  id: string | null | undefined;

  constructor(private store: Store, private router: Router, private route: ActivatedRoute) {
    super();
    this.registerForm = this.createForm();
    this.users$ = this.store.select(selectUsers);  //Get users 

    this.subscription.add(this.users$.subscribe(user => {
      this.id = this.route.snapshot.paramMap.get('id');
      if (!this.id) return
      this.filterData = user.find(item => item.id == this.id);
      this.registerForm.patchValue(this.filterData);
    }))
    if (!this.filterData && this.id) this.store.dispatch(UserActions.getUsers());
  }

  public onSave() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
    }
    else {
      const formData = this.registerForm.value;
      if (this.id) {
        let editData = { id: this.id, data: formData };
        this.store.dispatch(UserActions.editUser({ editData }));
      } else {
        this.store.dispatch(UserActions.addUser({ payload: formData }));
      }
      this.onUserList();
    }
  }

  public onUserList() {
    this.router.navigate(['/users'])
  }

  private createForm() {
    return new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]),
      lastName: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [Validators.required,Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$'),]),
      age: new FormControl('', [Validators.required, Validators.pattern(/^\d{2,3}$/)]),
      company: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required])
    });
  }

}
  