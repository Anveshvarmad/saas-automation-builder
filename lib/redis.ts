export function getRedisConnection() {
  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6380";
  const url = new URL(redisUrl);

  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
  };
}
