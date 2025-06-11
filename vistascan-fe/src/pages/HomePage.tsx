import React from 'react';
import {Typography, Layout, Row, Col, Button, Card, Space, Divider} from 'antd';
import {Link} from 'react-router-dom';
import {
    MedicineBoxOutlined,
    UserAddOutlined,
    LoginOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    SafetyOutlined
} from '@ant-design/icons';

const {Title, Text, Paragraph} = Typography;
const {Content} = Layout;

const HomePage: React.FC = () => {
    const features = [
        {
            icon: <MedicineBoxOutlined style={{fontSize: '24px', color: '#1890ff'}}/>,
            title: 'Expert Medical Analysis',
            description: 'Get your medical imaging studies reviewed by certified radiologists and medical experts.'
        },
        {
            icon: <ClockCircleOutlined style={{fontSize: '24px', color: '#52c41a'}}/>,
            title: 'Fast Turnaround',
            description: 'Receive comprehensive reports within 24-48 hours of submission.'
        },
        {
            icon: <SafetyOutlined style={{fontSize: '24px', color: '#faad14'}}/>,
            title: 'Secure & Confidential',
            description: 'Your medical data is protected with enterprise-grade security and encryption.'
        },
        {
            icon: <TeamOutlined style={{fontSize: '24px', color: '#722ed1'}}/>,
            title: 'Professional Network',
            description: 'Access to a network of qualified medical professionals and specialists.'
        }
    ];

    return (
        <Layout style={{
            minHeight: '100vh',
            width: '100vw',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <Content style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px 20px'
            }}>
                <div style={{textAlign: 'center', marginBottom: '48px', color: 'white'}}>
                    <Title level={1} style={{color: 'white', fontSize: '3.5rem', marginBottom: '16px'}}>
                        VistaScan
                    </Title>
                    <Title level={3} style={{color: 'rgba(255,255,255,0.9)', fontWeight: 300, marginBottom: '24px'}}>
                        Remote Medical Consultation Platform
                    </Title>
                    <Paragraph style={{
                        fontSize: '18px',
                        color: 'rgba(255,255,255,0.8)',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}>
                        Connect with medical experts remotely for professional analysis of your imaging studies.
                        Secure, fast, and reliable medical consultations from the comfort of your home.
                    </Paragraph>
                </div>

                <Row gutter={[32, 32]} style={{width: '100%', maxWidth: '800px', marginBottom: '48px'}}>
                    <Col xs={24} sm={12}>
                        <Card
                            hoverable
                            style={{
                                height: '280px',
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                            }}
                            bodyStyle={{
                                padding: '32px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                                height: '100%'
                            }}
                        >
                            <LoginOutlined style={{fontSize: '48px', color: '#1890ff', marginBottom: '24px'}}/>
                            <Title level={3} style={{marginBottom: '16px'}}>
                                Existing User
                            </Title>
                            <Paragraph style={{color: '#666', marginBottom: '24px'}}>
                                Already have an account? Sign in to access your consultations and reports.
                            </Paragraph>
                            <Link to="/login" style={{width: '100%'}}>
                                <Button
                                    type="primary"
                                    size="large"
                                    style={{
                                        width: '100%',
                                        height: '48px',
                                        borderRadius: '8px',
                                        fontSize: '16px'
                                    }}
                                >
                                    Log In
                                </Button>
                            </Link>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Card
                            hoverable
                            style={{
                                height: '280px',
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                            }}
                            styles={{
                                body: {
                                    padding: '32px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    height: '100%'
                                }
                            }}
                        >
                            <UserAddOutlined style={{fontSize: '48px', color: '#52c41a', marginBottom: '24px'}}/>
                            <Title level={3} style={{marginBottom: '16px'}}>
                                New User
                            </Title>
                            <Paragraph style={{color: '#666', marginBottom: '24px'}}>
                                Create a new account to start uploading your medical studies and get expert reviews.
                            </Paragraph>
                            <Link to="/register" style={{width: '100%'}}>
                                <Button
                                    type="primary"
                                    size="large"
                                    style={{
                                        width: '100%',
                                        height: '48px',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        backgroundColor: '#52c41a',
                                        borderColor: '#52c41a'
                                    }}
                                >
                                    Create Account
                                </Button>
                            </Link>
                        </Card>
                    </Col>
                </Row>

                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '48px 32px',
                    width: '100%',
                    maxWidth: '1000px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}>
                    <Title level={2} style={{textAlign: 'center', marginBottom: '48px'}}>
                        Why Choose VistaScan?
                    </Title>

                    <Row gutter={[32, 32]}>
                        {features.map((feature, index) => (
                            <Col xs={24} sm={12} key={index}>
                                <div style={{textAlign: 'center'}}>
                                    <div style={{marginBottom: '16px'}}>
                                        {feature.icon}
                                    </div>
                                    <Title level={4} style={{marginBottom: '12px'}}>
                                        {feature.title}
                                    </Title>
                                    <Paragraph style={{color: '#666', lineHeight: '1.6'}}>
                                        {feature.description}
                                    </Paragraph>
                                </div>
                            </Col>
                        ))}
                    </Row>

                    <Divider/>

                    <div style={{textAlign: 'center'}}>
                        <Title level={4} style={{marginBottom: '16px'}}>
                            Ready to get started?
                        </Title>
                        <Space size="large">
                            <Link to="/register">
                                <Button type="primary" size="large" icon={<UserAddOutlined/>}>
                                    Create Account
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button size="large" icon={<LoginOutlined/>}>
                                    Sign In
                                </Button>
                            </Link>
                        </Space>
                    </div>
                </div>

                <div style={{
                    marginTop: '48px',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.7)'
                }}>
                    <Text style={{color: 'inherit'}}>
                        © 2024 VistaScan. Professional medical consultation platform.
                    </Text>
                </div>
            </Content>
        </Layout>
    );
};

export default HomePage;