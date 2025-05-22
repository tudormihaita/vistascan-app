export enum UserRole {
    ADMIN = 'ADMIN',
    PATIENT = 'PATIENT',
    EXPERT = 'EXPERT',
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
}

export interface User {
    id: string;
    username: string;
    email: string;
    full_name: string
    birthdate: string;
    gender: Gender;
    role: UserRole;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    full_name: string;
    birthdate: string;
    gender: Gender;
    role: UserRole;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface AuthResponse {
    user: User;
    access_token: string;
}
