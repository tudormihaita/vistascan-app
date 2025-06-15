import React from 'react';
import {Alert, Card, Col, Row, Typography, Space, Statistic} from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { useGetConsultationsByUserIdQuery } from '../../api/consultationApi';
import ConsultationList from "../consultation/ConsultationList";
import PatientStudyUpload from "../consultation/PatientStudyUpload";
import {ConsultationStatus} from "../../types/dtos/ConsultationDto.ts";
import {UserRole} from "../../types/dtos/UserDto.ts";
import '../../styles/patient-dashboard.css';

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
        <div className="patient-dashboard">
            <div className="patient-dashboard-header">
                <Title level={4} className="patient-dashboard-title">
                    Patient Dashboard
                </Title>
            </div>

            <Row gutter={[16, 16]} className="patient-stats-row">
                <Col xs={24} sm={12}>
                    <Card size="small" className="patient-stats-card">
                        <Space direction="vertical" size="small" className="patient-stats-space">
                            <ClockCircleOutlined
                                className={`patient-stats-icon ${
                                    hasActiveConsultations ? 'patient-stats-icon-active' : 'patient-stats-icon-inactive'
                                }`}
                            />
                            <Statistic
                                title="Active Reviews"
                                value={activeConsultations}
                                valueStyle={{
                                    color: hasActiveConsultations ? '#1890ff' : '#8c8c8c',
                                    fontSize: '20px'
                                }}
                            />
                            <Text type="secondary" className="patient-stats-text">
                                {hasActiveConsultations
                                    ? 'Studies being reviewed'
                                    : 'No pending reviews'
                                }
                            </Text>
                        </Space>
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card size="small" className="patient-stats-card">
                        <Space direction="vertical" size="small" className="patient-stats-space">
                            <CheckCircleOutlined
                                className={`patient-stats-icon ${
                                    completedConsultations > 0 ? 'patient-stats-icon-completed' : 'patient-stats-icon-inactive'
                                }`}
                            />
                            <Statistic
                                title="Completed"
                                value={completedConsultations}
                                valueStyle={{
                                    color: completedConsultations > 0 ? '#52c41a' : '#8c8c8c',
                                    fontSize: '20px'
                                }}
                            />
                            <Text type="secondary" className="patient-stats-text">
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
                    description={`You have ${activeConsultations} stud${activeConsultations > 1 ? 'ies' : 'y'} currently under medical review. You'll be notified when the report${activeConsultations > 1 ? 's are' : ' is'} ready.`}
                    type="info"
                    showIcon
                    className="patient-alert"
                />
            ) : consultations.length === 0 ? (
                <Alert
                    message="Welcome! Ready to upload your first study?"
                    description="Upload your medical imaging studies below and our expert radiologists will provide detailed reports. Supported formats include DICOM, JPEG, PNG, and more."
                    type="success"
                    showIcon
                    className="patient-alert"
                />
            ) : (
                <Alert
                    message="All studies reviewed"
                    description="All your previous studies have been completed. Upload a new study below for additional consultation."
                    type="success"
                    showIcon
                    className="patient-alert"
                />
            )}

            <Card
                className="patient-upload-card"
            >
                   <Row gutter={16}>
                    <Col xs={24} sm={12} md={12} lg={12}>
                        <PatientStudyUpload />
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12}>
                        <Card title="Upload Guidelines" className="patient-upload-guidelines">
                            <Alert
                                message="File Upload Instructions"
                                description={
                                    <div className="patient-guidelines-content">
                                        <p>• Supported formats: PNG, JPG</p>
                                        <p>• Maximum file size: 500MB</p>
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
                        <Text type="secondary" className="patient-studies-card-extra">
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