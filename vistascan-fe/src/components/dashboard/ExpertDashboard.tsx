import { Alert, Card, Col, Row, Statistic, Tabs, Typography } from 'antd';
import {
    AreaChartOutlined,
    FileDoneOutlined,
    MedicineBoxOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    useGetConsultationsByUserIdQuery,
    useGetConsultationsByStatusQuery
} from '../../api/consultationApi';
import ConsultationList from "../consultation/ConsultationList";
import ConsultationManager from "../consultation/ConsultationManager";
import {ConsultationStatus} from "../../types/dtos/ConsultationDto.ts";
import {UserRole} from "../../types/dtos/UserDto.ts";

const { Title } = Typography;

interface ExpertDashboardProps {
    userId: string;
}

const ExpertDashboard = (props: ExpertDashboardProps) => {
    const userId = props.userId;
    const {
        data: pendingConsultations = [],
        isLoading: isLoadingPending,
        refetch: refetchPending
    } = useGetConsultationsByStatusQuery(ConsultationStatus.PENDING);

    const {
        data: userConsultations = [],
        isLoading: isLoadingUser,
        refetch: refetchUser
    } = useGetConsultationsByUserIdQuery(userId!, {
        skip: !userId
    });

    const myInReviewConsultations = userConsultations.filter(c =>
        c.status === ConsultationStatus.IN_REVIEW && c.expert_id === userId
    );
    const myCompletedConsultations = userConsultations.filter(c =>
        c.status === ConsultationStatus.COMPLETED && c.expert_id === userId
    );
    const totalAssignedConsultations = userConsultations.filter(c => c.expert_id === userId);

    const handleRefetch = () => {
        refetchPending();
        refetchUser();
    };

    const tabItems = [
        {
            key: 'pending',
            label: (
                <span>
                    <AreaChartOutlined />
                    Available for Assignment ({pendingConsultations.length})
                </span>
            ),
            children: (
                <ConsultationManager
                    consultations={pendingConsultations}
                    isLoading={isLoadingPending}
                    userRole={UserRole.EXPERT}
                    title="Pending Consultations"
                    onRefetch={handleRefetch}
                />
            ),
        },
        {
            key: 'inReview',
            label: (
                <span>
                    <MedicineBoxOutlined />
                    In Review ({myInReviewConsultations.length})
                </span>
            ),
            children: (
                <ConsultationManager
                    consultations={myInReviewConsultations}
                    isLoading={isLoadingUser}
                    userRole={UserRole.EXPERT}
                    title="Consultations awaiting Review"
                    onRefetch={handleRefetch}
                />
            ),
        },
        {
            key: 'completed',
            label: (
                <span>
                    <FileDoneOutlined />
                    Completed ({myCompletedConsultations.length})
                </span>
            ),
            children: (
                <ConsultationList
                    consultations={myCompletedConsultations}
                    isLoading={isLoadingUser}
                    userRole={UserRole.EXPERT}
                    title="Completed Cases"
                    showPagination={true}
                    pageSize={10}
                    emptyText="You haven't completed any consultations yet."
                />
            ),
        },
        {
            key: 'myAll',
            label: (
                <span>
                    <UserOutlined />
                    All Cases ({totalAssignedConsultations.length})
                </span>
            ),
            children: (
                <ConsultationList
                    consultations={totalAssignedConsultations}
                    isLoading={isLoadingUser}
                    userRole={UserRole.EXPERT}
                    title="All Managed Consultations"
                    showPagination={true}
                    pageSize={10}
                    emptyText="You haven't been assigned any consultations yet."
                />
            ),
        },
    ];

    return (
        <>
            <Title level={3} style={{ marginBottom: '24px' }}>Expert Dashboard</Title>

            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={6} style={{ marginBottom: '16px' }}>
                    <Card>
                        <Statistic
                            title="Available to Assign"
                            value={pendingConsultations.length}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<AreaChartOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6} style={{ marginBottom: '16px' }}>
                    <Card>
                        <Statistic
                            title="In Review"
                            value={myInReviewConsultations.length}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<MedicineBoxOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6} style={{ marginBottom: '16px' }}>
                    <Card>
                        <Statistic
                            title="Completed"
                            value={myCompletedConsultations.length}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<FileDoneOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6} style={{ marginBottom: '16px' }}>
                    <Card>
                        <Statistic
                            title="Total Assigned to me"
                            value={totalAssignedConsultations.length}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Alert
                message="Expert Review Portal"
                description="Review pending consultations, assign cases to yourself, and generate diagnostic reports for patients. You can view all available consultations and manage your assigned cases."
                type="info"
                showIcon
                style={{ marginBottom: '24px' }}
            />

            <Tabs
                defaultActiveKey="pending"
                style={{ width: '100%' }}
                items={tabItems}
                size="large"
            />
        </>
    );
};

export default ExpertDashboard;