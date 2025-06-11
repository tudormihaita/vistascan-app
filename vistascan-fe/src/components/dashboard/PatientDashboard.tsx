import React from 'react';
import { Alert, Card, Col, Row, Typography, Space, Statistic } from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { useGetConsultationsByUserIdQuery } from '../../api/consultationApi';
import ConsultationList from "../consultation/ConsultationList";
import PatientStudyUpload from "../consultation/PatientStudyUpload";
import {ConsultationStatus} from "../../types/dtos/ConsultationDto.ts";
import {UserRole} from "../../types/dtos/UserDto.ts";

const { Title, Text } = Typography;

interface PatientDashboardProps {
    userId: string;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ userId }) => {
    const { data: consultations = [], isLoading } = useGetConsultationsByUserIdQuery(userId!, {
        skip: !userId
    });

    const activeConsultations = consultations.filter(c =>
        c.status === ConsultationStatus.PENDING || c.status === ConsultationStatus.IN_REVIEW
    ).length;
    const completedConsultations = consultations.filter(c =>
        c.status === ConsultationStatus.COMPLETED
    ).length;
    const hasActiveConsultations = activeConsultations > 0;

    return (
        <div style={{ padding: '0 16px' }}>
            <div style={{ marginBottom: 32 }}>
                <Title level={2} style={{ marginBottom: 8 }}>
                    Welcome to Your Medical Portal
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                    Upload imaging studies and track your consultation progress
                </Text>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                        <Space direction="vertical" size="small">
                            <ClockCircleOutlined
                                style={{
                                    fontSize: 24,
                                    color: hasActiveConsultations ? '#1890ff' : '#d9d9d9'
                                }}
                            />
                            <Statistic
                                title="Active Reviews"
                                value={activeConsultations}
                                valueStyle={{
                                    color: hasActiveConsultations ? '#1890ff' : '#8c8c8c',
                                    fontSize: '20px'
                                }}
                            />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {hasActiveConsultations
                                    ? 'Studies being reviewed'
                                    : 'No pending reviews'
                                }
                            </Text>
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                        <Space direction="vertical" size="small">
                            <CheckCircleOutlined
                                style={{
                                    fontSize: 24,
                                    color: completedConsultations > 0 ? '#52c41a' : '#d9d9d9'
                                }}
                            />
                            <Statistic
                                title="Completed"
                                value={completedConsultations}
                                valueStyle={{
                                    color: completedConsultations > 0 ? '#52c41a' : '#8c8c8c',
                                    fontSize: '20px'
                                }}
                            />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {completedConsultations > 0
                                    ? 'Reports available'
                                    : 'No completed studies'
                                }
                            </Text>
                        </Space>
                    </Card>
                </Col>
            </Row>

            {hasActiveConsultations ? (
                <Alert
                    message="Your studies are being reviewed"
                    description={`You have ${activeConsultations} study${activeConsultations > 1 ? 'ies' : ''} currently under medical review. You'll be notified when the report${activeConsultations > 1 ? 's are' : ' is'} ready.`}
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            ) : consultations.length === 0 ? (
                <Alert
                    message="Welcome! Ready to upload your first study?"
                    description="Upload your medical imaging studies below and our expert radiologists will provide detailed reports. Supported formats include DICOM, JPEG, PNG, and more."
                    type="success"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            ) : (
                <Alert
                    message="All studies reviewed"
                    description="All your previous studies have been completed. Upload a new study below for additional consultation."
                    type="success"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            <Card
                title="Start a New Consultation"
                style={{ marginBottom: 24 }}
            >
                   <Row gutter={16}>
                    <Col xs={24} lg={12}>
                        <PatientStudyUpload />
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
            </Card>

            <Card
                title="Previous Studies"
                extra={
                    consultations.length > 0 && (
                        <Text type="secondary">
                            {consultations.length} total consultation{consultations.length !== 1 ? 's' : ''}
                        </Text>
                    )
                }
            >
                <ConsultationList
                    consultations={consultations}
                    isLoading={isLoading}
                    userRole={UserRole.PATIENT}
                    showPagination={true}
                    pageSize={5}
                />
            </Card>
        </div>
    );
};

export default PatientDashboard;