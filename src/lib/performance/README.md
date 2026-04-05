# Performance Utilities Documentation

## Overview

The `src/lib/performance/` package provides production-ready utilities for:
- **Rate Limiting**: Prevent API throttling and abuse
- **Caching**: Improve response times and reduce computations
- **Memory Management**: Prevent memory leaks and optimize resource usage
- **Performance Profiling**: Monitor and analyze application performance

## Installation

All utilities are already included. Import from `src/lib/performance/`:

```typescript
import {
  RateLimiter,
  Cache,
  DisposableGroup,
  PerformanceProfiler,
  defaultProfiler,
} from '@/lib/performance';
```

## Rate Limiting

### Token Bucket Rate Limiter

Implements the token bucket algorithm for fair rate limiting.

```typescript
import { RateLimiter } from '@/lib/performance';

// Create limiter: 10 tokens, refill at 1 token/second
const limiter = new RateLimiter(10, 1);

// Check if request is allowed
if (limiter.isAllowed(1)) {
  // Process request
  limiter.consume(1);
}

// Get time until next token
const waitMs = limiter.getWaitTime();
```

### Throttling Functions

Execute a function at most once per interval.

```typescript
import { createThrottle } from '@/lib/performance';

const handleScroll = createThrottle(() => {
  console.log('Scroll event');
}, 1000); // Max once per second

window.addEventListener('scroll', handleScroll);
```

### Debouncing Functions

Execute a function after a delay without further calls.

```typescript
import { createDebounce } from '@/lib/performance';

const handleInputChange = createDebounce((text: string) => {
  console.log('Final value:', text);
}, 500); // Execute 500ms after last call

input.addEventListener('input', (e) => {
  handleInputChange(e.target.value);
});
```

### Operation Throttler

Limit concurrent operations.

```typescript
import { OperationThrottler } from '@/lib/performance';

const throttler = new OperationThrottler(3); // Max 3 concurrent

async function processFile(file: File) {
  return throttler.execute(async () => {
    // This runs with max 3 concurrent
    return await fileProcessor.process(file);
  });
}
```

### Pre-configured Rate Limiters

```typescript
import { rateLimiters } from '@/lib/performance';

// File uploads: 5 per 10 seconds
if (rateLimiters.fileUpload.consume()) {
  uploadFile();
}

// API calls: 20 per 10 seconds
if (rateLimiters.apiCall.consume()) {
  makeAPICall();
}

// AI operations: 2 per minute (strict)
if (rateLimiters.aiOperation.consume()) {
  callAI();
}
```

## Caching

### Simple Cache with TTL

Store values with automatic expiration.

```typescript
import { Cache } from '@/lib/performance';

const cache = new Cache(60000); // 60 second TTL

// Set value
cache.set('user:123', userData);

// Get value
const data = cache.get('user:123');

// Get or compute
const result = await cache.getOrCompute('expensive:key', async () => {
  return await expensiveComputation();
}, 300000); // 5 minute TTL for this entry

// Check existence
if (cache.has('key')) {
  // ...
}

// Clean up expired entries
const removed = cache.prune();
```

### LRU Cache

Automatically evict least recently used items.

```typescript
import { LRUCache } from '@/lib/performance';

const lru = new LRUCache(100, 600000); // Max 100 items, 10 min TTL

// Access and update position
const value = lru.get('key');

// Set new value
lru.set('key', newValue);

lru.delete('key');
lru.clear();
```

### Memoization

Cache function results.

```typescript
import { createMemoize, createAsyncMemoize } from '@/lib/performance';

// Synchronous memoization
const fibonacci = createMemoize(
  (n: number): number => {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  },
  { maxSize: 100 }
);

// Async memoization
const fetchUser = createAsyncMemoize(
  async (userId: string) => {
    return await api.getUser(userId);
  },
  { ttlMs: 300000, maxSize: 50 }
);

const user = await fetchUser('123');
```

### Pre-configured Caches

```typescript
import { caches } from '@/lib/performance';

// Store API responses (5 minutes)
caches.apiResponses.set('endpoint', data);

// Store file metadata (10 minutes)
caches.fileMetadata.set('file.pdf', metadata);

// Store user preferences (1 hour)
caches.userPreferences.set('settings', settings);

// LRU for media (50 items, 30 minutes)
caches.mediaLRU.set('image.jpg', imageData);
```

## Memory Management

### Disposable Resources

Manage resources that need cleanup.

```typescript
import { DisposableGroup } from '@/lib/performance';

const resources = new DisposableGroup();

// Add disposables
const file = resources.add(new FileHandle());
const connection = resources.add(new DatabaseConnection());

// Add cleanup functions
resources.addCallback(() => {
  console.log('Cleanup');
});

// Clean up all
resources.dispose();
```

### Object Pool

Reuse objects to reduce garbage collection.

```typescript
import { ObjectPool } from '@/lib/performance';

const bufferPool = new ObjectPool(
  () => new ArrayBuffer(1024), // Factory
  (buf) => {} // Reset function
);

// Acquire from pool
const buffer = bufferPool.acquire();

// Use buffer
processBuffer(buffer);

// Return to pool
bufferPool.release(buffer);

// Get statistics
const stats = bufferPool.getStats();
// { available: 5, inUse: 2, total: 7 }
```

### Batch Processor

Process items in batches for efficiency.

```typescript
import { BatchProcessor } from '@/lib/performance';

const batchProcessor = new BatchProcessor(
  async (items: string[]) => {
    return await api.processBatch(items);
  },
  50 // Batch size
);

// Add items (automatically batched)
await batchProcessor.add('item1');
await batchProcessor.add('item2');

// Flush remaining items
await batchProcessor.flush();
```

### Memory Monitor

Track memory usage trends.

```typescript
import { MemoryMonitor } from '@/lib/performance';

const monitor = new MemoryMonitor(5000); // Sample every 5 seconds
monitor.start();

// Later...
const stats = monitor.getStats();
// {
//   current: 50000000,
//   average: 48000000,
//   min: 40000000,
//   max: 60000000,
//   trend: 'stable'
// }

monitor.stop();
```

## Performance Profiling

### Basic Profiling

Profile function execution.

```typescript
import { profileAsync, profileSync, defaultProfiler } from '@/lib/performance';

// Async profiling
const result = await profileAsync('fetch-data', async () => {
  return await fetchData();
}, { source: 'api' });

// Sync profiling
const processed = profileSync('process-data', () => {
  return processData();
}, { size: 1000 });

// Get reports
const report = defaultProfiler.getMetricReport('fetch-data');
// {
//   name: 'fetch-data',
//   count: 10,
//   averageDuration: 245.5,
//   minDuration: 200,
//   maxDuration: 300,
//   errorCount: 0,
//   successRate: 100
// }
```

### Manual Profiling

Use marks and measures.

```typescript
import { defaultProfiler } from '@/lib/performance';

defaultProfiler.mark('operation-start');

// Do work
await heavyOperation();

const duration = defaultProfiler.measure('operation', 'operation-start');
console.log(`Operation took ${duration}ms`);
```

### Method Decorators

Profile class methods automatically.

```typescript
import { AsyncProfiled, SyncProfiled } from '@/lib/performance';

class DataService {
  @AsyncProfiled('fetch-users')
  async fetchUsers() {
    return await api.getUsers();
  }

  @SyncProfiled('parse-json')
  parseJSON(json: string) {
    return JSON.parse(json);
  }
}
```

### Performance Reports

Get comprehensive metrics.

```typescript
import { defaultProfiler } from '@/lib/performance';

// Summary of all metrics
const summary = defaultProfiler.getSummary();
// {
//   totalMetrics: 150,
//   totalOperations: 10,
//   averageDuration: 125.3,
//   totalErrors: 2,
//   successRate: 98.67
// }

// All reports
const reports = defaultProfiler.getAllReports();
reports.forEach(report => {
  console.log(`${report.name}: ${report.averageDuration}ms`);
});

// Filter by tags
const apiMetrics = defaultProfiler.getMetricsByTag('source', 'api');
```

## Best Practices

### 1. Use Rate Limiters for External APIs

```typescript
import { rateLimiters } from '@/lib/performance';

async function callAPI() {
  if (!rateLimiters.apiCall.consume()) {
    throw new Error('Rate limit reached');
  }
  return await fetch('/api/endpoint');
}
```

### 2. Cache Expensive Operations

```typescript
const result = await caches.apiResponses.getOrCompute(
  `user:${id}`,
  () => api.getUser(id),
  300000 // 5 minutes
);
```

### 3. Use Object Pools for Frequently Created Objects

```typescript
const pool = new ObjectPool(
  () => new LargeObject(),
  (obj) => obj.reset()
);

for (let i = 0; i < 1000; i++) {
  const obj = pool.acquire();
  try {
    processObject(obj);
  } finally {
    pool.release(obj);
  }
}
```

### 4. Monitor Memory in Development

```typescript
if (process.env.NODE_ENV === 'development') {
  const monitor = new MemoryMonitor();
  monitor.start();

  // Later, log memory trend
  console.log(monitor.getStats());
}
```

### 5. Profile Critical Code Paths

```typescript
const result = await profileAsync('critical-operation', async () => {
  return await criticalFunction();
}, { importance: 'high' });
```

## Usage in Components

### React Example: Debounced Search

```typescript
import { createDebounce } from '@/lib/performance';
import { useState } from 'react';

export function SearchUsers() {
  const [results, setResults] = useState([]);

  const debouncedSearch = createDebounce(async (query: string) => {
    if (query.length < 2) return;
    const data = await fetch(`/api/search?q=${query}`);
    setResults(await data.json());
  }, 500);

  return (
    <input
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### React Example: Throttled Scroll Handler

```typescript
import { createThrottle } from '@/lib/performance';
import { useEffect } from 'react';

export function InfiniteScroll() {
  useEffect(() => {
    const handleScroll = createThrottle(() => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      
      if (scrollTop + window.innerHeight >= scrollHeight - 500) {
        loadMore();
      }
    }, 1000);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <div>{/* content */}</div>;
}
```

### React Example: Cached Data Fetching

```typescript
import { caches } from '@/lib/performance';
import { useEffect, useState } from 'react';

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    caches.apiResponses.getOrCompute(
      `user:${userId}`,
      async () => {
        const res = await fetch(`/api/users/${userId}`);
        return res.json();
      },
      300000 // 5 minutes
    ).then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

## Performance Tips

1. **Throttle scroll/resize events** to 60fps (16ms)
2. **Debounce search/input** at 200-500ms
3. **Cache API responses** for 5-10 minutes
4. **Use LRU cache** for bounded memory usage
5. **Profile in production** with sampling
6. **Monitor memory trends** for leaks
7. **Batch operations** with BatchProcessor
8. **Reuse objects** with ObjectPool for hot paths

## Troubleshooting

### High Memory Usage
- Check if caches are growing unbounded
- Use LRUCache instead of Cache for bounded size
- Call `cache.prune()` periodically
- Monitor with MemoryMonitor

### Rate Limit Errors
- Reduce request rate or batch requests
- Use RequestDeduplicator to merge simultaneous requests
- Implement exponential backoff retry logic

### Performance Regressions
- Compare metric reports over time
- Check for cache misses
- Profile hot code paths
- Look for memory leaks in MemoryMonitor

## API Reference

See individual files in `src/lib/performance/` directory:
- `rateLimit.ts` - Rate limiting and throttling
- `cache.ts` - Caching strategies
- `memory.ts` - Memory management
- `profiling.ts` - Performance monitoring
- `index.ts` - Package exports
