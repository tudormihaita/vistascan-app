import React, {useState} from 'react';
import {Consultation, ConsultationStatus} from '../../types/consultation.types';
import {Card, Descriptions, Divider, Modal, Spin, Table, Image, Tag, Button, Typography} from "antd";
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import {usePatientConsultations} from "../../hooks/usePatientConsultations.ts";
import {LocalStorageKeys} from "../../types/enums/LocalStorageKeys.ts";
import {useConsultationDetail} from "../../hooks/useConsultationDetail.ts";

const { Title, Text } = Typography;

const ConsultationList: React.FC = () => {
    const userId = localStorage.getItem(LocalStorageKeys.USER_ID) || '';
    const { consultations, isLoading } = usePatientConsultations(userId);

    const [selectedConsultationId, setSelectedConsultationId] = useState<string | undefined>();
    const [detailVisible, setDetailVisible] = useState<boolean>(false);

    const {
        consultation: selectedConsultation,
        downloadUrl,
        isLoading: isLoadingDetail
    } = useConsultationDetail(detailVisible ? selectedConsultationId : undefined);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getStatusTag = (status: ConsultationStatus) => {
        switch (status) {
            case ConsultationStatus.PENDING:
                return <Tag color="warning">PENDING</Tag>;
            case ConsultationStatus.IN_REVIEW:
                return <Tag color="processing">IN REVIEW</Tag>;
            case ConsultationStatus.COMPLETED:
                return <Tag color="success">COMPLETED</Tag>;
            default:
                return <Tag color="default">UNKNOWN</Tag>;
        }
    };

    const handleViewConsultation = async (consultation: Consultation) => {
        setSelectedConsultationId(consultation.id);
        setDetailVisible(true);
    };

    const handleCloseModal = () => {
        setDetailVisible(false);
        setSelectedConsultationId(undefined);
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (id: string) => id.substring(0, 8) + '...',
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => formatDate(date),
        },
        {
            title: 'File Name',
            dataIndex: ['imaging_study', 'file_name'],
            key: 'file_name',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: ConsultationStatus) => getStatusTag(status),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Consultation) => (
                <Button
                    type="link"
                    icon={<EyeOutlined/>}
                    onClick={() => handleViewConsultation(record)}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Title level={3}>My Consultations</Title>
            <Table
                columns={columns}
                dataSource={consultations}
                rowKey="id"
                loading={isLoading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title="Consultation Details"
                open={detailVisible}
                onCancel={handleCloseModal}
                footer={null}
                width={800}
            >
                {isLoadingDetail ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                    </div>
                ) : selectedConsultation ? (
                    <div>
                        <Descriptions bordered size="small" column={2}>
                            <Descriptions.Item label="ID" span={2}>
                                {selectedConsultation.id}
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                {getStatusTag(selectedConsultation.status)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Created">
                                {formatDate(selectedConsultation.created_at)}
                            </Descriptions.Item>
                            <Descriptions.Item label="File Name">
                                {selectedConsultation.imaging_study?.file_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="File Size">
                                {selectedConsultation.imaging_study?.size
                                    ? `${(selectedConsultation.imaging_study.size / 1024 / 1024).toFixed(2)} MB`
                                    : 'N/A'
                                }
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        {downloadUrl && (
                            <Card title="Medical Image" size="small" style={{ marginBottom: 16 }}>
                                <Image
                                    width="100%"
                                    src={downloadUrl}
                                    placeholder={<Spin />}
                                />
                                <Button
                                    icon={<DownloadOutlined />}
                                    style={{ marginTop: 8 }}
                                    onClick={() => window.open(downloadUrl, '_blank')}
                                >
                                    Download Image
                                </Button>
                            </Card>
                        )}

                        {selectedConsultation.report && (
                            <Card title="Medical Report" size="small">
                                <Text>{selectedConsultation.report.content}</Text>
                                <Divider />
                                <Text type="secondary">
                                    Report created: {formatDate(selectedConsultation.report.created_at)}
                                </Text>
                            </Card>
                        )}
                    </div>
                ) : null}
            </Modal>
        </div>
    );
};


export default ConsultationList;