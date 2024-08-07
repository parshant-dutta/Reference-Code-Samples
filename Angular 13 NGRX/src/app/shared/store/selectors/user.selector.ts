import { createSelector, createFeatureSelector } from '@ngrx/store';
import { UserState } from '../reducers/user.reducer';

export const selectFeature = createFeatureSelector<UserState>('users');

//User slice
export const selectUsers = createSelector(selectFeature, (state: UserState) => state.users);


