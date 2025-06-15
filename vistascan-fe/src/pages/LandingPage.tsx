import {Typography, Layout, Row, Col, Button, Card} from 'antd';
import {Link} from 'react-router-dom';
import {
    MedicineBoxOutlined,
    UserAddOutlined,
    LoginOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    SafetyOutlined
} from '@ant-design/icons';
import '../styles/langing-page.css';

const {Title, Paragraph} = Typography;
const {Content} = Layout;

const LandingPage = () => {
     const features = [
        {
            icon: <SafetyOutlined className="feature-icon feature-icon-blue"/>,
            title: 'Upload Your Imaging Studies',
            description: 'Upload X-rays or CT scans  directly through the web platform. Supported formats include PNG and JPEG files.'
        },
        {
            icon: <TeamOutlined className="feature-icon feature-icon-green"/>,
            title: 'Specialist Review',
            description: 'Expert radiologists review your submitted studies and provide detailed diagnostic reports with their professional assessment.'
        },
        {
            icon: <MedicineBoxOutlined className="feature-icon feature-icon-orange"/>,
            title: 'AI-Assisted Analysis',
            description: 'Our integrated AI assistant model generates preliminary reports to support radiologists in their diagnostic process and improve accuracy.'
        },
        {
            icon: <ClockCircleOutlined className="feature-icon feature-icon-purple"/>,
            title: 'Access Your Consultation History',
            description: 'View detailed diagnostic reports through your personal dashboard and track the status of all your submitted consultations.'
        }
    ];

    return (
        <Layout className="landing-layout">
            <Content className="landing-content">
                <div className="hero-section">
                    <Title level={1} className="hero-title">
                        Welcome to VistaScan
                    </Title>
                    <Title level={3} className="hero-subtitle">
                        Remote Radiology Consultation Platform
                    </Title>
                    <Paragraph className="hero-description">
                        Connect with medical experts remotely for professional analysis of your imaging studies.
                        Secure, fast, and reliable diagnostic consultations without the burden of scheduled appointments or emergency room visits.
                    </Paragraph>
                </div>

                <Row gutter={[32, 32]} className="auth-cards-row">
                    <Col xs={24} sm={12}>
                        <Card
                            hoverable
                            className="auth-card"
                        >
                            <LoginOutlined className="auth-icon auth-icon-blue"/>
                            <Title level={3} className="auth-card-title">
                                Existing User
                            </Title>
                            <Paragraph className="auth-card-description">
                                Already have an account? Sign in to access your consultations and reports.
                            </Paragraph>
                            <Link to="/login" className="auth-button-link">
                                <Button
                                    type="primary"
                                    size="large"
                                    className="auth-button"
                                >
                                    Log In
                                </Button>
                            </Link>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Card
                            hoverable
                            className="auth-card"
                        >
                            <UserAddOutlined className="auth-icon auth-icon-green"/>
                            <Title level={3} className="auth-card-title">
                                New User
                            </Title>
                            <Paragraph className="auth-card-description">
                                Create a new account to start uploading your medical studies and get expert reviews.
                            </Paragraph>
                            <Link to="/register" className="auth-button-link">
                                <Button
                                    type="primary"
                                    size="large"
                                    className="auth-button auth-button-green"
                                >
                                    Create Account
                                </Button>
                            </Link>
                        </Card>
                    </Col>
                </Row>

                <div className="features-section">
                    <Title level={2} className="features-title">
                        Platform Features
                    </Title>

                    <Row gutter={[32, 32]}>
                        {features.map((feature, index) => (
                            <Col xs={24} sm={12} key={index}>
                                <div className="feature-item">
                                    <div className="feature-icon-wrapper">
                                        {feature.icon}
                                    </div>
                                    <Title level={4} className="feature-title">
                                        {feature.title}
                                    </Title>
                                    <Paragraph className="feature-description">
                                        {feature.description}
                                    </Paragraph>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Content>
        </Layout>
    );
};

export default LandingPage;