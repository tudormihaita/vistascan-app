import React, { useState } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Tag,
    Popconfirm,
    Space,
    message,
    Typography,
    Card, TableColumnsType,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { UserDto, UserRole, Gender } from '../../types/dtos/UserDto';
import { useGetAllUsersQuery, useUpdateUserMutation, useDeleteUserMutation } from '../../api/adminApi';

const { Title } = Typography;
const { Option } = Select;

interface UserListProps {
    title?: string;
}

const UserList: React.FC = (props: UserListProps) => {
    const title = props.title || 'Manage Users';
    const { data: users = [], isLoading, refetch } = useGetAllUsersQuery();
    const [updateUser] = useUpdateUserMutation();
    const [deleteUser] = useDeleteUserMutation();

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<UserDto | null>(null);
    const [form] = Form.useForm();

    const handleEdit = (user: UserDto) => {
        setEditingUser(user);
        form.setFieldsValue({
            ...user,
            birthdate: dayjs(user.birthdate),
        });
        setEditModalVisible(true);
    };

    const handleEditModalClose = () => {
        setEditModalVisible(false);
        setEditingUser(null);
        form.resetFields();
    };

    const handleUpdate = async (values: any) => {
        if (!editingUser) return;

        try {
            const updateData = {
                ...values,
                birthdate: values.birthdate ? values.birthdate.format('YYYY-MM-DD') : undefined,
            };

            Object.keys(updateData).forEach(key => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });

            await updateUser({
                userId: editingUser.id,
                updateData,
            }).unwrap();

            message.success('User updated successfully');
            handleEditModalClose();
            refetch();
        } catch (error) {
            message.error('Failed to update user');
        }
    };

    const handleDelete = async (userId: string) => {
        try {
            await deleteUser(userId).unwrap();
            message.success('User deleted successfully');
            refetch();
        } catch (error) {
            message.error('Failed to delete user');
        }
    };

    const getRoleColor = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN:
                return 'red';
            case UserRole.EXPERT:
                return 'blue';
            case UserRole.PATIENT:
                return 'green';
            default:
                return 'default';
        }
    };

    const columns: TableColumnsType<UserDto> = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            sorter: (a: UserDto, b: UserDto) => a.username.localeCompare(b.username),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a: UserDto, b: UserDto) => a.email.localeCompare(b.email),
        },
        {
            title: 'Full Name',
            dataIndex: 'full_name',
            key: 'full_name',
            sorter: (a: UserDto, b: UserDto) => a.full_name.localeCompare(b.full_name),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: UserRole) => (
                <Tag color={getRoleColor(role)}>{role}</Tag>
            ),
            filters: [
                { text: 'Admin', value: UserRole.ADMIN },
                { text: 'Expert', value: UserRole.EXPERT },
                { text: 'Patient', value: UserRole.PATIENT },
            ],
            onFilter: (value, record: UserDto) => record.role === value,
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
            filters: [
                { text: 'Male', value: Gender.MALE },
                { text: 'Female', value: Gender.FEMALE },
            ],
            onFilter: (value, record: UserDto) => record.gender === value,
        },
        {
            title: 'Birthdate',
            dataIndex: 'birthdate',
            key: 'birthdate',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
            sorter: (a: UserDto, b: UserDto) => dayjs(a.birthdate).unix() - dayjs(b.birthdate).unix(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record: UserDto) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this user?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    {title}
                </Title>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={isLoading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} users`,
                }}
            />

            <Modal
                title="Edit User"
                open={editModalVisible}
                onCancel={handleEditModalClose}
                onOk={() => form.submit()}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdate}
                >
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: 'Please input the username!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Please input the email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Full Name"
                        name="full_name"
                        rules={[{ required: true, message: 'Please input the full name!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Role"
                        name="role"
                        rules={[{ required: true, message: 'Please select a role!' }]}
                    >
                        <Select>
                            <Option value={UserRole.ADMIN}>Admin</Option>
                            <Option value={UserRole.EXPERT}>Expert</Option>
                            <Option value={UserRole.PATIENT}>Patient</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Gender"
                        name="gender"
                        rules={[{ required: true, message: 'Please select a gender!' }]}
                    >
                        <Select>
                            <Option value={Gender.MALE}>Male</Option>
                            <Option value={Gender.FEMALE}>Female</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Birthdate"
                        name="birthdate"
                        rules={[{ required: true, message: 'Please select the birthdate!' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="New Password (optional)"
                        name="password"
                    >
                        <Input.Password placeholder="Leave empty to keep current password" />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default UserList;