import React, {useState} from 'react';
import {
    Modal,
    Form,
    Input,
    Typography,
    Button,
    Alert,
    message,
    Image,
    Spin,
} from 'antd';
import {
    SendOutlined,
    SyncOutlined,
    DownloadOutlined,
} from '@ant-design/icons';
import {ConsultationDto} from '../../types/dtos/ConsultationDto';
import {
    useAssignConsultationMutation,
    useSubmitReportMutation,
    useGenerateDraftReportMutation,
} from '../../api/consultationApi';
import {useConsultationDetail} from '../../hooks/useConsultationDetail';
import {LocalStorageKeys} from '../../types/enums/LocalStorageKeys';
import ConsultationList from './ConsultationList';
import {UserRole} from "../../types/dtos/UserDto.ts";
import '../../styles/consultation-manager.css';

const {Title, Text} = Typography;
const {TextArea} = Input;

interface ConsultationManagerProps {
    consultations: ConsultationDto[];
    isLoading?: boolean;
    userRole: UserRole;
    title?: string;
    onRefetch: () => void;
}

const ConsultationManager: React.FC<ConsultationManagerProps> = (props: ConsultationManagerProps) => {
    const {
        consultations,
        isLoading = false,
        userRole,
        title,
        onRefetch,
    } = props;
    const userId = localStorage.getItem(LocalStorageKeys.USER_ID) || '';

    const [assignConsultation] = useAssignConsultationMutation();
    const [submitReport] = useSubmitReportMutation();
    const [generateDraftReport] = useGenerateDraftReportMutation();

    const [selectedConsultationId, setSelectedConsultationId] = useState<string | undefined>(undefined);
    const [reportModalVisible, setReportModalVisible] = useState<boolean>(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
    const [form] = Form.useForm();

    const {
        consultation: selectedConsultation,
        downloadUrl,
        isLoading: isLoadingDetail
    } = useConsultationDetail(reportModalVisible ? selectedConsultationId : undefined);

    const handleAssignToSelf = async (consultationId: string) => {
        try {
            if (!consultationId || !userId) {
                message.error('Missing consultation ID or user ID');
                return;
            }

            await assignConsultation({
                consultation_id: consultationId,
                expert_id: userId
            }).unwrap();

            message.success('Consultation assigned successfully!');
            onRefetch();
        } catch (error: any) {
            console.error('Assignment error:', error);
            message.error(`Failed to assign consultation: ${error?.data?.detail || error?.message || 'Unknown error'}`);
        }
    };

    const handleWriteReport = (consultationId: string) => {
        setSelectedConsultationId(consultationId);
        setReportModalVisible(true);
    };

    const handleReportSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (selectedConsultationId) {
                await submitReport({
                    consultation_id: selectedConsultationId,
                    content: values.report,
                    expert_id: userId
                }).unwrap();

                message.success('Report submitted successfully');
                setReportModalVisible(false);
                form.resetFields();
                onRefetch();
            }
        } catch (error) {
            message.error('Failed to submit report');
        }
    };

    const handleGenerateDraftReport = async () => {
        if (!selectedConsultationId) {
            message.error('No consultation selected');
            return;
        }

        setIsGeneratingReport(true);

        try {
            const updatedConsultation = await generateDraftReport(selectedConsultationId).unwrap();

            if (updatedConsultation && updatedConsultation.report) {
                form.setFieldsValue({
                    report: updatedConsultation.report.content
                });

                message.success('Draft report generated successfully! You can review and edit it before submitting.');
            } else {
                message.error('Failed to generate draft report. Please try again.');
            }
        } catch (error) {
            message.error('Failed to generate draft report. Please try again.');
        } finally {
            setIsGeneratingReport(false);
        }
    };

    return (
        <>
            <ConsultationList
                consultations={consultations}
                isLoading={isLoading}
                userRole={userRole}
                title={title}
                onAssignToSelf={handleAssignToSelf}
                onWriteReport={handleWriteReport}
                onRefetch={onRefetch}
                showPagination={true}
                pageSize={10}
            />

            <Modal
                title="Write Diagnostic Report"
                open={reportModalVisible}
                onCancel={() => {
                    setReportModalVisible(false);
                    form.resetFields();
                }}
                width={1000}
                footer={[
                    <Button
                        key="generate"
                        onClick={handleGenerateDraftReport}
                        loading={isGeneratingReport}
                        icon={<SyncOutlined/>}
                    >
                        Generate AI Draft
                    </Button>,
                    <Button
                        key="cancel"
                        onClick={() => {
                            setReportModalVisible(false);
                            form.resetFields();
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleReportSubmit}
                        icon={<SendOutlined/>}
                    >
                        Submit Report
                    </Button>
                ]}
                loading={isLoadingDetail}
            >
                <div className="consultation-manager-modal-alert">
                    <Alert
                        message="Write a detailed diagnostic report for this imaging study"
                        description="Review the image carefully and provide your findings. You can use the 'Generate AI Draft' button to get AI assistance, then review and edit before submitting."
                        type="info"
                        showIcon
                    />
                </div>

                <div className="consultation-manager-modal-grid">
                    <div className="consultation-manager-modal-left">
                        <Form form={form} layout="vertical">
                            <Form.Item
                                name="report"
                                label="Diagnostic Report"
                                rules={[{required: true, message: 'Please enter a report or generate one with AI'}]}
                            >
                                <TextArea
                                    rows={20}
                                    placeholder="Enter your findings, impressions, and recommendations..."
                                    className="consultation-manager-textarea"
                                />
                            </Form.Item>
                        </Form>
                    </div>

                    <div className="consultation-manager-modal-right">
                        <Title level={5} className="consultation-manager-modal-title">Imaging Study</Title>
                        {selectedConsultation && (
                            <div className="consultation-manager-file-info">
                                <Text strong>File: </Text>
                                <Text>{selectedConsultation.imaging_study.file_name}</Text>
                                <br/>
                                <Text strong>Size: </Text>
                                <Text>{(selectedConsultation.imaging_study.size / 1024 / 1024).toFixed(2)} MB</Text>
                                <br/>
                                <Text strong>Patient ID: </Text>
                                <Text code>{selectedConsultation.patient_id.substring(0, 8)}...</Text>
                            </div>
                        )}

                        {downloadUrl ? (
                            <div>
                                <div className="consultation-manager-image-container">
                                    <Image
                                        src={downloadUrl}
                                        alt="Imaging study for diagnosis"
                                        className="consultation-manager-image"
                                        placeholder={
                                            <div className="consultation-manager-image-placeholder">
                                                <Spin size="large"/>
                                            </div>
                                        }
                                    />
                                </div>
                                <div className="consultation-manager-download-center">
                                    <Button
                                        type="link"
                                        icon={<DownloadOutlined/>}
                                        href={downloadUrl}
                                        target="_blank"
                                    >
                                        Open Full Size
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="consultation-manager-image-placeholder">
                                <Text type="secondary">Loading image...</Text>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ConsultationManager;