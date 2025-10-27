import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export default class CartItem extends Model {
  static table = 'cart_items'

  @field('product_id') productId!: string
  @field('name') name!: string
  @field('price') price!: number
  @field('quantity') quantity!: number
  @field('image') image?: string
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
