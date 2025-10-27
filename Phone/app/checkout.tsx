import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useCartStore } from '@/store/cart'

export default function CheckoutScreen() {
  const { items, total, clear } = useCartStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [deliveryType, setDeliveryType] = useState<'pvz' | 'courier'>('pvz')
  const [pvzAddress, setPvzAddress] = useState('')
  const [courierAddress, setCourierAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online')

  const deliveryCost = deliveryType === 'courier' ? 300 : 0
  const finalTotal = total + deliveryCost

  const handleSubmit = () => {
    if (!name || !email || !phone) {
      Alert.alert('Ошибка', 'Заполните контактные данные')
      return
    }

    if (deliveryType === 'pvz' && !pvzAddress) {
      Alert.alert('Ошибка', 'Выберите пункт выдачи')
      return
    }

    if (deliveryType === 'courier' && !courierAddress) {
      Alert.alert('Ошибка', 'Укажите адрес доставки')
      return
    }

    Alert.alert(
      'Заказ оформлен',
      `Ваш заказ успешно оформлен! Сумма: ₽${finalTotal.toLocaleString()}`,
      [
        {
          text: 'OK',
          onPress: () => {
            clear()
            router.replace('/orders')
          },
        },
      ]
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Контактные данные</Text>
        <TextInput
          style={styles.input}
          placeholder="Имя"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Телефон"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Способ доставки</Text>
        <TouchableOpacity
          style={[
            styles.option,
            deliveryType === 'pvz' && styles.optionActive,
          ]}
          onPress={() => setDeliveryType('pvz')}
        >
          <Ionicons
            name={deliveryType === 'pvz' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color="#2563eb"
          />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Пункт выдачи</Text>
            <Text style={styles.optionSubtitle}>Бесплатно</Text>
          </View>
        </TouchableOpacity>

        {deliveryType === 'pvz' && (
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => Alert.alert('Карта', 'Открыть карту с ПВЗ')}
          >
            <Ionicons name="location" size={20} color="#2563eb" />
            <Text style={styles.selectButtonText}>
              {pvzAddress || 'Выбрать пункт выдачи'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.option,
            deliveryType === 'courier' && styles.optionActive,
          ]}
          onPress={() => setDeliveryType('courier')}
        >
          <Ionicons
            name={deliveryType === 'courier' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color="#2563eb"
          />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Курьером</Text>
            <Text style={styles.optionSubtitle}>₽300</Text>
          </View>
        </TouchableOpacity>

        {deliveryType === 'courier' && (
          <TextInput
            style={styles.input}
            placeholder="Адрес доставки"
            value={courierAddress}
            onChangeText={setCourierAddress}
            multiline
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Способ оплаты</Text>
        <TouchableOpacity
          style={[
            styles.option,
            paymentMethod === 'online' && styles.optionActive,
          ]}
          onPress={() => setPaymentMethod('online')}
        >
          <Ionicons
            name={paymentMethod === 'online' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color="#2563eb"
          />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Онлайн</Text>
            <Text style={styles.optionSubtitle}>Картой на сайте</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            paymentMethod === 'cash' && styles.optionActive,
          ]}
          onPress={() => setPaymentMethod('cash')}
        >
          <Ionicons
            name={paymentMethod === 'cash' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color="#2563eb"
          />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>При получении</Text>
            <Text style={styles.optionSubtitle}>Наличными или картой</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Товары ({items.length}):</Text>
          <Text style={styles.summaryValue}>₽{total.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Доставка:</Text>
          <Text style={styles.summaryValue}>
            {deliveryCost === 0 ? 'Бесплатно' : `₽${deliveryCost}`}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.totalLabel}>Итого:</Text>
          <Text style={styles.totalValue}>₽{finalTotal.toLocaleString()}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Оформить заказ</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
  },
  optionActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  optionContent: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  selectButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  summary: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryTotal: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
