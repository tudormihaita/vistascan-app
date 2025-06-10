import {configureStore} from "@reduxjs/toolkit";
import {apiSlice} from "../api/apiSlice.ts";
import rootReducer from "./rootReducer.ts";

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({serializableCheck: false}).concat(apiSlice.middleware)
    });

export type AppDispatch = typeof store.dispatch;