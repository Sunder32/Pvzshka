import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Descriptions,
  Badge,
  Popconfirm,
  Tabs,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const GET_SITE_REQUESTS = gql`
  query GetSiteRequests($status: String) {
    siteRequests(status: $status) {
      id
      siteName
      domain
      description
      category
      email
      phone
      expectedProducts
      businessType
      tags
      status
      createdAt
      userId
      user {
        id
        email
        firstName
        lastName
      }
      rejectionReason
    }
  }
`;

const APPROVE_SITE_REQUEST = gql`
  mutation ApproveSiteRequest($id: ID!) {
    approveSiteRequest(id: $id) {
      id
      status
      approvedAt
    }
  }
`;

const REJECT_SITE_REQUEST = gql`
  mutation RejectSiteRequest($id: ID!, $reason: String!) {
    rejectSiteRequest(id: $id, reason: $reason) {
      id
      status
      rejectionReason
      rejectedAt
    }
  }
`;

interface SiteRequest {
  id: string;
  siteName: string;
  domain: string;
  description: string;
  category: string;
  email: string;
  phone: string;
  expectedProducts: string;
  businessType: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  rejectionReason?: string;
}

export default function SiteRequests() {
  const [selectedRequest, setSelectedRequest] = useState<SiteRequest | null>(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isRejectVisible, setIsRejectVisible] = useState(false);
  const [rejectionForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('pending');

  const { data: pendingData, loading: pendingLoading, refetch: refetchPending } = useQuery(
    GET_SITE_REQUESTS,
    { variables: { status: 'pending' } }
  );

  const { data: approvedData, loading: approvedLoading, refetch: refetchApproved } = useQuery(
    GET_SITE_REQUESTS,
    { variables: { status: 'approved' } }
  );

  const { data: rejectedData, loading: rejectedLoading, refetch: refetchRejected } = useQuery(
    GET_SITE_REQUESTS,
    { variables: { status: 'rejected' } }
  );

  const [approveSiteRequest, { loading: approveLoading }] = useMutation(APPROVE_SITE_REQUEST);
  const [rejectSiteRequest, { loading: rejectLoading }] = useMutation(REJECT_SITE_REQUEST);

  const handleApprove = async (request: SiteRequest) => {
    try {
      await approveSiteRequest({
        variables: { id: request.id },
      });

      message.success(`Сайт "${request.siteName}" одобрен!`);
      refetchPending();
      refetchApproved();
      setIsDetailsVisible(false);
    } catch (error) {
      console.error('Error approving request:', error);
      message.error('Ошибка при одобрении заявки');
    }
  };

  const handleReject = async (values: { reason: string }) => {
    if (!selectedRequest) return;

    try {
      await rejectSiteRequest({
        variables: {
          id: selectedRequest.id,
          reason: values.reason,
        },
      });

      message.success(`Заявка на "${selectedRequest.siteName}" отклонена`);
      refetchPending();
      refetchRejected();
      setIsRejectVisible(false);
      setIsDetailsVisible(false);
      rejectionForm.resetFields();
    } catch (error) {
      console.error('Error rejecting request:', error);
      message.error('Ошибка при отклонении заявки');
    }
  };

  const showDetails = (request: SiteRequest) => {
    setSelectedRequest(request);
    setIsDetailsVisible(true);
  };

  const showRejectModal = (request: SiteRequest) => {
    setSelectedRequest(request);
    setIsRejectVisible(true);
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      electronics: 'Электроника',
      clothing: 'Одежда и обувь',
      food: 'Продукты питания',
      beauty: 'Красота и здоровье',
      home: 'Товары для дома',
      sports: 'Спорт и отдых',
      books: 'Книги',
      other: 'Другое',
    };
    return categories[category] || category;
  };

  const getBusinessTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      retail: 'Розничная торговля',
      wholesale: 'Оптовая торговля',
      manufacturer: 'Производитель',
      dropshipping: 'Дропшиппинг',
      services: 'Услуги',
    };
    return types[type] || type;
  };

  const columns = [
    {
      title: 'Название сайта',
      dataIndex: 'siteName',
      key: 'siteName',
      render: (text: string, record: SiteRequest) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.domain}.yourplatform.com
          </Text>
        </Space>
      ),
    },
    {
      title: 'Владелец',
      dataIndex: 'user',
      key: 'user',
      render: (user: SiteRequest['user']) => (
        <Space direction="vertical" size={0}>
          <Text>{user.firstName || user.email}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {user.email}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{getCategoryLabel(category)}</Tag>
      ),
    },
    {
      title: 'Тип бизнеса',
      dataIndex: 'businessType',
      key: 'businessType',
      render: (type: string) => getBusinessTypeLabel(type),
    },
    {
      title: 'Дата подачи',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'gold', icon: <ClockCircleOutlined />, text: 'На рассмотрении' },
          approved: { color: 'green', icon: <CheckCircleOutlined />, text: 'Одобрено' },
          rejected: { color: 'red', icon: <CloseCircleOutlined />, text: 'Отклонено' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: SiteRequest) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => showDetails(record)}
            size="small"
          >
            Подробнее
          </Button>
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="Одобрить заявку?"
                description={`Создать сайт "${record.siteName}"?`}
                onConfirm={() => handleApprove(record)}
                okText="Одобрить"
                cancelText="Отмена"
              >
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  loading={approveLoading}
                >
                  Одобрить
                </Button>
              </Popconfirm>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => showRejectModal(record)}
                size="small"
              >
                Отклонить
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const pendingRequests = pendingData?.siteRequests || [];
  const approvedRequests = approvedData?.siteRequests || [];
  const rejectedRequests = rejectedData?.siteRequests || [];

  return (
    <Content style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2}>
            <ShopOutlined /> Заявки на создание сайтов
          </Title>
          <Text type="secondary">
            Управление заявками на создание новых интернет-магазинов
          </Text>
        </div>

        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Ожидают рассмотрения"
                value={pendingRequests.length}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Одобрено"
                value={approvedRequests.length}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Отклонено"
                value={rejectedRequests.length}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab={`Ожидают (${pendingRequests.length})`} key="pending">
              <Table
                dataSource={pendingRequests}
                columns={columns}
                rowKey="id"
                loading={pendingLoading}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
            <TabPane tab={`Одобренные (${approvedRequests.length})`} key="approved">
              <Table
                dataSource={approvedRequests}
                columns={columns}
                rowKey="id"
                loading={approvedLoading}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
            <TabPane tab={`Отклоненные (${rejectedRequests.length})`} key="rejected">
              <Table
                dataSource={rejectedRequests}
                columns={columns}
                rowKey="id"
                loading={rejectedLoading}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
          </Tabs>
        </Card>
      </Space>

      {/* Details Modal */}
      <Modal
        title={
          <Space>
            <ShopOutlined />
            Детали заявки
          </Space>
        }
        open={isDetailsVisible}
        onCancel={() => setIsDetailsVisible(false)}
        width={800}
        footer={
          selectedRequest?.status === 'pending' ? (
            <Space>
              <Button onClick={() => setIsDetailsVisible(false)}>
                Закрыть
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setIsDetailsVisible(false);
                  if (selectedRequest) {
                    showRejectModal(selectedRequest);
                  }
                }}
              >
                Отклонить
              </Button>
              <Popconfirm
                title="Одобрить заявку?"
                description={`Создать сайт "${selectedRequest?.siteName}"?`}
                onConfirm={() => selectedRequest && handleApprove(selectedRequest)}
                okText="Одобрить"
                cancelText="Отмена"
              >
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={approveLoading}
                >
                  Одобрить
                </Button>
              </Popconfirm>
            </Space>
          ) : (
            <Button onClick={() => setIsDetailsVisible(false)}>
              Закрыть
            </Button>
          )
        }
      >
        {selectedRequest && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Название сайта" span={2}>
                <Text strong style={{ fontSize: '16px' }}>
                  {selectedRequest.siteName}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Домен" span={2}>
                <Text code>{selectedRequest.domain}.yourplatform.com</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Категория">
                <Tag color="blue">{getCategoryLabel(selectedRequest.category)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Тип бизнеса">
                {getBusinessTypeLabel(selectedRequest.businessType)}
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>
                <Space>
                  <MailOutlined />
                  {selectedRequest.email}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Телефон" span={2}>
                <Space>
                  <PhoneOutlined />
                  {selectedRequest.phone}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Ожидаемое кол-во товаров" span={2}>
                {selectedRequest.expectedProducts}
              </Descriptions.Item>
              <Descriptions.Item label="Теги" span={2}>
                <Space wrap>
                  {selectedRequest.tags.map((tag) => (
                    <Tag key={tag} color="purple">
                      {tag}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Дата подачи" span={2}>
                {new Date(selectedRequest.createdAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
              <Descriptions.Item label="Владелец" span={2}>
                <Space>
                  <UserOutlined />
                  {selectedRequest.user.firstName || selectedRequest.user.email}
                  <Text type="secondary">({selectedRequest.user.email})</Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <Card title="Описание бизнеса" size="small">
              <Paragraph>{selectedRequest.description}</Paragraph>
            </Card>

            {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
              <Card title="Причина отклонения" size="small">
                <Paragraph type="danger">{selectedRequest.rejectionReason}</Paragraph>
              </Card>
            )}
          </Space>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Отклонить заявку"
        open={isRejectVisible}
        onCancel={() => {
          setIsRejectVisible(false);
          rejectionForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={rejectionForm}
          onFinish={handleReject}
          layout="vertical"
        >
          <Form.Item
            label="Причина отклонения"
            name="reason"
            rules={[
              { required: true, message: 'Укажите причину отклонения' },
              { min: 10, message: 'Минимум 10 символов' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Укажите детальную причину отклонения заявки..."
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                onClick={() => {
                  setIsRejectVisible(false);
                  rejectionForm.resetFields();
                }}
              >
                Отмена
              </Button>
              <Button
                type="primary"
                danger
                htmlType="submit"
                loading={rejectLoading}
              >
                Отклонить заявку
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
}
