import React, { useState, useEffect } from 'react';
import {
    Table,
    Tag,
    Button,
    Modal,
    Form,
    Input,
    Typography,
    Card,
    Space,
    Image,
    Spin,
    Descriptions,
    Divider,
    message, Alert
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  DownloadOutlined,
  SendOutlined
} from '@ant-design/icons';
import {Consultation, ConsultationStatus} from "../types/consultation.types.ts";
import { useConsultationStore } from '../store/consultationStore.ts';
import {useAuthStore} from "../store/authStore.ts";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ExpertConsultationsProps {
  status?: ConsultationStatus;
}

const ExpertConsultations: React.FC<ExpertConsultationsProps> = ({ status }) => {
  const { user } = useAuthStore();
  const {
    consultations,
    isLoading,
    fetchConsultationsByUserId,
    fetchConsultationById,
    assignConsultation,
    generateDraftReport,
    submitReport,
  } = useConsultationStore();

  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [reportModalVisible, setReportModalVisible] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchConsultationsByUserId(user?.id || '');
  }, [status]);

  const filteredConsultations = status
    ? consultations.filter(c => c.status === status)
    : consultations;

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

  const handleAssignToMe = async (consultation: Consultation) => {
    if (!user?.id || !consultation.id) return;

    try {
      await assignConsultation({
        consultation_id: consultation.id,
        expert_id: user.id
      });
      message.success('Consultation assigned to you successfully');
      fetchConsultationsByUserId(user.id);
    } catch (error) {
      message.error('Failed to assign consultation');
    }
  };

  const handleReportSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (selectedConsultation?.id && user?.id) {
        await submitReport({
          consultation_id: selectedConsultation.id,
          content: values.report,
          expert_id: user.id
        });

        message.success('Report submitted successfully');
        setReportModalVisible(false);
        fetchConsultationsByUserId(user.id);
      }
    } catch (error) {
      message.error('Failed to submit report');
    }
  };

  const handleGenerateDraftReport = async () => {
    if (!selectedConsultation?.id) {
      message.error('No consultation selected');
      return;
    }

    setIsGeneratingReport(true);

    try {
      const updatedConsultation = await generateDraftReport(selectedConsultation.id);

      if (updatedConsultation && updatedConsultation.report) {
        form.setFieldsValue({
          report: updatedConsultation.report.content
        });

        setSelectedConsultation(updatedConsultation);

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

  // const handleGenerateSampleReport = async () => {
  //   setIsGeneratingReport(true);
  //
  //   setTimeout(() => {
  //     const generatedReport = `FINDINGS:\n\nPA and lateral views of the chest demonstrate mild cardiomegaly. There is blunting of the right costophrenic angle consistent with a small pleural effusion. No focal consolidation or pneumothorax is seen. The remaining lung fields are clear. The mediastinal contours are within normal limits.\n\nIMPRESSION:\n\n1. Mild cardiomegaly\n2. Small right pleural effusion\n3. No acute pulmonary disease`;
  //
  //     form.setFieldsValue({
  //       report: generatedReport
  //     });
  //
  //     setIsGeneratingReport(false);
  //   }, 2000);
  // };

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
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewConsultation(record)}
          >
            View
          </Button>

          {record.status === ConsultationStatus.PENDING && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleAssignToMe(record)}
            >
              Assign to me
            </Button>
          )}

          {record.status === ConsultationStatus.IN_REVIEW && record.expert_id === user?.id && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedConsultation(record);
                setReportModalVisible(true);
              }}
            >
              Write Report
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Table
          dataSource={filteredConsultations}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          locale={{
            emptyText: status === ConsultationStatus.PENDING
              ? 'No pending consultations found'
              : 'No consultations found'
          }}
        />
      </Card>

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
                  <Divider />
                  <Descriptions title="Assignment" bordered column={1} size="small">
                    <Descriptions.Item label="Expert ID">
                      {selectedConsultation.expert_id}
                    </Descriptions.Item>
                  </Descriptions>
                </>
              )}

              {selectedConsultation.report && (
                <>
                  <Divider />
                  <Title level={5}>Report</Title>
                  <Card size="small">
                    <Paragraph
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {selectedConsultation.report.content}
                    </Paragraph>
                    <div className="mt-2">
                      <Text type="secondary">
                        Created: {formatDate(selectedConsultation.report.created_at)}
                      </Text>
                    </div>
                  </Card>
                </>
              )}

              {selectedConsultation.status === ConsultationStatus.IN_REVIEW &&
                selectedConsultation.expert_id === user?.id && !selectedConsultation.report && (
                <div className="mt-4">
                  <Button
                    type="primary"
                    onClick={() => setReportModalVisible(true)}
                    icon={<EditOutlined />}
                  >
                    Write Report
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Title level={5}>Image Preview</Title>
              {selectedConsultation.download_url ? (
                <div>
                  <div className="relative">
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                        <Spin />
                      </div>
                    )}
                    <Image
                      src={selectedConsultation.download_url}
                      alt="Imaging study"
                      className="rounded-md"
                      onLoad={() => setImageLoading(false)}
                      onError={() => setImageLoading(false)}
                      placeholder={true}
                      fallback="data:image/png;base64,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"
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
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

      <Modal
        title="Write Report"
        visible={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        width={700}
        footer={[
          <Button
            key="generate"
            onClick={handleGenerateDraftReport}
            loading={isGeneratingReport}
            icon={<SyncOutlined />}
          >
            Generate AI Report
          </Button>,
          <Button key="cancel" onClick={() => setReportModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleReportSubmit}
            loading={isLoading}
            icon={<SendOutlined />}
          >
            Submit Report
          </Button>
        ]}
      >
        <div className="mb-4">
          <Alert
            message="Write a detailed report for this imaging study"
            description="You can use the 'Generate AI Report' button to get AI assistance in writing the report."
            type="info"
            showIcon
          />
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            name="report"
            label="Report"
            rules={[{ required: true, message: 'Please enter a report or generate one with AI' }]}
          >
            <TextArea
              rows={12}
              placeholder="Enter your findings and impressions..."
              style={{ resize: 'none' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ExpertConsultations;