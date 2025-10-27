import { Card, Form, Input, Switch, Button, message, Divider, Select } from 'antd'
import { SaveOutlined } from '@ant-design/icons'

const { TextArea } = Input

export default function Settings() {
  const [form] = Form.useForm()

  const handleSave = async (values: any) => {
    try {
      console.log('Settings saved:', values)
      message.success('Настройки сохранены')
    } catch (error) {
      message.error('Ошибка при сохранении настроек')
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Настройки платформы</h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          platformName: 'SaaS Marketplace Platform',
          supportEmail: 'support@platform.com',
          allowRegistration: true,
          requireEmailVerification: true,
          maintenanceMode: false,
          defaultLanguage: 'ru',
          timezone: 'Europe/Moscow',
        }}
      >
        <Card title="Общие настройки" style={{ marginBottom: 16 }}>
          <Form.Item
            name="platformName"
            label="Название платформы"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="supportEmail"
            label="Email поддержки"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="platformDescription" label="Описание платформы">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="defaultLanguage" label="Язык по умолчанию">
            <Select>
              <Select.Option value="ru">Русский</Select.Option>
              <Select.Option value="en">English</Select.Option>
              <Select.Option value="kz">Қазақша</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="timezone" label="Часовой пояс">
            <Select>
              <Select.Option value="Europe/Moscow">Europe/Moscow (МСК)</Select.Option>
              <Select.Option value="Asia/Almaty">Asia/Almaty</Select.Option>
              <Select.Option value="Europe/Minsk">Europe/Minsk</Select.Option>
            </Select>
          </Form.Item>
        </Card>

        <Card title="Регистрация и аутентификация" style={{ marginBottom: 16 }}>
          <Form.Item
            name="allowRegistration"
            label="Разрешить регистрацию новых тенантов"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="requireEmailVerification"
            label="Требовать подтверждение email"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="enableOAuth"
            label="Включить OAuth авторизацию"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Card>

        <Card title="Биллинг" style={{ marginBottom: 16 }}>
          <Form.Item name="trialPeriodDays" label="Пробный период (дней)">
            <Input type="number" />
          </Form.Item>

          <Form.Item name="defaultTier" label="Тариф по умолчанию">
            <Select>
              <Select.Option value="basic">Basic</Select.Option>
              <Select.Option value="standard">Standard</Select.Option>
              <Select.Option value="premium">Premium</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="autoSuspendOnPaymentFail"
            label="Автоматически приостанавливать при неоплате"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Card>

        <Card title="Техническое обслуживание" style={{ marginBottom: 16 }}>
          <Form.Item
            name="maintenanceMode"
            label="Режим обслуживания"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item name="maintenanceMessage" label="Сообщение об обслуживании">
            <TextArea rows={3} placeholder="Платформа временно недоступна" />
          </Form.Item>
        </Card>

        <Card title="Уведомления" style={{ marginBottom: 16 }}>
          <Form.Item
            name="enableEmailNotifications"
            label="Email уведомления"
            valuePropName="checked"
          >
            <Switch defaultChecked />
          </Form.Item>

          <Form.Item
            name="enableSMSNotifications"
            label="SMS уведомления"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="enablePushNotifications"
            label="Push уведомления"
            valuePropName="checked"
          >
            <Switch defaultChecked />
          </Form.Item>
        </Card>

        <Divider />

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
            Сохранить настройки
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
