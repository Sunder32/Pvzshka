import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types'

interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  brands?: string[]
  minRating?: number
  search?: string
}

interface ProductStore {
  products: Product[]
  filters: ProductFilters
  loading: boolean
  error: string | null
  
  setProducts: (products: Product[]) => void
  setFilters: (filters: ProductFilters) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchProducts: () => Promise<void>
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      description: 'Новейший флагманский смартфон от Apple с титановым корпусом',
      price: 139990,
      oldPrice: 149990,
      discount: 7,
      images: ['/products/iphone-15-pro.jpg'],
      category: 'electronics',
      categoryName: 'Электроника',
      brand: 'Apple',
      rating: 4.8,
      reviewCount: 234,
      inStock: true,
      stock: 15,
      sku: 'IPH15PM-256-TIT'
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Мощный Android-флагман с S Pen и камерой 200 МП',
      price: 119990,
      images: ['/products/samsung-s24.jpg'],
      category: 'electronics',
      brand: 'Samsung',
      rating: 4.7,
      reviewCount: 156,
      inStock: true,
      stock: 8
    },
    {
      id: '3',
      name: 'MacBook Pro 14" M3',
      description: 'Профессиональный ноутбук на чипе M3 для максимальной производительности',
      price: 199990,
      oldPrice: 219990,
      discount: 9,
      images: ['/products/macbook-pro.jpg'],
      category: 'electronics',
      brand: 'Apple',
      rating: 4.9,
      reviewCount: 89,
      inStock: true,
      stock: 5
    },
    {
      id: '4',
      name: 'Sony WH-1000XM5',
      description: 'Беспроводные наушники с лучшим в классе шумоподавлением',
      price: 29990,
      images: ['/products/sony-headphones.jpg'],
      category: 'electronics',
      brand: 'Sony',
      rating: 4.6,
      reviewCount: 412,
      inStock: true,
      stock: 23
    },
    {
      id: '5',
      name: 'Nike Air Max 90',
      description: 'Классические кроссовки с легендарной амортизацией Air',
      price: 12990,
      images: ['/products/nike-airmax.jpg'],
      category: 'sports',
      brand: 'Nike',
      rating: 4.5,
      reviewCount: 678,
      inStock: true,
      stock: 45
    },
    {
      id: '6',
      name: 'Xiaomi Robot Vacuum S12',
      description: 'Умный робот-пылесос с мощным всасыванием и влажной уборкой',
      price: 34990,
      oldPrice: 39990,
      discount: 13,
      images: ['/products/xiaomi-vacuum.jpg'],
      category: 'home',
      brand: 'Xiaomi',
      rating: 4.4,
      reviewCount: 267,
      inStock: true,
      stock: 12
    },
    {
      id: '7',
      name: 'Adidas Ultraboost 22',
      description: 'Беговые кроссовки с технологией Boost для максимального комфорта',
      price: 14990,
      images: ['/products/adidas-ultraboost.jpg'],
      category: 'sports',
      brand: 'Adidas',
      rating: 4.7,
      reviewCount: 523,
      inStock: true,
      stock: 31
    },
    {
      id: '8',
      name: 'Dyson V15 Detect',
      description: 'Беспроводной пылесос с лазерной технологией обнаружения пыли',
      price: 54990,
      oldPrice: 64990,
      discount: 15,
      images: ['/products/dyson-v15.jpg'],
      category: 'home',
      brand: 'Dyson',
      rating: 4.8,
      reviewCount: 189,
      inStock: true,
      stock: 7
    },
    {
      id: '9',
      name: 'LEGO Star Wars Millennium Falcon',
      description: 'Легендарный конструктор на 7541 деталь для настоящих фанатов',
      price: 89990,
      images: ['/products/lego-falcon.jpg'],
      category: 'toys',
      brand: 'LEGO',
      rating: 5.0,
      reviewCount: 95,
      inStock: true,
      stock: 3
    },
    {
      id: '10',
      name: 'Dior Sauvage EDT',
      description: 'Культовый мужской аромат с древесно-пряными нотами',
      price: 8990,
      images: ['/products/dior-sauvage.jpg'],
      category: 'beauty',
      brand: 'Dior',
      rating: 4.9,
      reviewCount: 1234,
      inStock: true,
      stock: 56
    },
    {
      id: '11',
      name: 'Zara Пальто шерстяное',
      description: 'Элегантное двубортное пальто из шерстяной смеси',
      price: 12990,
      oldPrice: 15990,
      discount: 19,
      images: ['/products/zara-coat.jpg'],
      category: 'clothing',
      brand: 'Zara',
      rating: 4.3,
      reviewCount: 87,
      inStock: true,
      stock: 14
    },
    {
      id: '12',
      name: 'Гарри Поттер. Полное собрание',
      description: 'Подарочное издание всех 7 книг в коллекционном футляре',
      price: 7990,
      images: ['/products/harry-potter-books.jpg'],
      category: 'books',
      brand: 'Росмэн',
      rating: 5.0,
      reviewCount: 456,
      inStock: true,
      stock: 28
    },
    {
      id: '13',
      name: 'PlayStation 5 Slim',
      description: 'Новая компактная версия игровой консоли нового поколения',
      price: 54990,
      images: ['/products/ps5-slim.jpg'],
      category: 'electronics',
      brand: 'Sony',
      rating: 4.9,
      reviewCount: 342,
      inStock: true,
      stock: 6
    },
    {
      id: '14',
      name: 'The Ordinary Niacinamide 10% + Zinc 1%',
      description: 'Сыворотка для сужения пор и контроля жирности кожи',
      price: 990,
      images: ['/products/ordinary-niacinamide.jpg'],
      category: 'beauty',
      brand: 'The Ordinary',
      rating: 4.6,
      reviewCount: 2341,
      inStock: true,
      stock: 142
    },
    {
      id: '15',
      name: 'H&M Джинсы slim fit',
      description: 'Классические джинсы зауженного кроя из стрейч-денима',
      price: 2990,
      oldPrice: 3990,
      discount: 25,
      images: ['/products/hm-jeans.jpg'],
      category: 'clothing',
      brand: 'H&M',
      rating: 4.2,
      reviewCount: 567,
      inStock: true,
      stock: 89
    },
    {
      id: '16',
      name: 'Nespresso Vertuo Next',
      description: 'Капсульная кофемашина для эспрессо и американо одним нажатием',
      price: 14990,
      images: ['/products/nespresso.jpg'],
      category: 'home',
      brand: 'Nespresso',
      rating: 4.5,
      reviewCount: 234,
      inStock: true,
      stock: 19
    },
    {
      id: '17',
      name: 'Monopoly Классическая',
      description: 'Легендарная настольная игра для всей семьи',
      price: 2990,
      images: ['/products/monopoly.jpg'],
      category: 'toys',
      brand: 'Hasbro',
      rating: 4.7,
      reviewCount: 789,
      inStock: true,
      stock: 67
    },
    {
      id: '18',
      name: 'Organic Shop Шампунь',
      description: 'Натуральный шампунь для всех типов волос без SLS',
      price: 390,
      images: ['/products/organic-shampoo.jpg'],
      category: 'beauty',
      brand: 'Organic Shop',
      rating: 4.4,
      reviewCount: 1567,
      inStock: true,
      stock: 234
    },
    {
      id: '19',
      name: 'Canon EOS R6 Mark II',
      description: 'Профессиональная беззеркальная камера с 24.2 МП сенсором',
      price: 219990,
      images: ['/products/canon-r6.jpg'],
      category: 'electronics',
      brand: 'Canon',
      rating: 4.9,
      reviewCount: 67,
      inStock: true,
      stock: 4
    },
    {
      id: '20',
      name: 'Greenfield Classic Breakfast',
      description: 'Черный чай высшего сорта, 100 пакетиков',
      price: 490,
      images: ['/products/greenfield-tea.jpg'],
      category: 'food',
      brand: 'Greenfield',
      rating: 4.6,
      reviewCount: 3421,
      inStock: true,
      stock: 456
    },
    {
      id: '21',
      name: 'Uniqlo Fleece куртка',
      description: 'Легкая флисовая куртка для прохладной погоды',
      price: 3990,
      images: ['/products/uniqlo-fleece.jpg'],
      category: 'clothing',
      brand: 'Uniqlo',
      rating: 4.5,
      reviewCount: 234,
      inStock: true,
      stock: 78
    },
    {
      id: '22',
      name: 'Barbie Dreamhouse',
      description: 'Трехэтажный дом мечты Барби с мебелью и аксессуарами',
      price: 19990,
      oldPrice: 24990,
      discount: 20,
      images: ['/products/barbie-house.jpg'],
      category: 'toys',
      brand: 'Mattel',
      rating: 4.8,
      reviewCount: 456,
      inStock: true,
      stock: 11
    },
    {
      id: '23',
      name: 'GoPro HERO12 Black',
      description: 'Экшн-камера 5.3K с улучшенной стабилизацией',
      price: 44990,
      images: ['/products/gopro-12.jpg'],
      category: 'electronics',
      brand: 'GoPro',
      rating: 4.7,
      reviewCount: 178,
      inStock: true,
      stock: 15
    },
    {
      id: '24',
      name: 'Milka молочный шоколад',
      description: 'Классический молочный шоколад, 90г',
      price: 120,
      images: ['/products/milka.jpg'],
      category: 'food',
      brand: 'Milka',
      rating: 4.8,
      reviewCount: 5678,
      inStock: true,
      stock: 892
    }
  ],
  filters: {},
  loading: false,
  error: null,

  setProducts: (products) => set({ products }),
  setFilters: (filters) => set({ filters }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  fetchProducts: async () => {
    set({ loading: true, error: null })
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/products')
      // const data = await response.json()
      // set({ products: data, loading: false })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      set({ loading: false })
    } catch (error) {
      set({ error: 'Ошибка загрузки товаров', loading: false })
    }
  }
}))
