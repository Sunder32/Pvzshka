import { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Order {
  id: string
  date: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: number
}

export default function OrdersScreen() {
  const [orders] = useState<Order[]>([
    {
      id: '1',
      date: '2024-01-15',
      status: 'delivered',
      total: 99990,
      items: 1,
    },
    {
      id: '2',
      date: '2024-01-20',
      status: 'shipped',
      total: 24990,
      items: 1,
    },
    {
      id: '3',
      date: '2024-01-25',
      status: 'processing',
      total: 249990,
      items: 1,
    },
  ])

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#f59e0b'
      case 'processing':
        return '#3b82f6'
      case 'shipped':
        return '#8b5cf6'
      case 'delivered':
        return '#10b981'
      case 'cancelled':
        return '#ef4444'
    }
  }

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Ожидает'
      case 'processing':
        return 'Обрабатывается'
      case 'shipped':
        return 'Отправлен'
      case 'delivered':
        return 'Доставлен'
      case 'cancelled':
        return 'Отменен'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'time-outline'
      case 'processing':
        return 'refresh-outline'
      case 'shipped':
        return 'airplane-outline'
      case 'delivered':
        return 'checkmark-circle-outline'
      case 'cancelled':
        return 'close-circle-outline'
    }
  }

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Заказ #{item.id}</Text>
        <Text style={styles.orderDate}>
          {new Date(item.date).toLocaleDateString('ru-RU')}
        </Text>
      </View>
      <View style={styles.orderBody}>
        <View style={styles.statusContainer}>
          <Ionicons
            name={getStatusIcon(item.status) as any}
            size={20}
            color={getStatusColor(item.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
        <Text style={styles.orderItems}>{item.items} товар(ов)</Text>
      </View>
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>₽{item.total.toLocaleString()}</Text>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>Подробнее</Text>
          <Ionicons name="chevron-forward" size={16} color="#2563eb" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Нет заказов</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#9ca3af',
    marginTop: 16,
  },
  list: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderItems: {
    fontSize: 14,
    color: '#6b7280',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsButtonText: {
    color: '#2563eb',
    fontWeight: '600',
  },
})
