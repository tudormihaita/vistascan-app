import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [form] = Form.useForm();
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);

  const onFinish = async (values: { username: string; password: string; remember: boolean }) => {
    try {
      const { username, password } = values;
      await login({ username, password });
      navigate('/dashboard');
    } catch (err) {
      setShowError(true);
    }
  };

  return (
    <>
      {error && showError && (
        <Alert
          message="Login Error"
          description={error}
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
        onFinish={onFinish}
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
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

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