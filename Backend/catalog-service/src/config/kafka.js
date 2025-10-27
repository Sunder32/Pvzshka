import { Kafka } from 'kafkajs';

let kafka = null;
let producer = null;

export async function initKafka() {
  try {
    kafka = new Kafka({
      clientId: 'catalog-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    producer = kafka.producer({
      idempotent: true,
      maxInFlightRequests: 5,
      transactionalId: 'catalog-service-producer',
    });

    await producer.connect();
    console.log('✅ Kafka producer connected');

    return producer;
  } catch (error) {
    console.warn('⚠️ Kafka not available, running without Kafka:', error.message);
    producer = null;
    return null;
  }
}

export async function publishEvent(topic, message) {
  if (!producer) {
    console.warn('Kafka producer not initialized, skipping event');
    return false;
  }

  try {
    await producer.send({
      topic,
      messages: [
        {
          key: message.tenant_id || 'default',
          value: JSON.stringify(message),
          timestamp: Date.now().toString(),
        }
      ]
    });
    return true;
  } catch (error) {
    console.error('Failed to publish Kafka event:', error);
    return false;
  }
}

export async function closeKafka() {
  if (producer) {
    await producer.disconnect();
    console.log('✅ Kafka producer disconnected');
  }
}

export default {
  initKafka,
  publishEvent,
  closeKafka,
};
