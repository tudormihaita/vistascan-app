import {UserDto} from "./UserDto.ts";

export interface AuthDto {
    user: UserDto;
    access_token: string;
}