import { createAction, props } from "@ngrx/store";
import { LoginRequest } from "../../models/loginrequest";
import { User } from "../../models/user";

export const login = createAction(
    '[Auth] Login',
    props<{credentials: LoginRequest}>()
);

export const loginSuccess = createAction(
    '[Auth] Login Success',
    props<{
        token: string; 
        expiration: string; 
        user: User;
    }>()
);

export const loginFailure = createAction(
    '[Auth] Login Failure',
    props<{error:string}>()
);

export const logout = createAction(
    '[Auth] Logout'
);

export const restoreSession = createAction(
    '[Auth] Restore Session'
);


