const cache = new Map();

function setCache(key, data, ttl = 60) {
  const expires = Date.now() + ttl * 1000;
  cache.set(key, { data, expires });
}

function getCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;

  if (cached.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  return cached.data;
}

export { getCache, setCache };
