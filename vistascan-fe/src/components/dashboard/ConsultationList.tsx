import React, {useState} from 'react';
import {useConsultationStore} from '../../store/consultationStore';
import {Consultation, ConsultationStatus} from '../../types/consultation.types';
import {Card, Descriptions, Divider, Modal, Spin, Table, Image, Tag, Button, Typography} from "antd";
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ConsultationList: React.FC = () => {
    const {consultations, isLoading, fetchConsultationById} = useConsultationStore();
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
    const [detailVisible, setDetailVisible] = useState<boolean>(false);
    const [imageLoading, setImageLoading] = useState<boolean>(false);

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
        setSelectedConsultation(consultation);
        if (consultation.id) {
            await fetchConsultationById(consultation.id);
        }
        setDetailVisible(true);
    };

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
        <Card title="Your Consultations">
            <Table
                dataSource={consultations}
                columns={columns}
                rowKey="id"
                loading={isLoading && consultations.length === 0}
                locale={{
                    emptyText: 'No consultations found. Upload an imaging study to create a new consultation.'
                }}
            />

            <Modal
                title="Consultation Details"
                visible={detailVisible}
                onCancel={() => setDetailVisible(false)}
                width={900}
                footer={[
                    <Button key="close" onClick={() => setDetailVisible(false)}>
                        Close
                    </Button>
                ]}
            >
                {selectedConsultation && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Descriptions title="Imaging Study" bordered column={1} size="small">
                                <Descriptions.Item label="File Name">
                                    {selectedConsultation.imaging_study.file_name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Content Type">
                                    {selectedConsultation.imaging_study.content_type}
                                </Descriptions.Item>
                                <Descriptions.Item label="Size">
                                    {Math.round(selectedConsultation.imaging_study.size / 1024)} KB
                                </Descriptions.Item>
                                <Descriptions.Item label="Upload Date">
                                    {formatDate(selectedConsultation.imaging_study.upload_date)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    {getStatusTag(selectedConsultation.status)}
                                </Descriptions.Item>
                            </Descriptions>

                            {selectedConsultation.expert_id && (
                                <>
                                    <Divider/>
                                    <Descriptions title="Expert" bordered column={1} size="small">
                                        <Descriptions.Item label="Expert ID">
                                            {selectedConsultation.expert_id}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </>
                            )}

                            {selectedConsultation.report && (
                                <>
                                    <Divider/>
                                    <Title level={5}>Report</Title>
                                    <Card size="small">
                                        <Text>{selectedConsultation.report.content}</Text>
                                        <div className="mt-2">
                                            <Text type="secondary">
                                                Created: {formatDate(selectedConsultation.report.created_at)}
                                            </Text>
                                        </div>
                                    </Card>
                                </>
                            )}
                        </div>

                        <div>
                            <Title level={5}>Image Preview</Title>
                            {selectedConsultation.download_url ? (
                                <div>
                                    <div className="relative">
                                        {imageLoading && (
                                            <div
                                                className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                                                <Spin/>
                                            </div>
                                        )}
                                        <Image
                                            src={selectedConsultation.download_url}
                                            alt="Imaging study"
                                            className="rounded-md"
                                            onLoad={() => setImageLoading(false)}
                                            onError={() => setImageLoading(false)}
                                            placeholder={true}
                                        />
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button
                                            type="primary"
                                            icon={<DownloadOutlined/>}
                                            href={selectedConsultation.download_url}
                                            target="_blank"
                                        >
                                            Open Original
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-100 rounded-md p-8 text-center">
                                    <Text type="secondary">No preview available</Text>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </Card>
    );
};


export default ConsultationList;