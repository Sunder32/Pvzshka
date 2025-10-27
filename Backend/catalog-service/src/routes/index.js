const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const ProductController = require('../controllers/product.controller');
const CategoryController = require('../controllers/category.controller');
const { authenticate, extractTenant } = require('../middleware/auth');

const router = express.Router();

// Middleware
router.use(extractTenant);

// Categories
router.get('/categories', CategoryController.list);
router.get('/categories/:id', param('id').isUUID(), CategoryController.getById);
router.post('/categories', 
  authenticate,
  body('name').trim().notEmpty(),
  body('parent_id').optional().isUUID(),
  CategoryController.create
);
router.put('/categories/:id',
  authenticate,
  param('id').isUUID(),
  body('name').trim().notEmpty(),
  CategoryController.update
);
router.delete('/categories/:id',
  authenticate,
  param('id').isUUID(),
  CategoryController.delete
);

// Products
router.get('/products', ProductController.list);
router.get('/products/search', 
  query('q').trim().notEmpty(),
  ProductController.search
);
router.get('/products/:id', param('id').isUUID(), ProductController.getById);
router.post('/products',
  authenticate,
  body('name').trim().notEmpty(),
  body('category_id').isUUID(),
  body('price').isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  ProductController.create
);
router.put('/products/:id',
  authenticate,
  param('id').isUUID(),
  ProductController.update
);
router.delete('/products/:id',
  authenticate,
  param('id').isUUID(),
  ProductController.delete
);

// Validation error handler
router.use((req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
});

module.exports = router;
