import React from "react";
import {
    Route,
    Navigate,
    createBrowserRouter,
    createRoutesFromElements, RouterProvider
} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import {AppRoutes} from "./types/constants/AppRoutes.ts";

const appRouter = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path={AppRoutes.LOGIN_PAGE} element={<LoginPage />} />
            <Route path={AppRoutes.NOT_FOUND_FORBIDDEN_PAGE} element={<NotFoundPage />} />

            <Route path={AppRoutes.DASHBOARD_PAGE} element={<DashboardPage />} />
            <Route path='/' element={<Navigate to={AppRoutes.DASHBOARD_PAGE} replace />} />
        </>
    )
);

const App: React.FC = () => {
    return (
        <div className="App">
            <RouterProvider router={appRouter} />
        </div>
    )
};

export default App;