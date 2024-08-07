import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as UserActions from '../actions/user.actions';
import { UserService } from 'src/app/shared/services/user.service';

@Injectable()
export class UserEffects {
  constructor(private actions$: Actions, private userService: UserService) { }

  //Get User Action call with Api
  getUsers$ = createEffect(() =>
    this.actions$.pipe(ofType(UserActions.getUsers), mergeMap(
      (action) => {
        return this.userService.getUser().pipe(
          map((res) => {
            return UserActions.getUsersSuccess({ users: res });
          }),
          catchError(() => of(UserActions.getUsersFailure()))
        )
      }
    ))
  )

  //Add User Action call with Api
  addUser$ = createEffect(() =>
    this.actions$.pipe(ofType(UserActions.addUser), mergeMap(
      (action) => {
        return this.userService.addUser(action.payload).pipe(
          map((res) => {
            return UserActions.addUserSuccess({ payload: res });
          }),
          catchError(() => of(UserActions.addUserFailure()))
        )
      }
    ))
  )

  //Delete User Action call with Api
  deleteUser$ = createEffect(() =>
    this.actions$.pipe(ofType(UserActions.deleteUser), mergeMap(
      (action) => {
        return this.userService.deleteUser(action.id).pipe(
          map((res) => {
            return UserActions.deleteUserSuccess({ id: action.id });
          }),
          catchError(() => of(UserActions.deleteUserFailure()))
        )
      }
    ))
  )

  //Edit User Action call with Api
  editUser$ = createEffect(() =>
    this.actions$.pipe(ofType(UserActions.editUser), mergeMap(
      (action) => {
        return this.userService.editUser(action.editData.id, action.editData.data).pipe(
          map((res) => {
            return UserActions.editUserSuccess({ payload: res });
          }),
          catchError(() => of(UserActions.editUserFailure()))
        )
      }
    ))
  )

}