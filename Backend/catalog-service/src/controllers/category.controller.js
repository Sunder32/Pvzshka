const CategoryRepository = require('../repositories/category.repository');
const { getCached, setCached, deleteCached } = require('../config/redis');
const { publishEvent } = require('../config/kafka');

class CategoryController {
  async list(req, res, next) {
    try {
      const tenantId = req.tenantId;
      const { parent_id } = req.query;

      const cacheKey = `categories:${tenantId}:${parent_id || 'root'}`;
      const cached = await getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const categories = await CategoryRepository.findAll({
        tenantId,
        parentId: parent_id,
      });

      await setCached(cacheKey, categories, 600);
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;

      const cacheKey = `category:${tenantId}:${id}`;
      const cached = await getCached(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const category = await CategoryRepository.findById(id, tenantId);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      await setCached(cacheKey, category, 600);
      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const tenantId = req.tenantId;
      const userId = req.userId;
      const categoryData = { ...req.body, tenant_id: tenantId };

      const category = await CategoryRepository.create(categoryData);

      // Publish event
      await publishEvent('catalog.category.created', {
        tenant_id: tenantId,
        category_id: category.id,
        category,
        user_id: userId,
      });

      // Invalidate cache
      await deleteCached(`categories:${tenantId}:*`);

      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const tenantId = req.tenantId;
      const userId = req.userId;
      const { id } = req.params;

      const existing = await CategoryRepository.findById(id, tenantId);
      if (!existing) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const category = await CategoryRepository.update(id, req.body);

      // Publish event
      await publishEvent('catalog.category.updated', {
        tenant_id: tenantId,
        category_id: category.id,
        category,
        user_id: userId,
      });

      // Invalidate cache
      await deleteCached(`category:${tenantId}:${id}`);
      await deleteCached(`categories:${tenantId}:*`);

      res.json(category);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const tenantId = req.tenantId;
      const userId = req.userId;
      const { id } = req.params;

      const existing = await CategoryRepository.findById(id, tenantId);
      if (!existing) {
        return res.status(404).json({ error: 'Category not found' });
      }

      await CategoryRepository.delete(id);

      // Publish event
      await publishEvent('catalog.category.deleted', {
        tenant_id: tenantId,
        category_id: id,
        user_id: userId,
      });

      // Invalidate cache
      await deleteCached(`category:${tenantId}:${id}`);
      await deleteCached(`categories:${tenantId}:*`);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
