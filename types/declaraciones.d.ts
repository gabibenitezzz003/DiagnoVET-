// Declaraciones de tipos para librerías sin tipos oficiales

declare module 'compromise' {
  interface CompromiseStatic {
    (text: string): any;
  }
  const compromise: CompromiseStatic;
  export = compromise;
}

declare module 'node-cache' {
  interface NodeCacheOptions {
    stdTTL?: number;
    checkperiod?: number;
    useClones?: boolean;
  }

  class NodeCache {
    constructor(options?: NodeCacheOptions);
    set(key: string, value: any, ttl?: number): boolean;
    get(key: string): any;
    del(key: string): number;
    has(key: string): boolean;
    keys(): string[];
    flushAll(): void;
  }

  export = NodeCache;
}
