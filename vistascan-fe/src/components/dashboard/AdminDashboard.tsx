import React, { useState } from 'react';
import { Alert, Card, Col, Row, Statistic, Typography, Button, Modal, Tabs } from 'antd';
import {
    AreaChartOutlined,
    FileDoneOutlined,
    MedicineBoxOutlined,
    TeamOutlined,
    UserOutlined,
    CloudUploadOutlined,
} from '@ant-design/icons';
import ImageUpload from './ImageUpload';
import RegisterForm from '../auth/RegisterForm';
import UserManagement from '../admin/UserManagement';
import { ConsultationStatus } from '../../types/consultation.types';
import { useGetConsultationsByUserIdQuery } from "../../api/consultationApi.ts";
import ConsultationsManagement from "../admin/ConsultationsManagement.tsx";

const { Title } = Typography;

interface AdminDashboardProps {
    userId: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userId }) => {
    const { data: consultations = [] } = useGetConsultationsByUserIdQuery(userId);
    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);

    const showRegisterModal = () => {
        setIsRegisterModalVisible(true);
    };

    const handleRegisterModalClose = () => {
        setIsRegisterModalVisible(false);
    };

    const handleRegistrationSuccess = () => {
        setTimeout(() => {
            setIsRegisterModalVisible(false);
        }, 1000);
    };

    const pendingConsultations = consultations.filter(c => c.status === ConsultationStatus.PENDING).length;
    const inReviewConsultations = consultations.filter(c => c.status === ConsultationStatus.IN_REVIEW).length;
    const completedConsultations = consultations.filter(c => c.status === ConsultationStatus.COMPLETED).length;
    const totalConsultations = consultations.length;

    const tabItems = [
        {
            key: 'consultations',
            label: (
                <span>
                    <FileDoneOutlined />
                    Consultation Management
                </span>
            ),
            children: <ConsultationsManagement />,
        },
        {
            key: 'users',
            label: (
                <span>
                    <UserOutlined />
                    User Management
                </span>
            ),
            children: <UserManagement />,
        },
        {
            key: 'upload',
            label: (
                <span>
                    <CloudUploadOutlined />
                    File Upload
                </span>
            ),
            children: (
                <Row gutter={16}>
                    <Col xs={24} lg={12}>
                        <ImageUpload />
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Upload Guidelines" style={{ height: '100%' }}>
                            <Alert
                                message="File Upload Instructions"
                                description={
                                    <div>
                                        <p>• Supported formats: PNG, JPG</p>
                                        <p>• Maximum file size: 10MB</p>
                                        <p>• Files will be processed automatically</p>
                                        <p>• A new consultation will be created upon upload</p>
                                    </div>
                                }
                                type="info"
                                showIcon
                            />
                        </Card>
                    </Col>
                </Row>
            ),
        },
    ];

    return (
        <>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <Title level={3} style={{ margin: 0 }}>Admin Dashboard</Title>
                <Button
                    type="primary"
                    icon={<TeamOutlined />}
                    onClick={showRegisterModal}
                    size="large"
                >
                    Create New User
                </Button>
            </div>

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

            <Alert
                message="Admin Dashboard"
                description="As an administrator, you can manage all aspects of the platform including user registration, consultation oversight, and file uploads."
                type="info"
                showIcon
                style={{ marginBottom: '24px' }}
            />

            <Tabs defaultActiveKey="consultations" size="large" items={tabItems} />

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TeamOutlined style={{ color: '#1890ff' }} />
                        <span>Register New User</span>
                    </div>
                }
                open={isRegisterModalVisible}
                onCancel={handleRegisterModalClose}
                footer={null}
                width={600}
                centered
            >
                <div style={{ padding: '16px 0' }}>
                    <RegisterForm
                        isModal={true}
                        showRoleSelect={true}
                        onSuccess={handleRegistrationSuccess}
                        onCancel={handleRegisterModalClose}
                    />
                </div>
            </Modal>
        </>
    );
};

export default AdminDashboard;