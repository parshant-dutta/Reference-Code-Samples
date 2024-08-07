import { createReducer, on } from '@ngrx/store';
import * as UserActions from '../actions/user.actions';
import { User } from 'src/app/shared/models/user.model';

export interface UserState { //State type
  users: User[];
}

export let initialState: UserState = { //intial State
  users: []
};

export let UserReducer = createReducer(initialState,

  //Get User Actions
  on(UserActions.getUsers, (state) => ({ ...state })), //Get Users intial state

  on(UserActions.getUsersSuccess, (state, users) => { //Get Users success response
    return {
      ...state,
      users: [...users.users]
    };
  }),

  on(UserActions.getUsersFailure, (state) => { //Get Users failure response
    return {
      ...state,
      users: []
    };
  }),   

  //Add User Actions
  on(UserActions.addUser, (state) => ({ ...state })), //Add User

  on(UserActions.addUserSuccess, (state, Action) => { //Add User Success
    return {
      ...state,
      users: [...state.users, Action.payload]
    };
  }),
  on(UserActions.addUserFailure, (state) => { //Add User Failure
    return {
      ...state,
      users: [...state.users]
    };
  }),

  //Delete User Actions
  on(UserActions.deleteUser, (state) => ({ ...state })), //Delete User

  on(UserActions.deleteUserSuccess, (state, id) => { //Delete User Success
    const filterValue = state.users.filter(user => user.id != id.id);
    return {
      ...state,
      users: [...filterValue]
    };
  }),

  on(UserActions.deleteUserFailure, (state) => {  //Delete User Failure
    return {
      ...state,
      users: []
    };
  }),

  //Edit User Actions
  on(UserActions.editUser, (state) => ({ ...state })), //Edit User

  on(UserActions.editUserSuccess, (state, data) => { //Edit User Success
    const updatedUsers = state.users.map((user) => user.id === data.payload.id ? data.payload : user)
    return {
      ...state,
      users: [...updatedUsers]
    };
  }),

  on(UserActions.editUserFailure, (state) => {  //Edit User Failure
    return {
      ...state,
      users: []
    };
  })
  
);
