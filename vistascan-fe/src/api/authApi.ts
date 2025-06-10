import {apiSlice} from "./apiSlice.ts";
import {AuthDto} from "../types/dtos/AuthDto.ts";
import {LoginCredentialsDto} from "../types/dtos/LoginCredentialsDto.ts";
import {LocalStorageKeys} from "../types/enums/LocalStorageKeys.ts";
import {RegisterDataDto} from "../types/dtos/RegisterDataDto.ts";

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        loginUser: builder.mutation<AuthDto, LoginCredentialsDto>({
            query: (loginCredentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: loginCredentials
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    console.log("Login successful:", data);
                    if (data.access_token) {
                        localStorage.setItem(LocalStorageKeys.USER_TOKEN, data.access_token);
                    }
                    if (data.user) {
                        localStorage.setItem(LocalStorageKeys.USER_ID, data.user?.id);
                        localStorage.setItem(LocalStorageKeys.USER_ROLE, data.user?.role);
                        localStorage.setItem(LocalStorageKeys.USER_FULL_NAME, data.user?.full_name || '');
                    }
                } catch (error) {
                    console.log('Login failed:', error);
                }
            }
        }),
        registerUser: builder.mutation<AuthDto, RegisterDataDto>({
            query: (registerData) => ({
                url: '/auth/register',
                method: 'POST',
                body: registerData
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;

                    if (data.access_token) {
                        localStorage.setItem(LocalStorageKeys.USER_TOKEN, data.access_token);
                    }
                    if (data.user) {
                        localStorage.setItem(LocalStorageKeys.USER_ID, data.user?.id);
                        localStorage.setItem(LocalStorageKeys.USER_ROLE, data.user?.role);
                        localStorage.setItem(LocalStorageKeys.USER_FULL_NAME, data.user?.full_name || '');
                    }
                } catch (error) {
                    console.log('Registration failed:', error);
                }
            }
        }),
    }),
});

export const {
    useLoginUserMutation,
    useRegisterUserMutation,
} = authApi;