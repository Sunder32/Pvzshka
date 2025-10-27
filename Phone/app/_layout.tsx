import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useEffect } from 'react'
import { initDatabase } from '@/database'
import codePush from 'react-native-code-push'

function RootLayout() {
  useEffect(() => {
    initDatabase()
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2563eb',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: 'Вход' }} />
          <Stack.Screen name="product/[id]" options={{ title: 'Товар' }} />
          <Stack.Screen name="checkout" options={{ title: 'Оформление заказа' }} />
          <Stack.Screen name="qr-scanner" options={{ title: 'Сканер QR' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.ON_NEXT_RESUME,
}

export default codePush(codePushOptions)(RootLayout)
