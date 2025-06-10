import {UserRole} from "../../types/dtos/UserDto.ts";
import {LocalStorageKeys} from "../../types/enums/LocalStorageKeys.ts";
import {Navigate, Outlet} from "react-router-dom";
import {AppRoutes} from "../../types/constants/AppRoutes.ts";
import {clearAuthenticationData, getDecodedJwtToken} from "../../services/authService.ts";

interface ProtectedRouteProps {
    roles: Array<keyof typeof UserRole>;
}

const ProtectedRoute = (props: ProtectedRouteProps) => {
    const { roles } = props;
    const userRole = localStorage.getItem(LocalStorageKeys.USER_ROLE);
    const userId = localStorage.getItem(LocalStorageKeys.USER_ID);
    const authToken = getDecodedJwtToken(localStorage.getItem(LocalStorageKeys.USER_TOKEN) || '');

    if (!userRole || !userId || !authToken) {
        return <Navigate to={AppRoutes.LOGIN_PAGE} />;
    }

    if (authToken.exp && authToken.exp * 1000 < Date.now()) {
        clearAuthenticationData();
        return <Navigate to={AppRoutes.LOGIN_PAGE} />;
    }

    if (roles.includes(userRole as keyof typeof UserRole)) {
        return <Outlet />;
    }
    return <Navigate to={AppRoutes.NOT_FOUND_FORBIDDEN_PAGE} />;
}

export default ProtectedRoute;