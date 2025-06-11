import {Gender, UserRole} from "./UserDto.ts";

export interface RegisterDataDto {
    username: string;
    email: string;
    password: string;
    full_name: string;
    birthdate: string;
    gender: Gender;
    role: UserRole;
}