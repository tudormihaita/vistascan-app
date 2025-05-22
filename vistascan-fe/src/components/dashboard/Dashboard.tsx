import React, {useEffect} from 'react';
import {Alert, Card, Col, Layout, Menu, Row, Statistic, Tabs, Typography} from 'antd';
import {
  AreaChartOutlined,
  FileDoneOutlined,
  HomeOutlined,
  LogoutOutlined,
  MedicineBoxOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {useAuthStore} from '../../store/authStore';
import {useConsultationStore} from '../../store/consultationStore';
import ImageUpload from './ImageUpload';
import ConsultationList from './ConsultationList';
import {UserRole} from '../../types/auth.types';
import {ConsultationStatus} from '../../types/consultation.types';
import {useNavigate} from 'react-router-dom';
import ExpertConsultations from "../ExpertConsultations.tsx";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { consultations, fetchConsultationsByUserId } = useConsultationStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchConsultationsByUserId(user.id);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pendingConsultations = consultations.filter(c => c.status === ConsultationStatus.PENDING).length;
  const inReviewConsultations = consultations.filter(c => c.status === ConsultationStatus.IN_REVIEW).length;
  const completedConsultations = consultations.filter(c => c.status === ConsultationStatus.COMPLETED).length;
  const totalConsultations = consultations.length;

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
          style={{ height: 'calc(100% - 64px)', borderRight: 0 }}
        >
          <Menu.Item key="dashboard" icon={<HomeOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="consultations" icon={<FileDoneOutlined />}>
            Consultations
          </Menu.Item>
          {user?.role === UserRole.EXPERT && (
            <Menu.Item key="pending" icon={<MedicineBoxOutlined />}>
              Pending Reviews
            </Menu.Item>
          )}
          <Menu.Item key="profile" icon={<UserOutlined />}>
            Profile
          </Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ width: 'calc(100% - 250px)', flex: '1 1 auto', overflow: 'hidden' }}>
        <Header style={{ padding: '0 24px', background: '#fff', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: '16px 0' }}>
              Welcome back, {user?.full_name}
            </Title>
            <div>
              <span style={{ marginRight: '8px' }}>{user?.role}</span>
              <UserOutlined />
            </div>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'auto', height: 'calc(100vh - 64px)' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
            {/* Dashboard Stats */}
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

            {(user?.role === UserRole.PATIENT || user?.role === UserRole.ADMIN) && (
              <>
                <ImageUpload />
                <ConsultationList />
              </>
            )}

            {user?.role === UserRole.ADMIN && (
              <Tabs defaultActiveKey="pending" style={{ width: '100%' }}>
                <TabPane tab="Pending Consultations" key="pending">
                  <ExpertConsultations status={ConsultationStatus.PENDING} />
                </TabPane>
                <TabPane tab="In Review" key="inReview">
                  <ExpertConsultations status={ConsultationStatus.IN_REVIEW} />
                </TabPane>
                <TabPane tab="Completed" key="completed">
                  <ExpertConsultations status={ConsultationStatus.COMPLETED} />
                </TabPane>
                <TabPane tab="All Consultations" key="all">
                  <ExpertConsultations />
                </TabPane>
              </Tabs>
            )}

            {user?.role === UserRole.EXPERT && (
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