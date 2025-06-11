import React from "react";
import {
    Route,
    createBrowserRouter,
    createRoutesFromElements, RouterProvider
} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import {AppRoutes} from "./types/constants/AppRoutes.ts";
import RegisterPage from "./pages/RegisterPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.tsx";
import {UserRole} from "./types/dtos/UserDto.ts";

const appRouter = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path='/' element={<HomePage />} />
            <Route path={AppRoutes.LOGIN} element={<LoginPage />} />
            <Route path={AppRoutes.REGISTER} element={<RegisterPage />} />
            <Route path={AppRoutes.NOT_FOUND} element={<NotFoundPage />} />

            <Route element={<ProtectedRoute roles={[UserRole.PATIENT, UserRole.EXPERT, UserRole.ADMIN]} />}>
                <Route path={AppRoutes.DASHBOARD} element={<DashboardPage />} />
            </Route>
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