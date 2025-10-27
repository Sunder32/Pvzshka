import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import schema from './schema'
import Product from './models/Product'
import Order from './models/Order'
import CartItem from './models/CartItem'

const adapter = new SQLiteAdapter({
  schema,
  jsi: true,
  onSetUpError: (error) => {
    console.error('Database setup error:', error)
  },
})

export const database = new Database({
  adapter,
  modelClasses: [Product, Order, CartItem],
})

export const initDatabase = async () => {
  try {
    console.log('Database initialized')
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }
}
