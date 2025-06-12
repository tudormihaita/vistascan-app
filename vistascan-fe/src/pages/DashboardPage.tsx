import React, { useState } from 'react';
import { Layout, Menu, Typography } from "antd";
import { LocalStorageKeys } from "../types/enums/LocalStorageKeys.ts";
import { useNavigate } from "react-router-dom";
import { clearAuthenticationData } from "../services/authService.ts";
import { AppRoutes } from "../types/constants/AppRoutes.ts";
import {UserRole} from "../types/dtos/UserDto.ts";
import {
    HomeOutlined,
    LogoutOutlined,
    UserOutlined,
} from "@ant-design/icons";
import ExpertDashboard from "../components/dashboard/ExpertDashboard.tsx";
import AdminDashboard from "../components/dashboard/AdminDashboard.tsx";
import PatientDashboard from "../components/dashboard/PatientDashboard.tsx";
import '../styles/dashboard-layout.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

type MenuItem = {
    key: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
};

const DashboardPage: React.FC = () => {
    const [activeKey, setActiveKey] = useState<string>('dashboard');
    const navigate = useNavigate();

    const userId = localStorage.getItem(LocalStorageKeys.USER_ID) || '';
    const userRole = localStorage.getItem(LocalStorageKeys.USER_ROLE) as UserRole || UserRole.PATIENT;
    const userFullName = localStorage.getItem(LocalStorageKeys.USER_FULL_NAME) || '';

    const handleLogout = () => {
        clearAuthenticationData();
        navigate(AppRoutes.LOGIN);
    };

    const menuItems: MenuItem[] = [
        {
            key: 'dashboard',
            icon: <HomeOutlined />,
            label: 'Dashboard',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: handleLogout,
        }
    ];

    const handleMenuClick = (key: string) => {
        const menuItem = menuItems.find(item => item.key === key);
        if (menuItem?.onClick) {
            menuItem.onClick();
        } else {
            setActiveKey(key);
        }
    };

    const renderContent = () => {
        switch (userRole) {
            case UserRole.PATIENT:
                return <PatientDashboard userId={userId} />;
            case UserRole.EXPERT:
                return <ExpertDashboard userId={userId} />;
            case UserRole.ADMIN:
                return <AdminDashboard />;
            default:
                return <Title level={3}>Unauthorized</Title>;
        }
    };

    return (
        <Layout className="dashboard-layout">
            <Sider
                width={250}
                theme="light"
                breakpoint="lg"
                collapsedWidth="0"
                className="dashboard-sider"
            >
                <div className="dashboard-logo">
                    <Title level={3}>VistaScan</Title>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[activeKey]}
                    items={menuItems}
                    className="dashboard-menu"
                    onClick={({ key }) => handleMenuClick(key)}
                />
            </Sider>

            <Layout className="dashboard-main">
                <Header className="dashboard-header">
                    <div className="dashboard-header-content">
                        <Title level={4} className="dashboard-welcome">
                            Welcome back, {userFullName}
                        </Title>
                        <div className="dashboard-user-info">
                            <span className="dashboard-user-role">{userRole}</span>
                            <UserOutlined className="dashboard-user-icon" />
                        </div>
                    </div>
                </Header>

                <Content className="dashboard-content">
                    <div className="dashboard-content-wrapper">
                        {renderContent()}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardPage;