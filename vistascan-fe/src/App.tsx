import React, {useEffect} from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import {useAuthStore} from "./store/authStore.ts";

const App: React.FC = () => {
    const {initAuth} = useAuthStore();

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/dashboard" element={<DashboardPage/>}/>
                <Route path="*" element={<NotFoundPage/>}/>
            </Routes>
        </Router>
    );
};

export default App;