export enum UserRole {
    ADMIN = 'ADMIN',
    PATIENT = 'PATIENT',
    EXPERT = 'EXPERT',
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
}

export interface UserDto {
    id: string;
    username: string;
    email: string;
    full_name: string
    birthdate: string;
    gender: Gender;
    role: UserRole;
}