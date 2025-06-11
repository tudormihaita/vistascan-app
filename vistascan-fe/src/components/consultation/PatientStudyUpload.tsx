import React, {useState} from 'react';
import {Card, Upload, Typography, message, Modal, Button, Space} from 'antd';
import {InboxOutlined, CloudUploadOutlined, EyeOutlined, UploadOutlined} from '@ant-design/icons';
import {useSubmitConsultationMutation} from "../../api/consultationApi.ts";
import '../../styles/PatientStudyUpload.css';

const {Text} = Typography;
const {Dragger} = Upload;

const PatientStudyUpload: React.FC = () => {
    const [submitConsultation, {isLoading}] = useSubmitConsultationMutation();

    const [fileList, setFileList] = useState<any[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewVisible, setPreviewVisible] = useState<boolean>(false);

    const isValidFileType = (file: File): boolean => {
        const validMimeTypes = [
            'image/jpeg',
            'image/png',
        ];

        const fileName = file.name.toLowerCase();
        const validExtensions = ['.jpg', '.jpeg', '.png'];
        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

        return validMimeTypes.includes(file.type) || hasValidExtension;
    };

    const uploadProps = {
        name: 'file',
        multiple: false,
        accept: '.jpg,.jpeg,.png',
        fileList,
        beforeUpload: (file: File) => {
            if (!isValidFileType(file)) {
                message.error('Please upload a valid image file (JPEG or PNG format only)');
                return Upload.LIST_IGNORE;
            }

            const isLt50M = file.size / 1024 / 1024 < 50;
            if (!isLt50M) {
                message.error('File must be smaller than 50MB!');
                return Upload.LIST_IGNORE;
            }

            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);

            setFileList([file]);
            return false; // Prevent automatic upload
        },
        onRemove: () => {
            setFileList([]);
            setPreviewUrl(null);
            return true;
        },
    };

    const handlePreview = () => {
        setPreviewVisible(true);
    };

    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.warning('Please select a file to upload');
            return;
        }

        try {
            const result = await submitConsultation(fileList[0]).unwrap();
            if (result) {
                message.success('Medical study uploaded successfully!');
                setFileList([]);
                setPreviewUrl(null);
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            message.error(error?.data?.detail || 'Failed to upload medical study. Please try again.');
        }
    };

    return (
        <Card
            style={{height: '100%'}}
            className="patient-study-upload-card"
            title={
                <Space>
                    <UploadOutlined/>
                    <span>Upload New Medical Study</span>
                </Space>
            }
        >
            <Dragger {...uploadProps} className="patient-study-dragger">
                <div>
                    <InboxOutlined className="patient-study-upload-icon"/>
                    <div className="patient-study-upload-text">
                        Click or drag medical images to upload
                    </div>
                    <Text className="patient-study-upload-hint">
                        Supports JPEG and PNG files only (max 50MB)
                    </Text>
                </div>
            </Dragger>

            {fileList.length > 0 && (
                <div className="patient-study-file-info">
                    <div className="patient-study-file-details">
                        <div className="file-info">
                            <div className="file-name">
                                Selected file: {fileList[0]?.name}
                            </div>
                            <div className="file-size">
                                Size: {(fileList[0]?.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                        </div>
                        <div className="patient-study-actions">
                            <Button
                                type="text"
                                icon={<EyeOutlined/>}
                                onClick={handlePreview}
                                disabled={!previewUrl}
                            >
                                Preview
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleUpload}
                                loading={isLoading}
                                icon={<CloudUploadOutlined/>}
                                size="middle"
                            >
                                {isLoading ? 'Uploading...' : 'Upload Study'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <Modal
                open={previewVisible}
                title={fileList[0]?.name}
                footer={[
                    <Button key="close" onClick={() => setPreviewVisible(false)}>
                        Close
                    </Button>
                ]}
                onCancel={() => setPreviewVisible(false)}
                width={800}
                centered
                className="patient-study-preview-modal"
            >
                {previewUrl && (
                    <img
                        alt="preview"
                        className="patient-study-preview-image"
                        src={previewUrl}
                    />
                )}
            </Modal>
        </Card>
    );
};

export default PatientStudyUpload;