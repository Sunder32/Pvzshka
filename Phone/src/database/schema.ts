import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'products',
      columns: [
        { name: 'product_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'image', type: 'string', isOptional: true },
        { name: 'category', type: 'string' },
        { name: 'in_stock', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'orders',
      columns: [
        { name: 'order_id', type: 'string', isIndexed: true },
        { name: 'status', type: 'string' },
        { name: 'total', type: 'number' },
        { name: 'items_count', type: 'number' },
        { name: 'delivery_type', type: 'string' },
        { name: 'delivery_address', type: 'string', isOptional: true },
        { name: 'payment_method', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'cart_items',
      columns: [
        { name: 'product_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'quantity', type: 'number' },
        { name: 'image', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
})
