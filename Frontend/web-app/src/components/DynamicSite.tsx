'use client'

import { useEffect, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import { motion, useScroll, useTransform } from 'framer-motion'
import Header from './Header'

const GET_SITE_CONFIG = gql`
  query GetSiteConfig($subdomain: String!) {
    siteConfigBySubdomain(subdomain: $subdomain) {
      theme {
        primaryColor
        secondaryColor
        fontFamily
        borderRadius
      }
      logo
      layout {
        sections {
          id
          type
          config
          order
        }
      }
    }
  }
`

interface DynamicSiteProps {
  subdomain: string
}

export default function DynamicSite({ subdomain }: DynamicSiteProps) {
  const { data, loading, error, refetch } = useQuery(GET_SITE_CONFIG, {
    variables: { subdomain },
    fetchPolicy: 'network-only', // Всегда загружать с сервера
    pollInterval: 5000, // Обновлять каждые 5 секунд
  })

  // Принудительное обновление при изменении subdomain
  useEffect(() => {
    refetch()
  }, [subdomain, refetch])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>Ошибка загрузки конфигурации сайта</p>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  const config = data?.siteConfigBySubdomain
  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Конфигурация не найдена</p>
      </div>
    )
  }

  const sections = config.layout?.sections || []
  const validSections = sections
    .filter((s: any) => s && s.id && s.type && s.config)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

  return (
    <div style={{ fontFamily: config.theme?.fontFamily || 'Inter' }}>
      {validSections.map((section: any) => (
        <SectionRenderer
          key={section.id}
          section={section}
          theme={config.theme}
          logo={config.logo}
        />
      ))}
    </div>
  )
}

interface SectionRendererProps {
  section: any
  theme: any
  logo: any
}

function SectionRenderer({ section, theme, logo }: SectionRendererProps) {
  const { type, config } = section

  switch (type) {
    case 'header':
      return <Header />
    case 'hero':
      return <HeroSection config={config} theme={theme} logo={logo} />
    case 'features':
      return <FeaturesSection config={config} theme={theme} />
    case 'products':
      return <ProductsSection config={config} theme={theme} />
    case 'categories':
      return <CategoriesSection config={config} theme={theme} />
    case 'banner':
      return <BannerSection config={config} theme={theme} />
    case 'hot-deals':
      return <HotDealsSection config={config} theme={theme} />
    case 'newsletter':
      return <NewsletterSection config={config} theme={theme} />
    default:
      return null
  }
}

// Hero Section
function HeroSection({ config, theme, logo }: any) {
  const variant = config.variant || 'gradient' // gradient, particles, waves, geometric, minimal
  
  return (
    <HeroVariant variant={variant} config={config} theme={theme} logo={logo} />
  )
}

// Hero Variants Component
function HeroVariant({ variant, config, theme, logo }: any) {
  switch (variant) {
    case 'particles':
      return <HeroParticles config={config} theme={theme} logo={logo} />
    case 'waves':
      return <HeroWaves config={config} theme={theme} logo={logo} />
    case 'geometric':
      return <HeroGeometric config={config} theme={theme} logo={logo} />
    case 'minimal':
      return <HeroMinimal config={config} theme={theme} logo={logo} />
    case 'gradient':
    default:
      return <HeroGradient config={config} theme={theme} logo={logo} />
  }
}

// Gradient Hero with animations
function HeroGradient({ config, theme, logo }: any) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${config.gradientStart || theme.primaryColor}, ${config.gradientEnd || theme.secondaryColor})`,
        color: config.textColor || '#ffffff',
        padding: '120px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <motion.div
        style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          filter: 'blur(80px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div 
        className="container mx-auto px-4"
        style={{ y, opacity }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-6xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {config.title || 'Заголовок'}
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-10 opacity-90"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            {config.subtitle || 'Подзаголовок'}
          </motion.p>
          {config.buttonText && (
            <motion.button
              style={{
                backgroundColor: config.buttonColor || '#ffffff',
                color: config.buttonTextColor || theme.primaryColor,
                padding: '18px 40px',
                borderRadius: theme.borderRadius || 12,
                fontWeight: 600,
                fontSize: '18px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              whileHover={{ scale: 1.05, boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              {config.buttonText}
            </motion.button>
          )}
        </div>
      </motion.div>
    </section>
  )
}

// Particles Hero
function HeroParticles({ config, theme, logo }: any) {
  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${config.gradientStart || '#1a1a2e'}, ${config.gradientEnd || '#16213e'})`,
        color: config.textColor || '#ffffff',
        padding: '120px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.5)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-6xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {config.title || 'Заголовок'}
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-10 opacity-90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {config.subtitle || 'Подзаголовок'}
          </motion.p>
          {config.buttonText && (
            <motion.button
              style={{
                backgroundColor: config.buttonColor || '#ffffff',
                color: config.buttonTextColor || theme.primaryColor,
                padding: '18px 40px',
                borderRadius: theme.borderRadius || 12,
                fontWeight: 600,
                fontSize: '18px',
                border: 'none',
                cursor: 'pointer',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {config.buttonText}
            </motion.button>
          )}
        </div>
      </div>
    </section>
  )
}

// Waves Hero
function HeroWaves({ config, theme, logo }: any) {
  return (
    <section
      style={{
        background: config.gradientStart || theme.primaryColor,
        color: config.textColor || '#ffffff',
        padding: '120px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* SVG Waves */}
      <svg
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '150px',
        }}
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <motion.path
          fill="rgba(255,255,255,0.1)"
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          animate={{
            d: [
              "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,160L48,144C96,128,192,96,288,96C384,96,480,128,576,144C672,160,768,160,864,144C960,128,1056,96,1152,96C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-6xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, type: 'spring', bounce: 0.4 }}
          >
            {config.title || 'Заголовок'}
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-10 opacity-90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {config.subtitle || 'Подзаголовок'}
          </motion.p>
          {config.buttonText && (
            <motion.button
              style={{
                backgroundColor: config.buttonColor || '#ffffff',
                color: config.buttonTextColor || theme.primaryColor,
                padding: '18px 40px',
                borderRadius: theme.borderRadius || 12,
                fontWeight: 600,
                fontSize: '18px',
                border: 'none',
                cursor: 'pointer',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6, type: 'spring' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {config.buttonText}
            </motion.button>
          )}
        </div>
      </div>
    </section>
  )
}

// Geometric Hero
function HeroGeometric({ config, theme, logo }: any) {
  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${config.gradientStart || '#667eea'}, ${config.gradientEnd || '#764ba2'})`,
        color: config.textColor || '#ffffff',
        padding: '120px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Geometric shapes */}
      <motion.div
        style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '200px',
          height: '200px',
          border: '3px solid rgba(255,255,255,0.2)',
          borderRadius: '20px',
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '150px',
          height: '150px',
          border: '3px solid rgba(255,255,255,0.15)',
        }}
        animate={{
          rotate: [0, -360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: '3px solid rgba(255,255,255,0.1)',
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-6xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, rotateX: -90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{ duration: 0.8 }}
          >
            {config.title || 'Заголовок'}
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-10 opacity-90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {config.subtitle || 'Подзаголовок'}
          </motion.p>
          {config.buttonText && (
            <motion.button
              style={{
                backgroundColor: config.buttonColor || '#ffffff',
                color: config.buttonTextColor || theme.primaryColor,
                padding: '18px 40px',
                borderRadius: theme.borderRadius || 12,
                fontWeight: 600,
                fontSize: '18px',
                border: 'none',
                cursor: 'pointer',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
              whileTap={{ scale: 0.95 }}
            >
              {config.buttonText}
            </motion.button>
          )}
        </div>
      </div>
    </section>
  )
}

// Minimal Hero
function HeroMinimal({ config, theme, logo }: any) {
  return (
    <section
      style={{
        background: config.backgroundColor || '#ffffff',
        color: config.textColor || '#1f2937',
        padding: '120px 0',
        position: 'relative',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6"
            style={{ color: theme.primaryColor }}
            initial={{ opacity: 0, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, letterSpacing: '0em' }}
            transition={{ duration: 1 }}
          >
            {config.title || 'Заголовок'}
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-10"
            style={{ color: '#6b7280' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {config.subtitle || 'Подзаголовок'}
          </motion.p>
          {config.buttonText && (
            <motion.button
              style={{
                backgroundColor: theme.primaryColor,
                color: '#ffffff',
                padding: '18px 40px',
                borderRadius: theme.borderRadius || 12,
                fontWeight: 600,
                fontSize: '18px',
                border: 'none',
                cursor: 'pointer',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              whileHover={{ scale: 1.05, backgroundColor: theme.secondaryColor }}
              whileTap={{ scale: 0.95 }}
            >
              {config.buttonText}
            </motion.button>
          )}
        </div>
      </div>
    </section>
  )
}

// Features Section
function FeaturesSection({ config, theme }: any) {
  const icons: any = {
    star: '⭐',
    cart: '🛒',
    truck: '🚚',
    shield: '🛡️',
    zap: '⚡',
    heart: '❤️',
  }

  const defaultFeatures = [
    { icon: 'truck', title: 'Быстрая доставка', description: 'Доставка по всей России за 1-3 дня' },
    { icon: 'shield', title: 'Гарантия качества', description: 'Официальная гарантия на все товары' },
    { icon: 'zap', title: 'Выгодные цены', description: 'Лучшие предложения на рынке' },
  ]

  const features = config.items || defaultFeatures

  return (
    <section style={{ padding: '80px 0', backgroundColor: config.backgroundColor || '#f9fafb' }}>
      <div className="container mx-auto px-4">
        <motion.h2
          style={{ 
            fontSize: '42px', 
            fontWeight: 'bold', 
            marginBottom: '48px', 
            color: theme.primaryColor,
            textAlign: 'center',
          }}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {config.sectionTitle || 'Наши преимущества'}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((item: any, index: number) => (
            <motion.div
              key={index}
              style={{
                backgroundColor: '#ffffff',
                padding: '40px',
                borderRadius: theme.borderRadius || 16,
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ 
                y: -8,
                boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
              }}
            >
              {/* Decorative gradient */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: `radial-gradient(circle, ${theme.primaryColor}15 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }}
                initial={{ opacity: 0, scale: 0 }}
                whileHover={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              
              <motion.div 
                style={{ 
                  fontSize: '64px', 
                  marginBottom: '20px',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                }}
                whileHover={{ 
                  scale: 1.2,
                  rotate: [0, -10, 10, -10, 0],
                }}
                transition={{ duration: 0.5 }}
              >
                {icons[item.icon] || '⭐'}
              </motion.div>
              <h3 style={{ 
                fontSize: '22px', 
                fontWeight: 700, 
                marginBottom: '12px', 
                color: theme.primaryColor,
              }}>
                {item.title}
              </h3>
              <p style={{ 
                color: '#6b7280',
                fontSize: '16px',
                lineHeight: '1.6',
              }}>
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Products Section (placeholder - замените на реальную загрузку товаров)
function ProductsSection({ config, theme }: any) {
  const products = [
    { id: 1, name: 'Товар 1', price: 1999, oldPrice: 2499, discount: 20, image: null },
    { id: 2, name: 'Товар 2', price: 3499, oldPrice: null, discount: 0, image: null },
    { id: 3, name: 'Товар 3', price: 4999, oldPrice: 5999, discount: 17, image: null },
    { id: 4, name: 'Товар 4', price: 2999, oldPrice: null, discount: 0, image: null },
    { id: 5, name: 'Товар 5', price: 5499, oldPrice: 6999, discount: 21, image: null },
    { id: 6, name: 'Товар 6', price: 1499, oldPrice: null, discount: 0, image: null },
    { id: 7, name: 'Товар 7', price: 3999, oldPrice: 4999, discount: 20, image: null },
    { id: 8, name: 'Товар 8', price: 2499, oldPrice: null, discount: 0, image: null },
  ]

  return (
    <section style={{ padding: '80px 0', background: config.backgroundColor || '#ffffff' }}>
      <div className="container mx-auto px-4">
        <motion.h2
          style={{ 
            fontSize: '42px', 
            fontWeight: 'bold', 
            marginBottom: '48px', 
            color: theme.primaryColor,
            textAlign: 'center',
          }}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {config.title || 'Товары из каталога'}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              style={{
                position: 'relative',
                backgroundColor: '#ffffff',
                borderRadius: theme.borderRadius || 16,
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                cursor: 'pointer',
              }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -10,
                boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                transition: { duration: 0.3 }
              }}
            >
              {/* Discount badge */}
              {product.discount > 0 && (
                <motion.div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    zIndex: 10,
                  }}
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                >
                  -{product.discount}%
                </motion.div>
              )}

              {/* Image placeholder */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                }}
              >
                📦
              </div>

              {/* Content */}
              <div style={{ padding: '20px' }}>
                <h3 
                  style={{ 
                    fontSize: '18px', 
                    fontWeight: 600, 
                    marginBottom: '12px',
                    color: '#1f2937',
                  }}
                >
                  {product.name}
                </h3>

                {/* Price */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span 
                      style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        color: theme.primaryColor,
                      }}
                    >
                      {product.price} ₽
                    </span>
                    {product.oldPrice && (
                      <span 
                        style={{ 
                          fontSize: '16px', 
                          color: '#9ca3af',
                          textDecoration: 'line-through',
                        }}
                      >
                        {product.oldPrice} ₽
                      </span>
                    )}
                  </div>
                </div>

                {/* Button */}
                <motion.button
                  style={{
                    width: '100%',
                    backgroundColor: theme.primaryColor,
                    color: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: theme.borderRadius || 8,
                    fontWeight: 600,
                    fontSize: '16px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: theme.secondaryColor || theme.primaryColor,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  В корзину
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Categories Section
function CategoriesSection({ config, theme }: any) {
  return (
    <section style={{ padding: '60px 0', backgroundColor: '#f9fafb' }}>
      <div className="container mx-auto px-4">
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px', color: theme.primaryColor }}>
          {config.title || 'Плитка категорий'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(config.categories || []).map((cat: any, index: number) => (
            <div
              key={index}
              style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                borderRadius: theme.borderRadius || 8,
                textAlign: 'center',
                cursor: 'pointer',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>{cat.icon || '📦'}</div>
              <div style={{ fontWeight: 600 }}>{cat.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Banner Section
function BannerSection({ config, theme }: any) {
  return (
    <section style={{ padding: '80px 0' }}>
      <div className="container mx-auto px-4">
        <motion.div
          style={{
            background: `linear-gradient(135deg, ${config.backgroundColor || theme.primaryColor}, ${config.gradientEnd || theme.secondaryColor || theme.primaryColor})`,
            color: '#ffffff',
            padding: '80px 60px',
            borderRadius: theme.borderRadius || 20,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated background circles */}
          <motion.div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          />
          <motion.div
            style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
            }}
          />
          
          <motion.h2 
            style={{ 
              fontSize: '48px', 
              fontWeight: 'bold', 
              marginBottom: '20px',
              position: 'relative',
              zIndex: 1,
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {config.title || 'Рекламный баннер'}
          </motion.h2>
          <motion.p 
            style={{ 
              fontSize: '20px', 
              opacity: 0.95,
              maxWidth: '700px',
              margin: '0 auto',
              position: 'relative',
              zIndex: 1,
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 0.95, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {config.description || 'Специальное предложение только для вас'}
          </motion.p>
          {config.buttonText && (
            <motion.button
              style={{
                marginTop: '32px',
                backgroundColor: '#ffffff',
                color: theme.primaryColor,
                padding: '16px 40px',
                borderRadius: theme.borderRadius || 12,
                fontWeight: 600,
                fontSize: '18px',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1,
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              {config.buttonText}
            </motion.button>
          )}
        </motion.div>
      </div>
    </section>
  )
}

// Hot Deals Section
function HotDealsSection({ config, theme }: any) {
  const deals = [
    { id: 1, title: 'Скидка 50%', description: 'На все категории', icon: '🔥' },
    { id: 2, title: 'Бесплатная доставка', description: 'При заказе от 3000₽', icon: '🚚' },
    { id: 3, title: 'Подарок при покупке', description: 'Специальное предложение', icon: '🎁' },
  ]

  return (
    <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
      <div className="container mx-auto px-4">
        <motion.h2 
          style={{ 
            fontSize: '42px', 
            fontWeight: 'bold', 
            marginBottom: '48px', 
            color: '#92400e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          🔥 {config.title || 'Горячие предложения'}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {deals.map((deal, index) => (
            <motion.div
              key={deal.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: theme.borderRadius || 16,
                padding: '40px',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                cursor: 'pointer',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                backgroundColor: '#fffbeb',
              }}
            >
              <motion.div 
                style={{ fontSize: '64px', marginBottom: '16px' }}
                animate={{ 
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
              >
                {deal.icon}
              </motion.div>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: '#92400e',
              }}>
                {deal.title}
              </h3>
              <p style={{ color: '#78350f', fontSize: '16px' }}>
                {deal.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Newsletter Section
function NewsletterSection({ config, theme }: any) {
  return (
    <section 
      style={{ 
        padding: '80px 0', 
        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`,
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)',
          backgroundSize: '40px 40px',
          opacity: 0.3,
        }}
      />

      <div className="container mx-auto px-4 text-center" style={{ position: 'relative', zIndex: 1 }}>
        <motion.h2 
          style={{ 
            fontSize: '42px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
          }}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {config.title || '📧 Подпишитесь на рассылку'}
        </motion.h2>
        <motion.p 
          style={{ 
            fontSize: '20px', 
            marginBottom: '32px', 
            opacity: 0.95,
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.95 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {config.description || 'Получайте лучшие предложения и новости первыми'}
        </motion.p>
        <motion.div 
          style={{ 
            maxWidth: '600px', 
            margin: '0 auto', 
            display: 'flex', 
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <input
            type="email"
            placeholder={config.placeholder || 'Введите ваш email'}
            style={{
              flex: '1 1 300px',
              padding: '16px 20px',
              borderRadius: theme.borderRadius || 12,
              border: 'none',
              fontSize: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          />
          <motion.button
            style={{
              backgroundColor: '#ffffff',
              color: theme.primaryColor,
              padding: '16px 32px',
              borderRadius: theme.borderRadius || 12,
              fontWeight: 700,
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            {config.buttonText || 'Подписаться'}
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
