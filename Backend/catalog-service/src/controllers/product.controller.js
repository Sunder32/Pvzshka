const ProductRepository = require('../repositories/product.repository');
const { indexProduct, searchProducts, deleteProductFromIndex } = require('../config/elasticsearch');
const { getCached, setCached, deleteCached } = require('../config/redis');
const { publishEvent } = require('../config/kafka');

class ProductController {
  async list(req, res, next) {
    try {
      const tenantId = req.tenantId;
      const { category_id, vendor_id, limit = 20, offset = 0 } = req.query;

      const cacheKey = `products:${tenantId}:${category_id || 'all'}:${vendor_id || 'all'}:${limit}:${offset}`;
      const cached = await getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const products = await ProductRepository.findAll({
        tenantId,
        categoryId: category_id,
        vendorId: vendor_id,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      await setCached(cacheKey, products, 300);
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const tenantId = req.tenantId;
      const { q, category_id, price_min, price_max, limit = 20, offset = 0 } = req.query;

      const results = await searchProducts(tenantId, {
        query: q,
        categoryId: category_id,
        priceMin: price_min ? parseFloat(price_min) : undefined,
        priceMax: price_max ? parseFloat(price_max) : undefined,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      const cacheKey = `product:${tenantId}:${id}`;
      const cached = await getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const product = await ProductRepository.findById(id, tenantId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await setCached(cacheKey, product, 600);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const tenantId = req.tenantId;
      const userId = req.userId;
      const productData = { ...req.body, tenant_id: tenantId };

      const product = await ProductRepository.create(productData);

      // Index in Elasticsearch
      await indexProduct(product);

      // Publish event
      await publishEvent('catalog.product.created', {
        tenant_id: tenantId,
        product_id: product.id,
        product,
        user_id: userId,
      });

      // Invalidate cache
      await deleteCached(`products:${tenantId}:*`);

      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const tenantId = req.tenantId;
      const userId = req.userId;
      const { id } = req.params;

      const existing = await ProductRepository.findById(id, tenantId);
      if (!existing) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const product = await ProductRepository.update(id, req.body);

      // Update Elasticsearch index
      await indexProduct(product);

      // Publish event
      await publishEvent('catalog.product.updated', {
        tenant_id: tenantId,
        product_id: product.id,
        product,
        user_id: userId,
      });

      // Invalidate cache
      await deleteCached(`product:${tenantId}:${id}`);
      await deleteCached(`products:${tenantId}:*`);

      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const tenantId = req.tenantId;
      const userId = req.userId;
      const { id } = req.params;

      const existing = await ProductRepository.findById(id, tenantId);
      if (!existing) {
        return res.status(404).json({ error: 'Product not found' });
      }

      await ProductRepository.delete(id);

      // Delete from Elasticsearch
      await deleteProductFromIndex(id);

      // Publish event
      await publishEvent('catalog.product.deleted', {
        tenant_id: tenantId,
        product_id: id,
        user_id: userId,
      });

      // Invalidate cache
      await deleteCached(`product:${tenantId}:${id}`);
      await deleteCached(`products:${tenantId}:*`);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
