import React from 'react';
import {Alert, Card, Col, Layout, Menu, Row, Statistic, Tabs, Typography} from 'antd';
import {
  AreaChartOutlined,
  FileDoneOutlined,
  HomeOutlined,
  LogoutOutlined,
  MedicineBoxOutlined,
  UserOutlined,
} from '@ant-design/icons';
import ImageUpload from './ImageUpload';
import ConsultationList from './ConsultationList';
import {UserRole} from '../../types/auth.types';
import {ConsultationStatus} from '../../types/consultation.types';
import {useNavigate} from 'react-router-dom';
import ExpertConsultations from "../ExpertConsultations.tsx";
import {LocalStorageKeys} from "../../types/enums/LocalStorageKeys.ts";
import {usePatientConsultations} from "../../hooks/usePatientConsultations.ts";
import {clearAuthenticationData} from "../../services/authService.ts";
import {AppRoutes} from "../../types/constants/AppRoutes.ts";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const Dashboard: React.FC = () => {
  const userId = localStorage.getItem(LocalStorageKeys.USER_ID) || '';
  const userRole = localStorage.getItem(LocalStorageKeys.USER_ROLE) as UserRole || UserRole.PATIENT;
  const userFullName = localStorage.getItem(LocalStorageKeys.USER_FULL_NAME) || '';

  const navigate = useNavigate();
  const { consultations } = usePatientConsultations(userId);

  const handleLogout = () => {
    clearAuthenticationData()
    navigate(AppRoutes.LOGIN_PAGE);
  };

  const pendingConsultations = consultations.filter(c => c.status === ConsultationStatus.PENDING).length;
  const inReviewConsultations = consultations.filter(c => c.status === ConsultationStatus.IN_REVIEW).length;
  const completedConsultations = consultations.filter(c => c.status === ConsultationStatus.COMPLETED).length;
  const totalConsultations = consultations.length;

  const menuItems = [
    {
        key: 'dashboard',
        icon: <HomeOutlined />,
        label: 'Dashboard',
    },
    {
        key: 'consultations',
        icon: <FileDoneOutlined />,
        label: 'Consultations',
    },
    ...(userRole === UserRole.EXPERT ? [{
        key: 'pending',
        icon: <MedicineBoxOutlined />,
        label: 'Pending Reviews',
    }] : []),
    {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Profile',
    },
    {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        onClick: handleLogout,
    },
  ];

  const tabItems = [
    {
        key: 'pending',
        label: 'Pending Consultations',
        children: <ExpertConsultations status={ConsultationStatus.PENDING} />,
    },
    {
        key: 'inReview',
        label: 'In Review',
        children: <ExpertConsultations status={ConsultationStatus.IN_REVIEW} />,
    },
    {
        key: 'completed',
        label: 'Completed',
        children: <ExpertConsultations status={ConsultationStatus.COMPLETED} />,
    },
    {
        key: 'all',
        label: 'All Consultations',
        children: <ExpertConsultations />,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', maxWidth: '100%', display: 'flex', flexDirection: 'row', width: '100vw', overflow: 'hidden' }}>
      <Sider
        width={250}
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        style={{ flexShrink: 0 }}
      >
        <div style={{ padding: '16px' }}>
          <Title level={3} style={{ color: '#1890ff', margin: 0 }}>VistaScan</Title>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
          style={{ height: 'calc(100% - 64px)', borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ width: 'calc(100% - 250px)', flex: '1 1 auto', overflow: 'hidden' }}>
        <Header style={{ padding: '0 24px', background: '#fff', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: '16px 0' }}>
              Welcome back, {userFullName}
            </Title>
            <div>
              <span style={{ marginRight: '8px' }}>{userRole}</span>
              <UserOutlined />
            </div>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'auto', height: 'calc(100vh - 64px)' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12} md={6} style={{ marginBottom: '16px' }}>
                <Card>
                  <Statistic
                    title="Total Consultations"
                    value={totalConsultations}
                    prefix={<FileDoneOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6} style={{ marginBottom: '16px' }}>
                <Card>
                  <Statistic
                    title="Pending"
                    value={pendingConsultations}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<AreaChartOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6} style={{ marginBottom: '16px' }}>
                <Card>
                  <Statistic
                    title="In Review"
                    value={inReviewConsultations}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<MedicineBoxOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6} style={{ marginBottom: '16px' }}>
                <Card>
                  <Statistic
                    title="Completed"
                    value={completedConsultations}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<FileDoneOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {(userRole === UserRole.PATIENT || userRole === UserRole.ADMIN) && (
              <>
                <ImageUpload />
                <ConsultationList />
              </>
            )}

            {userRole === UserRole.ADMIN && (
              <Tabs defaultActiveKey="pending" style={{ width: '100%' }} items={tabItems} />
            )}

            {userRole === UserRole.EXPERT && (
              <>
                <Alert
                  message="Admin Dashboard"
                  description="As an administrator, you can manage all aspects of the platform."
                  type="info"
                  showIcon
                  style={{ marginBottom: '24px' }}
                />
                <ImageUpload />
                <ConsultationList />
              </>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;