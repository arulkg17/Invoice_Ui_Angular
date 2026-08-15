import { User } from './user';

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    expiration: string;
    user: User;
  };
}
