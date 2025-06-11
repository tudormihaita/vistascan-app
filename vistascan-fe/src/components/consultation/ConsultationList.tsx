import React, {useState} from 'react';
import {
    Button,
    Card,
    Descriptions,
    Divider,
    Image, message,
    Modal, Popconfirm,
    Space,
    Spin,
    Table,
    TableColumnsType,
    Tag, Tooltip,
    Typography,
} from 'antd';
import {
    CheckCircleOutlined,
    DeleteOutlined,
    DownloadOutlined,
    EyeOutlined,
    MedicineBoxOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {ConsultationDto, ConsultationStatus} from '../../types/dtos/ConsultationDto.ts';
import {useConsultationDetail} from '../../hooks/useConsultationDetail.ts';
import {LocalStorageKeys} from '../../types/enums/LocalStorageKeys.ts';
import {UserRole} from "../../types/dtos/UserDto.ts";
import {useDeleteConsultationMutation} from "../../api/adminApi.ts";

const {Title, Text, Paragraph} = Typography;

interface ConsultationListProps {
    consultations: ConsultationDto[];
    isLoading?: boolean;
    userRole: UserRole;
    title?: string;
    onAssignToSelf?: (consultationId: string) => void;
    onWriteReport?: (consultationId: string) => void;
    onRefetch?: () => void;
    showPagination?: boolean;
    pageSize?: number;
    emptyText?: string;
}

const ConsultationList: React.FC<ConsultationListProps> = (props: ConsultationListProps) => {
    const {
        consultations = [],
        isLoading = false,
        userRole,
        title = "Consultations",
        onAssignToSelf,
        onWriteReport,
        onRefetch,
        showPagination = true,
        pageSize = 5,
        emptyText,
    } = props;
    const userId = localStorage.getItem(LocalStorageKeys.USER_ID) || '';
    const [selectedConsultationId, setSelectedConsultationId] = useState<string | undefined>();
    const [detailVisible, setDetailVisible] = useState<boolean>(false);

    const [deleteConsultation, { isLoading: isDeleting }] = useDeleteConsultationMutation();
    const {
        consultation: selectedConsultation,
        downloadUrl,
        isLoading: isLoadingDetail
    } = useConsultationDetail(detailVisible ? selectedConsultationId : undefined);

    const handleViewConsultation = (consultationId: string) => {
        setSelectedConsultationId(consultationId);
        setDetailVisible(true);
    };

    const handleCloseModal = () => {
        setDetailVisible(false);
        setSelectedConsultationId(undefined);
    };

      const handleDeleteConsultation = async (consultationId: string) => {
        try {
            await deleteConsultation(consultationId).unwrap();
            message.success('Consultation deleted successfully');
            if (onRefetch) {
                onRefetch();
            }
        } catch (error: any) {
            console.error('Delete consultation error:', error);
            message.error(error?.data?.detail || 'Failed to delete consultation');
        }
    };

    const formatDate = (dateString: string) => {
        return dayjs(dateString).format('MMM DD, YYYY HH:mm');
    };

    const getStatusTag = (status: ConsultationStatus) => {
        const statusConfig = {
            [ConsultationStatus.PENDING]: {
                color: 'orange',
                text: 'Pending Review',
                description: 'Waiting for expert assignment'
            },
            [ConsultationStatus.IN_REVIEW]: {
                color: 'blue',
                text: 'Under Review',
                description: 'Being analyzed by medical expert'
            },
            [ConsultationStatus.COMPLETED]: {
                color: 'green',
                text: 'Completed',
                description: 'Report available'
            },
        };

        const config = statusConfig[status] || {color: 'default', text: 'Unknown', description: ''};
        return (
            <Tag color={config.color} title={config.description}>
                {config.text}
            </Tag>
        );
    };

    const baseColumns: TableColumnsType<ConsultationDto> = [
        {
            title: 'Study Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => formatDate(date),
            sorter: (a: ConsultationDto, b: ConsultationDto) =>
                dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
            defaultSortOrder: 'descend',
            width: 150,
        },
        {
            title: 'Imaging Study',
            dataIndex: ['imaging_study', 'file_name'],
            key: 'file_name',
            render: (fileName: string, record: ConsultationDto) => (
                <div>
                    <div style={{fontWeight: 500}}>{fileName}</div>
                    <Text type="secondary" style={{fontSize: '12px'}}>
                        {(record.imaging_study.size / 1024 / 1024).toFixed(1)} MB
                    </Text>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: ConsultationStatus) => getStatusTag(status),
            width: 140,
            filters: userRole !== UserRole.PATIENT ? [
                {text: 'Pending', value: ConsultationStatus.PENDING},
                {text: 'In Review', value: ConsultationStatus.IN_REVIEW},
                {text: 'Completed', value: ConsultationStatus.COMPLETED},
            ] : undefined,
            onFilter: userRole !== UserRole.PATIENT ? (value, record) => record.status === value : undefined,
        },
    ];

    const expertColumns: TableColumnsType<ConsultationDto> = [
        {
            title: 'Consultation ID',
            dataIndex: 'id',
            key: 'id',
            render: (id: string) => (
                <Tooltip title={id} placement="top">
                    <Text code style={{fontSize: '12px', cursor: 'pointer'}}>
                        {id?.substring(0, 8)}...
                    </Text>
                </Tooltip>
            ),
            width: 120,
        },
        {
            title: 'Patient ID',
            dataIndex: 'patient_id',
            key: 'patient_id',
            render: (id: string) => (
                <Tooltip title={id} placement="top">
                    <Text code style={{fontSize: '12px', cursor: 'pointer'}}>
                        {id?.substring(0, 8)}...
                    </Text>
                </Tooltip>
            ),
            width: 120,
        },
        {
            title: 'Expert ID',
            dataIndex: 'expert_id',
            key: 'expert_id',
            render: (id: string | null, _: ConsultationDto) => {
                if (!id) return <Text type="secondary">Not assigned</Text>;
                const isCurrentUser = id === userId;
                return (
                    <span>
                         <Tooltip title={id} placement="top">
                            <Text code style={{fontSize: '12px', cursor: 'pointer'}}>
                                {id?.substring(0, 8)}...
                            </Text>
                        </Tooltip>
                        {isCurrentUser && <Tag color="blue" style={{marginLeft: 4}}>You</Tag>}
                    </span>
                );
            },
            width: 130,
        },
    ];

    const actionsColumn: TableColumnsType<ConsultationDto>[0] = {
        title: 'Actions',
        key: 'actions',
        render: (_: any, record: ConsultationDto) => {
            const isAssignedToMe = record.expert_id === userId;
            const canAssign = record.status === ConsultationStatus.PENDING && (userRole === UserRole.EXPERT || userRole === UserRole.ADMIN);
            const canWriteReport = record.status === ConsultationStatus.IN_REVIEW &&
                isAssignedToMe && !record.report &&
                (userRole === UserRole.EXPERT || userRole === UserRole.ADMIN);
            const canDelete = userRole === UserRole.ADMIN;

            return (
                <Space size="small" direction="vertical">
                    <Button
                        type="link"
                        icon={<EyeOutlined/>}
                        onClick={() => handleViewConsultation(record.id || '')}
                        size="small"
                    >
                        {userRole === UserRole.PATIENT ? 'View Details' : 'View'}
                    </Button>

                    {canAssign && onAssignToSelf && (
                        <Button
                            type="link"
                            icon={<CheckCircleOutlined/>}
                            onClick={() => onAssignToSelf(record.id || '')}
                            size="small"
                        >
                            Assign to Me
                        </Button>
                    )}

                    {canWriteReport && onWriteReport && (
                        <Button
                            type="link"
                            icon={<MedicineBoxOutlined/>}
                            onClick={() => onWriteReport(record.id || '')}
                            size="small"
                        >
                            Write Report
                        </Button>
                    )}

                    {canDelete && (
                        <Popconfirm
                            title="Delete Consultation"
                            description={
                                <div>
                                    <p>Are you sure you want to delete this consultation?</p>
                                    <p style={{ color: '#ff4d4f', fontSize: '12px' }}>
                                        This will permanently delete:
                                    </p>
                                    <ul style={{ fontSize: '12px', color: '#ff4d4f', margin: '4px 0' }}>
                                        <li>The consultation record</li>
                                        <li>The uploaded imaging study</li>
                                        <li>Any associated reports</li>
                                    </ul>
                                    <p style={{ fontSize: '12px', color: '#666' }}>
                                        This action cannot be undone.
                                    </p>
                                </div>
                            }
                            onConfirm={() => handleDeleteConsultation(record.id || '')}
                            okText="Delete"
                            cancelText="Cancel"
                            okType="danger"
                            icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                            placement="topRight"
                        >
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                loading={isDeleting}
                            >
                                Delete
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            );
        },
        width: userRole === UserRole.PATIENT ? 120 : 200,
    };

    const getColumns = (): TableColumnsType<ConsultationDto> => {
        let columns = [...baseColumns];

        if (userRole === UserRole.EXPERT || userRole === UserRole.ADMIN) {
            columns.splice(1, 0, ...expertColumns);
        }

        columns.push(actionsColumn);

        return columns;
    };

    const getDefaultEmptyText = () => {
        switch (userRole) {
            case UserRole.PATIENT:
                return 'No consultations yet. Upload your first imaging study above!';
            case UserRole.EXPERT:
                return 'No consultations available for review.';
            case UserRole.ADMIN:
                return 'No consultations in the system.';
            default:
                return 'No consultations found.';
        }
    };

    const getPaginationConfig = () => {
        if (!showPagination) return false;

        const baseConfig = {
            pageSize,
            size: 'small' as const,
        };

        if (userRole === UserRole.EXPERT || userRole === UserRole.ADMIN) {
            return {
                ...baseConfig,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total: number, range: number[]) =>
                    `${range[0]}-${range[1]} of ${total} consultations`,
            };
        }

        return baseConfig;
    };

    return (
        <>
            {title && (
                <Title level={4} style={{marginBottom: 16}}>
                    {title}
                </Title>
            )}

            <Table
                columns={getColumns()}
                dataSource={consultations}
                rowKey="id"
                loading={isLoading}
                pagination={getPaginationConfig()}
                size={userRole === UserRole.PATIENT ? 'middle' : 'small'}
                locale={{
                    emptyText: emptyText || getDefaultEmptyText()
                }}
                scroll={userRole !== UserRole.PATIENT ? {x: 1000} : undefined}
            />

            <Modal
                title="Consultation Details"
                open={detailVisible}
                onCancel={handleCloseModal}
                width={900}
                footer={[
                    <Button key="close" onClick={handleCloseModal}>
                        Close
                    </Button>,
                    downloadUrl && (
                        <Button
                            key="download"
                            type="primary"
                            icon={<DownloadOutlined/>}
                            href={downloadUrl}
                            target="_blank"
                        >
                            Download Study
                        </Button>
                    ),
                ]}
                loading={isLoadingDetail}
            >
                {selectedConsultation && (
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
                        <div>
                            <Descriptions
                                title="Consultation Information"
                                bordered
                                column={1}
                                size="small"
                                style={{marginBottom: 16}}
                            >
                                {(userRole === UserRole.EXPERT || userRole === UserRole.ADMIN) && (
                                    <Descriptions.Item label="Consultation ID">
                                        <Text code>{selectedConsultation.id}</Text>
                                    </Descriptions.Item>
                                )}
                                {(userRole === UserRole.EXPERT || userRole === UserRole.ADMIN) && (
                                    <Descriptions.Item label="Patient ID">
                                        <Text code>{selectedConsultation.patient_id}</Text>
                                    </Descriptions.Item>
                                )}
                                <Descriptions.Item label="Status">
                                    {getStatusTag(selectedConsultation.status)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Submitted Date">
                                    {formatDate(selectedConsultation.created_at)}
                                </Descriptions.Item>
                                {selectedConsultation.completed_at && (
                                    <Descriptions.Item label="Completed Date">
                                        {formatDate(selectedConsultation.completed_at)}
                                    </Descriptions.Item>
                                )}
                                {(userRole === UserRole.EXPERT || userRole === UserRole.ADMIN) && selectedConsultation.expert_id && (
                                    <Descriptions.Item label="Reviewed By">
                                        <span>
                                            <Text code>{selectedConsultation.expert_id.substring(0, 8)}...</Text>
                                            {selectedConsultation.expert_id === userId && (
                                                <Tag color="blue" style={{marginLeft: 4}}>You</Tag>
                                            )}
                                        </span>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>

                            <Descriptions
                                title="Imaging Study Details"
                                bordered
                                column={1}
                                size="small"
                                style={{marginBottom: 16}}
                            >
                                <Descriptions.Item label="File Name">
                                    {selectedConsultation.imaging_study.file_name}
                                </Descriptions.Item>
                                <Descriptions.Item label="File Size">
                                    {(selectedConsultation.imaging_study.size / 1024 / 1024).toFixed(2)} MB
                                </Descriptions.Item>
                                <Descriptions.Item label="File Type">
                                    {selectedConsultation.imaging_study.content_type}
                                </Descriptions.Item>
                                <Descriptions.Item label="Upload Date">
                                    {formatDate(selectedConsultation.imaging_study.upload_date)}
                                </Descriptions.Item>
                            </Descriptions>

                            {selectedConsultation.report ? (
                                <Card
                                    title="Medical Report"
                                    size="small"
                                    style={{backgroundColor: '#f8f9fa'}}
                                >
                                    <Paragraph
                                        style={{
                                            whiteSpace: 'pre-line',
                                            margin: 0,
                                            maxHeight: '300px',
                                            overflowY: 'auto'
                                        }}
                                    >
                                        {selectedConsultation.report.content}
                                    </Paragraph>
                                    <Divider style={{margin: '12px 0'}}/>
                                    <Text type="secondary" style={{fontSize: '12px'}}>
                                        Report generated: {formatDate(selectedConsultation.report.created_at)}
                                    </Text>
                                </Card>
                            ) : (
                                <Card
                                    title="Medical Report"
                                    size="small"
                                    style={{backgroundColor: '#f8f9fa'}}
                                >
                                    <Text type="secondary">
                                        {selectedConsultation.status === ConsultationStatus.PENDING
                                            ? "Your study is waiting to be assigned to a medical expert."
                                            : selectedConsultation.status === ConsultationStatus.IN_REVIEW
                                                ? "Your study is currently being reviewed by a medical expert. The report will be available soon."
                                                : "No report available for this consultation."
                                        }
                                    </Text>
                                </Card>
                            )}
                        </div>

                        <div>
                            <Title level={5} style={{marginBottom: 16}}>
                                Imaging Study Preview
                            </Title>
                            {downloadUrl ? (
                                <div style={{textAlign: 'center'}}>
                                    <Image
                                        src={downloadUrl}
                                        alt="Medical imaging study"
                                        style={{
                                            width: '100%',
                                            borderRadius: '8px',
                                            border: '1px solid #d9d9d9'
                                        }}
                                        placeholder={
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '60px 20px',
                                                backgroundColor: '#fafafa',
                                                borderRadius: '8px'
                                            }}>
                                                <Spin size="large"/>
                                                <div style={{marginTop: 16}}>
                                                    <Text type="secondary">Loading image...</Text>
                                                </div>
                                            </div>
                                        }
                                    />
                                    <div style={{marginTop: 12}}>
                                        <Button
                                            type="link"
                                            icon={<DownloadOutlined/>}
                                            href={downloadUrl}
                                            target="_blank"
                                            size="small"
                                        >
                                            View Full Size
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '8px',
                                    padding: '60px 20px',
                                    textAlign: 'center',
                                    border: '1px solid #d9d9d9'
                                }}>
                                    <Text type="secondary">Image preview not available</Text>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default ConsultationList;