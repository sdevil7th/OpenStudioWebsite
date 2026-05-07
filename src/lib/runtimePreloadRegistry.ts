const modulePreloadCache = new Map<string, Promise<unknown>>();

export const preloadModuleOnce = <T>(key: string, loader: () => Promise<T>) => {
  const cached = modulePreloadCache.get(key) as Promise<T> | undefined;

  if (cached) {
    return cached;
  }

  const promise = loader();
  modulePreloadCache.set(key, promise);
  void promise.catch(() => {
    modulePreloadCache.delete(key);
  });

  return promise;
};

