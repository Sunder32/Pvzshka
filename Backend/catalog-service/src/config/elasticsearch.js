import { Client } from '@elastic/elasticsearch';
import { logger } from '../utils/logger.js';

let esClient;

export async function connectElasticsearch() {
  try {
    esClient = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
    });

    // Test connection
    const health = await esClient.cluster.health();
    logger.info('✅ Connected to Elasticsearch:', health.cluster_name);

    // Create indexes if they don't exist
    await createIndexes();

    return esClient;
  } catch (error) {
    logger.error('Failed to connect to Elasticsearch:', error);
    throw error;
  }
}

export function getElasticsearchClient() {
  if (!esClient) {
    throw new Error('Elasticsearch client not initialized');
  }
  return esClient;
}

async function createIndexes() {
  const indexes = ['products', 'categories'];

  for (const index of indexes) {
    const exists = await esClient.indices.exists({ index });
    
    if (!exists) {
      await esClient.indices.create({
        index,
        body: getIndexMapping(index)
      });
      logger.info(`Created Elasticsearch index: ${index}`);
    }
  }
}

function getIndexMapping(index) {
  const mappings = {
    products: {
      mappings: {
        properties: {
          tenant_id: { type: 'keyword' },
          title: { 
            type: 'text',
            analyzer: 'standard',
            fields: {
              keyword: { type: 'keyword' }
            }
          },
          description: { type: 'text' },
          sku: { type: 'keyword' },
          price: { type: 'float' },
          category_id: { type: 'keyword' },
          vendor_id: { type: 'keyword' },
          tags: { type: 'keyword' },
          attributes: { type: 'object' },
          is_active: { type: 'boolean' },
          is_featured: { type: 'boolean' },
          inventory: { type: 'integer' },
          created_at: { type: 'date' },
          updated_at: { type: 'date' }
        }
      }
    },
    categories: {
      mappings: {
        properties: {
          tenant_id: { type: 'keyword' },
          name: { 
            type: 'text',
            fields: {
              keyword: { type: 'keyword' }
            }
          },
          slug: { type: 'keyword' },
          description: { type: 'text' },
          parent_id: { type: 'keyword' },
          is_active: { type: 'boolean' },
          sort_order: { type: 'integer' },
          created_at: { type: 'date' }
        }
      }
    }
  };

  return mappings[index] || {};
}

// Search helpers
export async function indexDocument(index, id, document) {
  try {
    await esClient.index({
      index,
      id,
      body: document,
      refresh: true
    });
  } catch (error) {
    logger.error('Elasticsearch index error:', error);
  }
}

export async function searchDocuments(index, query, tenantId) {
  try {
    const result = await esClient.search({
      index,
      body: {
        query: {
          bool: {
            must: [
              { match: { tenant_id: tenantId } },
              ...query
            ]
          }
        }
      }
    });
    return result.hits.hits.map(hit => ({ id: hit._id, ...hit._source }));
  } catch (error) {
    logger.error('Elasticsearch search error:', error);
    return [];
  }
}

export default { connectElasticsearch, getElasticsearchClient, indexDocument, searchDocuments };
