import {apiSlice} from "../api/apiSlice.ts";
import {combineReducers} from "@reduxjs/toolkit";

const rootReducer = combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;