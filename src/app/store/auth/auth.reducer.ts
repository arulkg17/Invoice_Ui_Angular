import { createFeature, createReducer, on } from '@ngrx/store';
import { login, loginSuccess, loginFailure, logout } from './auth.actions';
import { User } from '../../models/user';

export interface AuthState {
  token: string | null;
  expiration: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  expiration: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialState,
    on(login, (state: any) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(loginSuccess, (state: any, { token, expiration, user }) => ({
      ...state,
      token,
      expiration,
      user,
      isAuthenticated: true,
      loading: false,
      error: null,
    })),
    on(loginFailure, (state: any, { error }) => ({
      ...state,
      token: null,
      expiration: null,
      user: null,
      isAuthenticated: false,
      loading: false,
      error,
    })),
    on(logout, () => initialState),
  ),
});

export const {
  name: authFeatureKey,
  reducer: authReducer,
  selectToken,
  selectExpiration,
  selectUser,
  selectIsAuthenticated,
  selectLoading,
  selectError,
} = authFeature;
