import { createClient } from 'redis';

const pubClient = createClient({
  url: process.env.REDIS_URI
});

const subClient = pubClient.duplicate();

await Promise.all([ pubClient.connect(), subClient.connect() ]);

export { pubClient, subClient };