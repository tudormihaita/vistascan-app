import React, {useState} from 'react';
import {Alert, Card, message, Modal, Upload, Button} from "antd";
import {InboxOutlined, CloudUploadOutlined} from '@ant-design/icons';
import {LocalStorageKeys} from "../../types/enums/LocalStorageKeys.ts";
import {usePatientConsultations} from "../../hooks/usePatientConsultations.ts";

const {Dragger} = Upload;

const ImageUpload: React.FC = () => {
    const userId = localStorage.getItem(LocalStorageKeys.USER_ID) || '';

    const [fileList, setFileList] = useState<any[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewVisible, setPreviewVisible] = useState<boolean>(false);

    const { submitConsultation, isLoading, error } = usePatientConsultations(userId);


    const uploadProps = {
        name: 'file',
        multiple: false,
        fileList,
        beforeUpload: (file: File) => {
            if (!file.type.match('image/*')) {
                message.error('Please select an image file');
                return Upload.LIST_IGNORE;
            }

            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                message.error('Image must be smaller than 10MB');
                return Upload.LIST_IGNORE;
            }

            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);

            setFileList([file]);
            return false;
        },
        onRemove: () => {
            setFileList([]);
            setPreviewUrl(null);
            return true;
        }
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
            const result = await submitConsultation(fileList[0]);
            if (result) {
                message.success('Consultation created successfully!');
                setFileList([]);
                setPreviewUrl(null);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            message.error('Failed to create consultation');
        }
    };


    return (
        <Card title="Upload Imaging Study" className="mb-6">
            {error && (
                <Alert
                    message="Upload Error"
                    description={(error as any)?.data?.message || 'Failed to upload file'}
                    type="error"
                    className="mb-4"
                    showIcon
                />
            )}

            <Dragger {...uploadProps} className="mb-4">
                <p className="ant-upload-drag-icon">
                    <InboxOutlined/>
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                    Support for PNG or JPG files up to 10MB
                </p>
            </Dragger>

            {fileList.length > 0 && (
                <div className="flex justify-between items-center mt-4">
                    <Button type="link" onClick={handlePreview} disabled={!previewUrl}>
                        Preview Image
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleUpload}
                        loading={isLoading}
                        icon={<CloudUploadOutlined/>}
                    >
                        Upload
                    </Button>
                </div>
            )}

            <Modal
                open={previewVisible}
                title={fileList[0]?.name}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
            >
                {previewUrl && (
                    <img alt="preview" style={{width: '100%'}} src={previewUrl}/>
                )}
            </Modal>
        </Card>
    );
};

export default ImageUpload;