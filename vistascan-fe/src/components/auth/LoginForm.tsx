import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {useLoginUserMutation} from "../../api/authApi.ts";
import {AppRoutes} from "../../types/constants/AppRoutes.ts";

const LoginForm: React.FC = () => {
  const [form] = Form.useForm();
  const [login, { isLoading } ] = useLoginUserMutation();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const handleOnFormSubmit = async (values: { username: string; password: string }) => {
    login({ username: values.username, password: values.password }).unwrap()
        .then(() => {
          navigate(AppRoutes.DASHBOARD);
        })
        .catch((err: any) => {
            setErrorMessage(err?.data?.message || 'An error occurred during login. Please try again.');
            setShowError(true);
        })
  };

  return (
    <>
      {showError && (
        <Alert
          message="Login Error"
          description={errorMessage || 'An error occurred during login. Please try again.'}
          type="error"
          closable
          className="mb-4"
          onClose={() => setShowError(false)}
        />
      )}

      <Form
        form={form}
        name="login"
        initialValues={{ remember: true }}
        onFinish={handleOnFormSubmit}
        size="large"
        layout="vertical"
        style={{ width: '100%' }}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Username"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="Password"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <a style={{ color: '#1890ff' }} href="">
              Forgot password
            </a>
          </div>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{ width: '100%' }}
            loading={isLoading}
            size="large"
          >
            Log in
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default LoginForm;