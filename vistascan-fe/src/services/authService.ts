import {BaseQueryFn, FetchArgs, fetchBaseQuery, FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {SerializedError} from "@reduxjs/toolkit";
import {AppConfig} from "../types/constants/AppConfig.ts";
import {LocalStorageKeys} from "../types/enums/LocalStorageKeys.ts";
import {AppRoutes} from "../types/constants/AppRoutes.ts";
import {jwtDecode} from "jwt-decode";

type BaseQueryFnResult = BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError | SerializedError
>;

export const baseQueryWithReauth: BaseQueryFnResult = async (
    args,
    api,
    extraOptions,
) => {
    const baseQuery = fetchBaseQuery({
        baseUrl: AppConfig.serverUrl,
        credentials: "include",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem(LocalStorageKeys.USER_TOKEN);
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        }
    });

    let result = await baseQuery(args, api, extraOptions);

    // Unauthorized errors => token refresh or redirect to login
    if (result.error && result.error.status === 401) {
        clearAuthenticationData();

        if (!window.location.pathname.includes(AppRoutes.LOGIN_PAGE)) {
            window.location.href = AppRoutes.LOGIN_PAGE;
        }
    }

    return result;
}

export const getDecodedJwtToken = (token: string)=> {
    try {
        if (token) {
            return jwtDecode(token);
        }
        return null;
    } catch (error) {
        console.error(`Error retrieving token: ${error}`);
        return null;
    }
}

export const clearAuthenticationData = () => {
    localStorage.removeItem(LocalStorageKeys.USER_TOKEN);
    localStorage.removeItem(LocalStorageKeys.USER_ID);
    localStorage.removeItem(LocalStorageKeys.USER_ROLE);
    localStorage.removeItem(LocalStorageKeys.USER_FULL_NAME);
}