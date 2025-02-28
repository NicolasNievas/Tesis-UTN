export enum Role {
    ADMINISTRATOR = 'ADMINISTRATOR',
    CUSTOMER = 'CUSTOMER',
}

export enum LOGIN_VIEW {
    SIGN_IN = "sign-in",
    REGISTER = "register",
    VERIFY_EMAIL = 'VERIFY_EMAIL',
    FORGOT_PASSWORD = 'FORGOT_PASSWORD',
    RESET_PASSWORD = 'RESET_PASSWORD'
}

export enum RESPONSE_STATUS {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400
}

export enum TypeDocument{
    DNI,
    PASAPORTE
} 