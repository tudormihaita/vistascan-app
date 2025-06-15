import React, {useState} from 'react';
import {Form, Input, Button, Select, DatePicker, notification, Alert} from 'antd';
import {UserOutlined, LockOutlined, MailOutlined, IdcardOutlined, CalendarOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import {useCreateUserByAdminMutation, useRegisterUserMutation} from "../../api/authApi.ts";
import {AppRoutes} from "../../types/constants/AppRoutes.ts";
import {RegisterDataDto} from "../../types/dtos/RegisterDataDto.ts";
import {UserRole, Gender} from "../../types/dtos/UserDto.ts";
import dayjs from 'dayjs';

const {Option} = Select;

interface RegisterFormProps {
    isModal?: boolean;
    showRoleSelect?: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
}

interface RegisterFormValues {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    birthdate: dayjs.Dayjs;
    gender: Gender;
    role?: UserRole;
}

const RegisterForm: React.FC<RegisterFormProps> = (props: RegisterFormProps) => {
    const {isModal = false, showRoleSelect = false, onSuccess, onCancel} = props;
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    const [registerUser, { isLoading: isRegisterLoading }] = useRegisterUserMutation();
    const [createUserByAdmin, {isLoading: isCreateLoading}] = useCreateUserByAdminMutation();

    const mutationToUse = isModal ? createUserByAdmin : registerUser;
    const isLoading = isModal ? isCreateLoading : isRegisterLoading;

    const handleOnFormSubmit = async (values: RegisterFormValues) => {
        const payload: RegisterDataDto = {
            username: values.username,
            email: values.email,
            password: values.password,
            full_name: values.fullName,
            birthdate: values.birthdate.format('YYYY-MM-DD'),
            gender: values.gender,
            role: showRoleSelect ? values.role! : UserRole.PATIENT
        };

        mutationToUse(payload).unwrap()
            .then(() => {
                if (isModal && onSuccess) {
                    setSuccessMessage('User registered successfully!');
                    setShowSuccess(true);
                    setShowError(false);
                    form.resetFields();
                    setTimeout(() => {
                        onSuccess();
                    }, 2000);
                } else {
                    notification.success({
                        message: 'Registration Successful',
                        description: 'Your account has been created successfully! Welcome to VistaScan.',
                        placement: 'topRight',
                        duration: 3,
                    });
                    navigate(AppRoutes.DASHBOARD);
                }
            })
            .catch((err: any) => {
                if (isModal) {
                    setErrorMessage(err?.data?.message || 'An error occurred during registration. Please try again.');
                    setShowError(true);
                    setShowSuccess(false);
                } else {
                    notification.error({
                        message: 'Registration Error',
                        description: err?.data?.message || 'An error occurred during registration. Please try again.',
                        placement: 'topRight',
                        duration: 4,
                    });
                }
            });
    };

    const validatePassword = (_: any, value: string) => {
        if (!value || value.length < 8) {
            return Promise.reject(new Error('Password must be at least 8 characters long!'));
        }
        return Promise.resolve();
    };

    const validateConfirmPassword = (_: any, value: string) => {
        if (!value) {
            return Promise.reject(new Error('Please confirm your password!'));
        }
        if (value !== form.getFieldValue('password')) {
            return Promise.reject(new Error('Passwords do not match!'));
        }
        return Promise.resolve();
    };

    return (
        <>
            {isModal && showError && (
                <Alert
                    message="Registration Error"
                    description={errorMessage}
                    type="error"
                    closable
                    onClose={() => setShowError(false)}
                    style={{ marginBottom: '16px' }}
                />
            )}

            {isModal && showSuccess && (
                <Alert
                    message="Registration Successful"
                    description={successMessage}
                    type="success"
                    closable
                    onClose={() => setShowSuccess(false)}
                    style={{ marginBottom: '16px' }}
                />
            )}

            <Form
            form={form}
            name="register"
            onFinish={handleOnFormSubmit}
            size="large"
            layout="vertical"
            style={{width: '100%'}}
        >
            <Form.Item
                name="username"
                rules={[
                    {required: true, message: 'Please input your username!'},
                    {min: 3, message: 'Username must be at least 3 characters long!'}
                ]}
            >
                <Input
                    prefix={<UserOutlined className="site-form-item-icon"/>}
                    placeholder="Username"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="fullName"
                rules={[
                    {required: true, message: 'Please input your full name!'},
                    {min: 2, message: 'Full name must be at least 2 characters long!'}
                ]}
            >
                <Input
                    prefix={<IdcardOutlined className="site-form-item-icon"/>}
                    placeholder="Full Name"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="email"
                rules={[
                    {required: true, message: 'Please input your email!'},
                    {type: 'email', message: 'Please enter a valid email address!'}
                ]}
            >
                <Input
                    prefix={<MailOutlined className="site-form-item-icon"/>}
                    placeholder="Email"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="birthdate"
                rules={[{required: true, message: 'Please select your birthdate!'}]}
            >
                <DatePicker
                    placeholder="Select birthdate"
                    size="large"
                    style={{width: '100%'}}
                    format="YYYY-MM-DD"
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                    suffixIcon={<CalendarOutlined/>}
                />
            </Form.Item>

            <Form.Item
                name="gender"
                rules={[{required: true, message: 'Please select your gender!'}]}
            >
                <Select placeholder="Select gender" size="large">
                    <Option value={Gender.MALE}>Male</Option>
                    <Option value={Gender.FEMALE}>Female</Option>
                </Select>
            </Form.Item>

            <Form.Item
                name="password"
                rules={[
                    {required: true, message: 'Please input your password!'},
                    {validator: validatePassword}
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon"/>}
                    placeholder="Password"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="confirmPassword"
                rules={[
                    {required: true, message: 'Please confirm your password!'},
                    {validator: validateConfirmPassword}
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon"/>}
                    placeholder="Confirm Password"
                    size="large"
                />
            </Form.Item>

            {showRoleSelect && (
                <Form.Item
                    name="role"
                    label="User Role"
                    rules={[{required: true, message: 'Please select a role!'}]}
                    initialValue={UserRole.PATIENT}
                >
                    <Select placeholder="Select user role" size="large">
                        <Option value={UserRole.PATIENT}>Patient</Option>
                        <Option value={UserRole.EXPERT}>Expert</Option>
                        <Option value={UserRole.ADMIN}>Admin</Option>
                    </Select>
                </Form.Item>
            )}

            <Form.Item>
                <div style={{display: 'flex', gap: '12px', flexDirection: isModal ? 'row' : 'column'}}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{width: isModal ? 'auto' : '100%', flex: isModal ? 1 : undefined}}
                        loading={isLoading}
                        size="large"
                    >
                        {isModal ? 'Create User' : 'Register'}
                    </Button>

                    {isModal && onCancel && (
                        <Button
                            type="default"
                            onClick={onCancel}
                            style={{width: 'auto', flex: 1}}
                            size="large"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </Form.Item>
        </Form>
        </>
    );
};

export default RegisterForm;