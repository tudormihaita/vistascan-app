import React from 'react';
import { Result, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { HomeOutlined, LoginOutlined } from '@ant-design/icons';
import { AppRoutes } from '../types/constants/AppRoutes';
import '../styles/not-found-page.css';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found-container">
      <Result
        className="not-found-result"
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={[
          <Button type="primary" key="home" icon={<HomeOutlined />}>
            <Link to={AppRoutes.DASHBOARD}>Back Home</Link>
          </Button>,
          <Button key="back" onClick={handleGoBack}>
            Go Back
          </Button>,
          <Button key="login" icon={<LoginOutlined />}>
            <Link to={AppRoutes.LOGIN}>Login</Link>
          </Button>
        ]}
      />
    </div>
  );
};

export default NotFoundPage;