export interface RegisterRequestType {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
}

export interface LoginRequestType {
    email: string;
    password: string;
}

export interface LoginResponseType {
    accessToken: string;
    expires: number;
}

export interface ChangePasswordRequestType {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}


