import React from 'react';
import { Typography, Layout, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

const { Title, Text } = Typography;
const { Content } = Layout;

const RegisterPage: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Content style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Row style={{ width: '100%' }}>
          <Col xs={24} sm={24} md={16} lg={10} xl={8} style={{ margin: '0 auto', padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Title level={2}>VistaScan</Title>
              <Text type="secondary">Remote Consultation Platform</Text>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6" style={{ width: '100%' }}>
              <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>Create Account</Title>
              <RegisterForm />

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Text type="secondary">
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: '#1890ff' }}>
                    Log In
                  </Link>
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default RegisterPage;