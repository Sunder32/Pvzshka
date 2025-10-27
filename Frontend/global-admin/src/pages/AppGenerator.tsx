import { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Steps,
  message,
  Space,
  Checkbox,
  ColorPicker,
  Upload,
  Typography,
} from 'antd'
import { UploadOutlined, RocketOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input

export default function AppGenerator() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const steps = [
    {
      title: 'Основная информация',
      description: 'Название и описание приложения',
    },
    {
      title: 'Брендинг',
      description: 'Цвета, логотипы, шрифты',
    },
    {
      title: 'Функциональность',
      description: 'Выбор модулей и функций',
    },
    {
      title: 'Генерация',
      description: 'Сборка и развертывание',
    },
  ]

  const handleNext = async () => {
    try {
      await form.validateFields()
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    } catch (error) {
      message.error('Заполните все обязательные поля')
    }
  }

  const handlePrev = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      // Симуляция генерации приложения
      await new Promise((resolve) => setTimeout(resolve, 3000))
      message.success('Приложение успешно сгенерировано!')
      form.resetFields()
      setCurrentStep(0)
    } catch (error) {
      message.error('Ошибка при генерации приложения')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <Form.Item
              name="appName"
              label="Название приложения"
              rules={[{ required: true, message: 'Введите название' }]}
            >
              <Input placeholder="Мой Маркетплейс" />
            </Form.Item>

            <Form.Item
              name="packageName"
              label="Package Name"
              rules={[{ required: true, message: 'Введите package name' }]}
            >
              <Input placeholder="com.example.marketplace" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Описание"
              rules={[{ required: true, message: 'Введите описание' }]}
            >
              <TextArea rows={4} placeholder="Описание вашего приложения" />
            </Form.Item>

            <Form.Item
              name="tenant"
              label="Тенант"
              rules={[{ required: true, message: 'Выберите тенанта' }]}
            >
              <Select placeholder="Выберите тенанта">
                <Select.Option value="1">Магазин электроники</Select.Option>
                <Select.Option value="2">Книжный магазин</Select.Option>
                <Select.Option value="3">Одежда и обувь</Select.Option>
              </Select>
            </Form.Item>
          </div>
        )

      case 1:
        return (
          <div>
            <Form.Item name="primaryColor" label="Основной цвет">
              <ColorPicker showText />
            </Form.Item>

            <Form.Item name="secondaryColor" label="Дополнительный цвет">
              <ColorPicker showText />
            </Form.Item>

            <Form.Item name="logo" label="Логотип">
              <Upload>
                <Button icon={<UploadOutlined />}>Загрузить логотип</Button>
              </Upload>
            </Form.Item>

            <Form.Item name="splashScreen" label="Splash Screen">
              <Upload>
                <Button icon={<UploadOutlined />}>Загрузить изображение</Button>
              </Upload>
            </Form.Item>

            <Form.Item name="font" label="Шрифт">
              <Select placeholder="Выберите шрифт">
                <Select.Option value="roboto">Roboto</Select.Option>
                <Select.Option value="opensans">Open Sans</Select.Option>
                <Select.Option value="montserrat">Montserrat</Select.Option>
              </Select>
            </Form.Item>
          </div>
        )

      case 2:
        return (
          <div>
            <Title level={5}>Выберите модули для приложения</Title>

            <Form.Item name="modules" valuePropName="checked">
              <Checkbox.Group>
                <Space direction="vertical">
                  <Checkbox value="catalog" defaultChecked>
                    Каталог товаров
                  </Checkbox>
                  <Checkbox value="cart" defaultChecked>
                    Корзина
                  </Checkbox>
                  <Checkbox value="orders" defaultChecked>
                    Заказы
                  </Checkbox>
                  <Checkbox value="pvz" defaultChecked>
                    Карта ПВЗ
                  </Checkbox>
                  <Checkbox value="profile">Профиль пользователя</Checkbox>
                  <Checkbox value="favorites">Избранное</Checkbox>
                  <Checkbox value="reviews">Отзывы</Checkbox>
                  <Checkbox value="push">Push-уведомления</Checkbox>
                  <Checkbox value="biometric">Биометрия</Checkbox>
                  <Checkbox value="qr">QR-сканер</Checkbox>
                </Space>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item name="platforms" label="Платформы" initialValue={['android']}>
              <Checkbox.Group>
                <Space>
                  <Checkbox value="android">Android</Checkbox>
                  <Checkbox value="ios">iOS</Checkbox>
                </Space>
              </Checkbox.Group>
            </Form.Item>
          </div>
        )

      case 3:
        return (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <RocketOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 24 }} />
            <Title level={3}>Готово к генерации!</Title>
            <Text type="secondary">
              Приложение будет сгенерировано с выбранными параметрами
            </Text>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Генератор приложений</h1>

      <Card>
        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        <Form form={form} layout="vertical">
          {renderStepContent()}
        </Form>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
          <Button disabled={currentStep === 0} onClick={handlePrev}>
            Назад
          </Button>

          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={handleNext}>
              Далее
            </Button>
          )}

          {currentStep === steps.length - 1 && (
            <Button type="primary" loading={loading} onClick={handleGenerate}>
              Сгенерировать приложение
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
