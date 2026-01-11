/**
 * Storage module exports
 *
 * Re-exports all storage adapters for cleaner imports.
 *
 * @example
 * import { createRedisStorage, checkRedisConnection } from "./storage";
 */

export {
  checkRedisConnection,
  createRedisStorage,
  UpstashRedisStorage,
} from "./redis.js";
