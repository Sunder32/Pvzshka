'use client'

import { useEffect, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import { motion, useScroll, useTransform } from 'framer-motion'

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
    fetchPolicy: 'network-only', // Всегда загружать с сервера (без Apollo кеша)
    nextFetchPolicy: 'network-only', // После первого запроса тоже network-only
    // pollInterval убран - обновление происходит только при изменении subdomain
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
      return <HeaderSection config={config} theme={theme} logo={logo} />
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

// Icon mapping utility
const getMenuIcon = (iconName: string) => {
  const iconStyle = { width: 18, height: 18, strokeWidth: 2 };
  
  switch (iconName) {
    case 'home':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m3 12 2-2m0 0 7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11 2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6" />
        </svg>
      );
    case 'catalog':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case 'cart':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
        </svg>
      );
    case 'user':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" />
        </svg>
      );
    case 'heart':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      );
    case 'info':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
      );
    case 'phone':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
        </svg>
      );
    case 'mail':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      );
    case 'star':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      );
    case 'tag':
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={iconStyle}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
        </svg>
      );
    default:
      return null;
  }
};

// Header Section (Dynamic)
function HeaderSection({ config, theme, logo }: any) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menu = config.menu || []
  const sortedMenu = [...menu].sort((a, b) => (a.order || 0) - (b.order || 0))

  const headerStyle = {
    backgroundColor: config.backgroundColor || '#ffffff',
    color: config.textColor || '#000000',
    height: `${config.height || 64}px`,
    boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.05)',
    backdropFilter: scrolled ? 'blur(10px)' : 'none',
    transition: 'all 0.3s ease',
  }

  return (
    <header 
      className={config.sticky ? 'sticky top-0 z-50' : ''}
      style={headerStyle}
    >
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        {config.showLogo !== false && (
          <a href="/" className="flex items-center gap-3 group">
            {config.logoUrl && (
              <div className="relative">
                <img 
                  src={config.logoUrl} 
                  alt="Logo" 
                  className="h-12 w-12 object-contain transition-transform group-hover:scale-110"
                />
              </div>
            )}
            <span className="text-2xl font-bold tracking-tight transition-colors group-hover:opacity-80">
              {config.storeName || 'Marketplace'}
            </span>
          </a>
        )}

        {/* Menu Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {sortedMenu.map((item: any) => (
            <a
              key={item.id}
              href={item.url}
              className="relative font-medium transition-all hover:scale-105 flex items-center gap-2"
              style={{ 
                color: config.textColor || '#000000',
              }}
            >
              {item.icon && item.icon !== 'none' && getMenuIcon(item.icon)}
              <span className="relative">
                {item.label}
                <span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 transition-all hover:w-full"
                  style={{ backgroundColor: theme?.primaryColor || '#0066cc' }}
                />
              </span>
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {config.showSearch && (
            <button 
              className="p-2.5 rounded-xl transition-all hover:bg-gray-100 hover:scale-110"
              aria-label="Поиск"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}
          {config.showCart && (
            <button 
              className="relative p-2.5 rounded-xl transition-all hover:bg-gray-100 hover:scale-110"
              aria-label="Корзина"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          )}
          {config.showProfile && (
            <button 
              className="p-2.5 rounded-xl transition-all hover:bg-gray-100 hover:scale-110"
              aria-label="Профиль"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Меню"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div 
          className="md:hidden absolute w-full shadow-lg animate-fade-in"
          style={{ 
            backgroundColor: config.backgroundColor || '#ffffff',
            borderTop: `1px solid ${theme?.primaryColor || '#e5e7eb'}40`
          }}
        >
          <nav className="container mx-auto px-6 py-4 flex flex-col gap-3">
            {sortedMenu.map((item: any) => (
              <a
                key={item.id}
                href={item.url}
                className="px-4 py-3 rounded-lg transition-all hover:bg-gray-50 flex items-center gap-3"
                style={{ color: config.textColor || '#000000' }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon && item.icon !== 'none' && getMenuIcon(item.icon)}
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
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

  return (
    <section
      style={{
        background: `linear-gradient(135deg, ${config.gradientStart || theme.primaryColor}, ${config.gradientEnd || theme.secondaryColor})`,
        color: config.textColor || '#ffffff',
        padding: '140px 0 120px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '700px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Animated gradient orbs */}
      <motion.div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 30, 0],
          y: [0, 50, 0],
          rotate: [0, 90, 0],
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
          bottom: '-5%',
          left: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{
          scale: [1, 1.4, 1],
          x: [0, -20, 0],
          y: [0, -30, 0],
          rotate: [0, -90, 0],
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
          top: '40%',
          left: '50%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
        animate={{
          scale: [1, 1.5, 1],
          x: [-150, -100, -150],
          y: [-150, -100, -150],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.4)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Grid pattern with shimmer */}
      <motion.div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.6,
        }}
        animate={{
          backgroundPosition: ['0px 0px', '60px 60px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div 
        className="container mx-auto px-6 relative z-10"
        style={{ y }}
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge with glow effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '100px',
              marginBottom: '32px',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
              position: 'relative',
            }}
          >
            <motion.div
              style={{
                position: 'absolute',
                inset: -1,
                borderRadius: '100px',
                padding: '1px',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.1), rgba(255,255,255,0.5))',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <span style={{ 
              fontSize: '13px', 
              fontWeight: 600, 
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              position: 'relative',
              zIndex: 1,
            }}>
              {config.badge || '✨ Новая коллекция'}
            </span>
          </motion.div>

          {/* Main heading with gradient shimmer */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ marginBottom: '28px' }}
          >
            <h1
              style={{
                fontSize: 'clamp(3rem, 10vw, 5.5rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: config.textColor || '#ffffff',
                textShadow: '0 4px 60px rgba(0,0,0,0.3), 0 2px 20px rgba(0,0,0,0.2)',
                position: 'relative',
              }}
            >
              {config.title || 'Заголовок'}
            </h1>
          </motion.div>

          {/* Subtitle with fade-in */}
          <motion.p
            style={{
              fontSize: 'clamp(1.15rem, 2.5vw, 1.5rem)',
              marginBottom: '56px',
              opacity: 0.92,
              lineHeight: 1.7,
              maxWidth: '750px',
              margin: '0 auto 56px',
              fontWeight: 400,
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 0.92, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {config.subtitle || 'Подзаголовок'}
          </motion.p>

          {/* CTA Buttons with 3D effect */}
          {config.buttonText && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ 
                display: 'flex', 
                gap: '20px', 
                justifyContent: 'center', 
                flexWrap: 'wrap',
                marginBottom: '72px',
              }}
            >
              <motion.a
                href={config.buttonLink || '#'}
                style={{
                  backgroundColor: config.buttonColor || '#ffffff',
                  color: config.buttonTextColor || theme.primaryColor,
                  padding: '18px 52px',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '17px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.2)',
                  y: -2,
                }}
                whileTap={{ scale: 0.98, y: 0 }}
              >
                <motion.div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  }}
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span style={{ position: 'relative', zIndex: 1 }}>{config.buttonText}</span>
                <motion.svg 
                  width="20" 
                  height="20" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ position: 'relative', zIndex: 1 }}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </motion.a>
              {config.secondaryButtonText && (
                <motion.a
                  href={config.secondaryButtonLink || '#'}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    padding: '18px 52px',
                    borderRadius: '16px',
                    fontWeight: 700,
                    fontSize: '17px',
                    border: '2px solid rgba(255,255,255,0.25)',
                    cursor: 'pointer',
                    backdropFilter: 'blur(20px)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderColor: 'rgba(255,255,255,0.4)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
                    y: -2,
                  }}
                  whileTap={{ scale: 0.98, y: 0 }}
                >
                  <span>{config.secondaryButtonText}</span>
                </motion.a>
              )}
            </motion.div>
          )}

          {/* Stats/Features with 3D cards */}
          {config.showStats && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                display: 'flex',
                gap: '24px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              {[
                { label: 'Товаров', value: '10,000+', icon: '📦' },
                { label: 'Клиентов', value: '50,000+', icon: '👥' },
                { label: 'Отзывов', value: '4.9★', icon: '⭐' },
              ].map((stat, idx) => (
                <motion.div 
                  key={idx} 
                  style={{ 
                    textAlign: 'center',
                    padding: '28px 40px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    minWidth: '180px',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  whileHover={{ 
                    y: -8, 
                    boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
                    background: 'rgba(255,255,255,0.12)',
                  }}
                >
                  <div style={{ 
                    fontSize: '2rem', 
                    marginBottom: '8px',
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
                  }}>
                    {stat.icon}
                  </div>
                  <div style={{ 
                    fontSize: '2.75rem', 
                    fontWeight: 900, 
                    marginBottom: '6px',
                    letterSpacing: '-0.02em',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    opacity: 0.85, 
                    textTransform: 'uppercase', 
                    letterSpacing: '1.5px',
                    fontWeight: 600,
                  }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
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
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -12,
                boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                transition: { duration: 0.3 }
              }}
            >
              {/* Discount badge */}
              {product.discount > 0 && (
                <motion.div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '30px',
                    fontSize: '13px',
                    fontWeight: 800,
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(244,63,94,0.4)',
                    letterSpacing: '0.5px',
                  }}
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', duration: 0.6, delay: index * 0.1 + 0.3 }}
                  whileHover={{ scale: 1.1 }}
                >
                  -{product.discount}%
                </motion.div>
              )}

              {/* Favorite button */}
              <motion.button
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="20" height="20" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </motion.button>

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
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Shimmer effect */}
                <motion.div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  }}
                  animate={{
                    left: ['100%', '-100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                📦
              </div>

              {/* Content */}
              <div style={{ padding: '24px' }}>
                <h3 
                  style={{ 
                    fontSize: '18px', 
                    fontWeight: 700, 
                    marginBottom: '12px',
                    color: '#1f2937',
                    lineHeight: 1.4,
                  }}
                >
                  {product.name}
                </h3>

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="16" height="16" fill="#fbbf24" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                  <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '4px' }}>
                    (128)
                  </span>
                </div>

                {/* Price */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span 
                      style={{ 
                        fontSize: '28px', 
                        fontWeight: 800, 
                        color: theme.primaryColor,
                        letterSpacing: '-0.5px',
                      }}
                    >
                      {product.price.toLocaleString()} ₽
                    </span>
                    {product.oldPrice && (
                      <span 
                        style={{ 
                          fontSize: '16px', 
                          color: '#9ca3af',
                          textDecoration: 'line-through',
                          fontWeight: 500,
                        }}
                      >
                        {product.oldPrice.toLocaleString()} ₽
                      </span>
                    )}
                  </div>
                </div>

                {/* Button */}
                <motion.button
                  style={{
                    width: '100%',
                    background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor || theme.primaryColor} 100%)`,
                    color: '#ffffff',
                    padding: '14px 24px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '15px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: `0 4px 12px ${theme.primaryColor}40`,
                  }}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: `0 6px 20px ${theme.primaryColor}60`,
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
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
  const categories = config.categories || [
    { name: 'Электроника', icon: '💻', color: '#3b82f6' },
    { name: 'Одежда', icon: '👕', color: '#8b5cf6' },
    { name: 'Дом и сад', icon: '🏡', color: '#10b981' },
    { name: 'Спорт', icon: '⚽', color: '#f59e0b' },
  ];

  return (
    <section style={{ padding: '80px 0', backgroundColor: '#f9fafb' }}>
      <div className="container mx-auto px-6">
        <motion.h2 
          style={{ 
            fontSize: '42px', 
            fontWeight: 800, 
            marginBottom: '56px', 
            color: theme.primaryColor,
            textAlign: 'center',
          }}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {config.title || 'Популярные категории'}
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat: any, index: number) => (
            <motion.div
              key={index}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                padding: '32px 24px',
                borderRadius: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden',
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -8,
                boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                transition: { duration: 0.3 }
              }}
            >
              {/* Background gradient on hover */}
              <motion.div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(135deg, ${cat.color}15 0%, ${cat.color}05 100%)`,
                  opacity: 0,
                }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              <motion.div 
                style={{ 
                  fontSize: '64px', 
                  marginBottom: '16px',
                  position: 'relative',
                  zIndex: 1,
                }}
                whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {cat.icon || '📦'}
              </motion.div>
              <div style={{ 
                fontWeight: 700, 
                fontSize: '18px',
                color: '#1f2937',
                position: 'relative',
                zIndex: 1,
              }}>
                {cat.name}
              </div>
              <div style={{
                fontSize: '13px',
                color: '#6b7280',
                marginTop: '8px',
                position: 'relative',
                zIndex: 1,
              }}>
                {Math.floor(Math.random() * 500) + 100}+ товаров
              </div>
            </motion.div>
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
