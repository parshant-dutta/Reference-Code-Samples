import { createAction, props } from '@ngrx/store';

// Get Users
export const getUsers = createAction('[Users] Get Users');
export const getUsersSuccess = createAction('[Users] Get getUsers Success', props<{ users: any }>());
export const getUsersFailure = createAction('[Users] Get getUsers Failure');

// Add User Actions
export const addUser = createAction('[Users] Add User', props<{ payload: any }>());
export const addUserSuccess = createAction('[Users] Add User Success', props<{ payload: any }>());
export const addUserFailure = createAction('[Users] Add User Failure');

// Delete user Actions
export const deleteUser = createAction('[Users] Delete User', props<{ id: string }>());
export const deleteUserSuccess = createAction('[Users] Delete User Success', props<{ id: string }>());
export const deleteUserFailure = createAction('[Users] Delete User Failure');

//Edit User Actions
export const editUser = createAction('[Users] Edit User', props<{ editData: any }>());
export const editUserSuccess = createAction('[Users] Edit User Success', props<{ payload: any }>());
export const editUserFailure = createAction('[Users] Edit User Failure');
