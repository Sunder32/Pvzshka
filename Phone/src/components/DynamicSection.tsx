import React from 'react'
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

interface DynamicSectionProps {
  type: string
  props: any
}

export const DynamicSection: React.FC<DynamicSectionProps> = ({ type, props }) => {
  switch (type) {
    case 'banner':
      return <BannerComponent {...props} />
    case 'carousel':
      return <CarouselComponent {...props} />
    case 'categories':
      return <CategoriesComponent {...props} />
    default:
      return null
  }
}

const BannerComponent: React.FC<any> = ({ image, title, subtitle }) => (
  <View style={styles.banner}>
    <View style={styles.bannerContent}>
      <Text style={styles.bannerTitle}>{title}</Text>
      <Text style={styles.bannerSubtitle}>{subtitle}</Text>
    </View>
  </View>
)

const CarouselComponent: React.FC<any> = ({ title, items }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <FlatList
      horizontal
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.carouselItem}
          onPress={() => router.push(`/product/${item.id}`)}
        >
          <View style={styles.carouselImage}>
            <Ionicons name="image-outline" size={48} color="#ccc" />
          </View>
          <Text style={styles.carouselName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.carouselPrice}>₽{item.price.toLocaleString()}</Text>
        </TouchableOpacity>
      )}
      showsHorizontalScrollIndicator={false}
    />
  </View>
)

const CategoriesComponent: React.FC<any> = ({ title, categories }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.categoriesGrid}>
      {categories.map((category: any) => (
        <TouchableOpacity
          key={category.id}
          style={styles.categoryCard}
          onPress={() => router.push(`/catalog?category=${category.id}`)}
        >
          <View style={styles.categoryIcon}>
            <Ionicons name={category.icon as any} size={32} color="#2563eb" />
          </View>
          <Text style={styles.categoryName}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
)

const styles = StyleSheet.create({
  banner: {
    height: 200,
    backgroundColor: '#2563eb',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 16,
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  bannerSubtitle: {
    fontSize: 18,
    color: '#dbeafe',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  carouselItem: {
    width: 150,
    marginLeft: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  carouselImage: {
    height: 120,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  carouselName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    height: 40,
  },
  carouselPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#dbeafe',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
})
