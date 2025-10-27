import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export default class Product extends Model {
  static table = 'products'

  @field('product_id') productId!: string
  @field('name') name!: string
  @field('description') description!: string
  @field('price') price!: number
  @field('image') image?: string
  @field('category') category!: string
  @field('in_stock') inStock!: boolean
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
