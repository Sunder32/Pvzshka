import { View, ScrollView, StyleSheet, Text } from 'react-native'
import { DynamicSection } from '@/components/DynamicSection'

export default function HomeScreen() {
  const sections = [
    {
      type: 'banner',
      props: {
        image: 'https://example.com/banner.jpg',
        title: 'Большая распродажа!',
        subtitle: 'Скидки до 50%',
      },
    },
    {
      type: 'carousel',
      props: {
        title: 'Популярные товары',
        items: [
          { id: '1', name: 'iPhone 15 Pro', price: 99990, image: '' },
          { id: '2', name: 'MacBook Pro', price: 249990, image: '' },
          { id: '3', name: 'AirPods Pro 2', price: 24990, image: '' },
        ],
      },
    },
    {
      type: 'categories',
      props: {
        title: 'Категории',
        categories: [
          { id: '1', name: 'Смартфоны', icon: 'phone-portrait' },
          { id: '2', name: 'Ноутбуки', icon: 'laptop' },
          { id: '3', name: 'Планшеты', icon: 'tablet-portrait' },
          { id: '4', name: 'Аксессуары', icon: 'headset' },
        ],
      },
    },
  ]

  return (
    <ScrollView style={styles.container}>
      {sections.map((section, index) => (
        <DynamicSection key={index} type={section.type} props={section.props} />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
})
