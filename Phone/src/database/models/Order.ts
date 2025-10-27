import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export default class Order extends Model {
  static table = 'orders'

  @field('order_id') orderId!: string
  @field('status') status!: string
  @field('total') total!: number
  @field('items_count') itemsCount!: number
  @field('delivery_type') deliveryType!: string
  @field('delivery_address') deliveryAddress?: string
  @field('payment_method') paymentMethod!: string
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
