import React from 'react';
import { Typography, Layout, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import '../styles/auth-layout.css';

const { Title, Text } = Typography;
const { Content } = Layout;

const LoginPage: React.FC = () => {
  return (
    <Layout className="auth-layout">
      <Content className="auth-content">
        <Row className="auth-row">
          <Col xs={22} sm={24} md={16} lg={10} xl={8} className="auth-col">
            <div className="auth-header">
              <Title level={2}>VistaScan</Title>
              <Text type="secondary">Remote Consultation Platform</Text>
            </div>

            <div className="auth-form-container">
              <Title level={3} className="auth-form-title">Log In</Title>
              <LoginForm />

              <div className="auth-footer">
                <Text type="secondary">
                  Don't have an account?{' '}
                  <Link to="/register" className="auth-footer-link">
                    Register
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

export default LoginPage;