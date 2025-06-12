import React from 'react';
import { Typography, Layout, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import '../styles/auth-layout.css';

const { Title, Text } = Typography;
const { Content } = Layout;

const RegisterPage: React.FC = () => {
  return (
    <Layout className="auth-layout">
      <Content className="auth-content">
        <Row className="auth-row">
          <Col xs={24} sm={24} md={16} lg={10} xl={8} className="auth-col">
            <div className="auth-header">
              <Title level={2}>VistaScan</Title>
              <Text type="secondary">Remote Consultation Platform</Text>
            </div>

            <div className="auth-form-container">
              <Title level={3} className="auth-form-title">Create Account</Title>
              <RegisterForm />

              <div className="auth-footer">
                <Text type="secondary">
                  Already have an account?{' '}
                  <Link to="/login" className="auth-footer-link">
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