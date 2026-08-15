export interface User {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  displayName: string;
  phoneNumber: string;
  alternatePhone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  dateOfBirth: string | null;
  isActive: boolean;
  lastLoginDate: string | null;
}

