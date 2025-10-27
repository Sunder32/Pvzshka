# 🧪 Data Persistence Testing Guide

All data persistence features have been implemented! Here's how to test each feature:

## ✅ Features Implemented

### 1. **Cart Persistence** 🛒
- Cart items are now stored in PostgreSQL database
- Data syncs automatically when logged in
- Persists across page reloads and browser sessions

### 2. **Support Tickets** 📧
- New support ticket submission system
- Tickets stored in database with full history
- Available at `/support` page

### 3. **Site Builder** 🎨
- Site configuration saved to database
- Theme and layout settings persist
- Available in tenant-admin interface

---

## 🔧 Backend API Endpoints

All endpoints require authentication (Bearer token in Authorization header):

### Cart Endpoints
- `GET /api/cart` - Get user's cart items
- `POST /api/cart/items` - Add item to cart
  ```json
  {
    "productId": "uuid",
    "quantity": 1,
    "price": 999.99
  }
  ```
- `PUT /api/cart/items/:id` - Update item quantity
  ```json
  {
    "quantity": 2
  }
  ```
- `DELETE /api/cart/items/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

### Support Ticket Endpoints
- `GET /api/support/tickets` - Get user's tickets
- `POST /api/support/tickets` - Create new ticket
  ```json
  {
    "subject": "Test issue",
    "category": "technical",
    "priority": "medium",
    "description": "Detailed description"
  }
  ```
- `GET /api/support/tickets/:id` - Get ticket with messages
- `POST /api/support/tickets/:id/messages` - Add message to ticket
  ```json
  {
    "message": "Additional info"
  }
  ```

### Site Builder Endpoints
- `GET /api/sites/:tenantId` - Get site configuration
- `POST /api/sites/:tenantId` - Save site configuration
  ```json
  {
    "logo": "url",
    "theme": {
      "primaryColor": "#0066cc",
      "secondaryColor": "#ff6600",
      "fontFamily": "Inter",
      "borderRadius": 8
    },
    "layout": {},
    "status": "draft"
  }
  ```
- `POST /api/sites/:tenantId/publish` - Publish site

---

## 🧪 Testing Steps

### Test 1: Cart Persistence

1. **Login** to the marketplace:
   - Go to `http://localhost:3003/login`
   - Use credentials: `test@test.com` / `test123`

2. **Add items to cart**:
   - Browse products on homepage
   - Click "Add to Cart" on several products
   - Check cart icon shows item count

3. **Verify persistence**:
   - Refresh the page (F5)
   - Cart items should still be there!
   - Close browser completely
   - Reopen `http://localhost:3003`
   - Login again
   - Cart should still contain your items ✅

4. **Test cart operations**:
   - Open cart
   - Change quantity of an item
   - Remove an item
   - Clear entire cart
   - Add new items
   - Refresh page - changes should persist

### Test 2: Support Tickets

1. **Navigate to support page**:
   - Go to `http://localhost:3003/support`
   - Or add a link to your navigation

2. **Create a ticket**:
   - Fill in the form:
     - Subject: "Test ticket"
     - Category: "Technical"
     - Priority: "Medium"
     - Description: "This is a test support request"
   - Click "Отправить обращение"
   - Success message should appear ✅

3. **Verify in database**:
   ```powershell
   docker exec -i pvzzz-postgres-1 psql -U platform -d marketplace -c "SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 5;"
   ```

4. **Test persistence**:
   - Refresh the page
   - Your ticket data should still be in the database
   - You can fetch tickets via API:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/api/support/tickets
   ```

### Test 3: Site Builder (Tenant Admin)

1. **Login to tenant admin**:
   - Go to `http://localhost:3001` (tenant-admin)
   - Login with admin credentials

2. **Open Site Builder**:
   - Navigate to Site Builder page
   - You should see the site configuration interface

3. **Make changes**:
   - Change primary color
   - Change secondary color
   - Add/remove sections
   - Click "Сохранить" (Save)

4. **Verify persistence**:
   - Refresh the page
   - Your theme changes should be loaded from database ✅
   - Check database:
   ```powershell
   docker exec -i pvzzz-postgres-1 psql -U platform -d marketplace -c "SELECT * FROM site_configs;"
   ```

5. **Test publish**:
   - Click "Опубликовать" (Publish)
   - Status should change to "published"

---

## 📊 Database Verification

Check all tables have been created:

```powershell
docker exec -i pvzzz-postgres-1 psql -U platform -d marketplace -c "\dt"
```

Should show:
- ✅ `cart` - Shopping carts
- ✅ `cart_items` - Cart items
- ✅ `support_tickets` - Support tickets
- ✅ `ticket_messages` - Ticket messages
- ✅ `site_configs` - Site builder configurations

---

## 🔍 Troubleshooting

### Cart not persisting?
1. Make sure you're logged in (JWT token required)
2. Check browser console for errors
3. Verify auth-api is running: `docker ps | grep auth-api`
4. Check auth-api logs: `docker logs pvzzz-auth-api-1`

### Support tickets not saving?
1. Check you're authenticated
2. Verify database connection:
   ```powershell
   docker exec -i pvzzz-postgres-1 psql -U platform -d marketplace -c "SELECT COUNT(*) FROM support_tickets;"
   ```

### Site builder not loading?
1. Check tenant-admin is running: `docker ps | grep tenant-admin`
2. Verify API endpoint in browser DevTools Network tab
3. Check CORS headers

---

## 🎯 Success Criteria

All features working if:

- ✅ Cart items persist after page reload
- ✅ Cart items persist after logout/login
- ✅ Support tickets successfully saved to database
- ✅ Site builder configuration saves and loads correctly
- ✅ All data visible in PostgreSQL database
- ✅ No errors in browser console
- ✅ No errors in Docker logs

---

## 📝 Next Steps

Optional improvements:
1. Add "My Tickets" page to view submitted tickets
2. Add real-time cart sync across multiple tabs
3. Add cart item images from products table
4. Add site builder preview functionality
5. Add notification when ticket status changes

---

## 🐛 Known Issues

- Site builder uses hardcoded tenant ID (`00000000-0000-0000-0000-000000000001`)
  - In production, get from authentication context
- Cart doesn't show product images yet
  - Need to join with products table properly
- No pagination for support tickets
  - Consider adding for large number of tickets

---

## 📞 Support

If you encounter any issues:
1. Check Docker logs: `docker-compose logs -f`
2. Check database connection: Test with psql commands above
3. Verify all services running: `docker ps`
4. Check network connectivity: `docker network inspect pvzzz_default`
