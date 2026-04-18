<p align="center">
  <h1 align="center">ReHttp</h1>
  <p align="center">
    <strong>Lightweight HTTP client for React with hooks, caching, and transforms.</strong>
  </p>
  <p align="center">
    <code>useReHttp hook</code> · <code>class components</code> · <code>outside React</code> · <code>in-memory cache</code>
  </p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@harryy/rehttp"><img src="https://img.shields.io/npm/v/@harryy/rehttp.svg?style=flat-square" alt="npm"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React_16.8%2B-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></a>
</p>

---

> **Note:** This project is archived. For new projects, consider React Query or SWR.

---

## Install

```bash
npm install @harryy/rehttp
```

---

## Usage

### Hook

```tsx
import { useReHttp } from '@harryy/rehttp'

function Posts() {
  const { data, loading, error, execute } = useReHttp<Post[]>({
    method: 'GET',
    url: '/api/posts'
  })

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <ul>
      {data.map(post => <li key={post.id}>{post.title}</li>)}
    </ul>
  )
}
```

### Lazy fetch

```tsx
const { data, execute } = useReHttp<User>(
  { method: 'POST', url: '/api/users' },
  { lazy: true }
)

const handleSubmit = (body) => execute({ body })
```

### Provider (global config)

```tsx
import { ReHttpProvider, InMemoryAdapter } from '@harryy/rehttp'

function App() {
  return (
    <ReHttpProvider
      baseUrl="https://api.example.com"
      cacheAdapter={new InMemoryAdapter({ ttl: 5 * 60 * 1000, size: 50 })}
      cacheMethods={['GET']}
      transformRequest={(req) => ({
        ...req,
        headers: { ...req.headers, Authorization: `Bearer ${token}` }
      })}
    >
      <MyApp />
    </ReHttpProvider>
  )
}
```

### Class components

```tsx
import { ReHttp } from '@harryy/rehttp'

<ReHttp<Post> url="/api/posts/1" method="GET">
  {({ data, refetch }) => <div>{data.title}</div>}
</ReHttp>
```

### Outside React

```tsx
import { reHttpInstance } from '@harryy/rehttp'

const response = await reHttpInstance({ url: '/api/posts' })
```

---

## API

### `useReHttp<T, E>(request, options?)`

**Request:** `method`, `url`, `headers`, `params`, `body`

**Options:** `lazy`, `noCache`, `transformRequest`, `transformResponse`, `transformError`

**Returns:**

```
  PROPERTY            TYPE              DESCRIPTION
  --------            ----              -----------
  data                T | null          Response body
  response            object            Full response (headers, status)
  error               E | null          Error object
  loading             boolean           True when no data or error yet
  cached              object | null     Cache metadata if from cache
  isRequestInFlight   boolean           True during active request
  execute             function          Refetch or change request params
```

---

## Features

```
  ┌─────────────────────────────────────────────────────────┐
  │                                                         │
  │  Three APIs        Hook, class component, non-React     │
  │  Caching           In-memory with configurable TTL      │
  │  Transforms        Request / response / error pipeline  │
  │  Lifecycle         onRequest, onResponse, onError       │
  │  Lazy fetch        Manual control over when to fire     │
  │  TypeScript        Full generics for data and errors    │
  │                                                         │
  └─────────────────────────────────────────────────────────┘
```

---

## License

MIT
