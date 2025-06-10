import {baseQueryWithReauth} from "../services/authService.ts";
import {createApi} from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({}),
    tagTypes: ['consultationsCache']
});