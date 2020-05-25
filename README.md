# React + HTTP = ReHttp
> A highly customizable http client library for react


[![npm (scoped)](https://badgen.net/npm/v/@harryy/rehttp)](https://npmjs.com/package/@harryy/rehttp)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
![GitHub](https://badgen.net/github/license/harryy2510/rehttp)
![npm bundle size (scoped)](https://badgen.net/bundlephobia/minzip/@harryy/rehttp)
![npm bundle size (scoped)](https://badgen.net/bundlephobia/min/@harryy/rehttp)
![GitHub top language](https://img.shields.io/github/languages/top/harryy2510/rehttp)
![David](https://img.shields.io/david/harryy2510/rehttp)

## Features

- [x] No bloated dependencies
- [x] Optional global configuration
- [x] Typescript support
- [x] Promise based
- [x] Hooks for function component
- [x] Lazy fetch support
- [x] Transforming request and response
- [x] Callbacks for request, response and error
- [x] Caching
- [x] Use outside of react context
- [x] Component (for class based component)

## Installation

Yarn:

```bash
yarn add @harryy/rehttp
```

NPM:

```bash
npm install @harryy/rehttp
```

## Usage

```tsx
import React from 'react'

import { useReHttp } from 'rehttp'

const Example: React.FC = () => {
    const {data, refetch, loading} = useReHttp({
        url: 'https://jsonplaceholder.typicode.com/posts/1'
    })
    if (loading) {
        return <>Loading...</>
    }
    return (
        <>
            {data.title}
            <button onClick={() => refetch()}>Refetch</button>
        </>
     )
}
```

## API

##### `const {data, response, error, loading, execute, isRequestInFlight, cached} = useReHttp(request, options?)`

By default, request will be fired if `lazy: true` is not passed as an option.

`data` contains json serialized data

`response` contains the raw response from the server

`error` contains the error if any

`loading` is `true` only when there is no data or error

`isRequestInFlight` tells whether the request is in flight or not

`execute` can be called with optional `request` parameters to refetch data again

`cached` gives the cached object if the request was cached earlier


```tsx
import React from 'react'
import { useReHttp, ReHttpRequest, ReHttpResponse } from 'rehttp'

interface Post {
  id: string,
  title: string,
}
interface PostError {
  message: string,
  status: 'NOTOK',
}

useReHttp<Post, PostError>({
    method: 'GET', // Optional, type: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT', default: 'GET'
    url: 'https://jsonplaceholder.typicode.com/posts', // Optional, type: string, default: ''
    headers: {
      Accept: 'application/json'
    }, // Optional, type: Record<string, string>, default: undefined
    params: {
      page: 1,
      per_page: 5,
      tags: ['hello', 'world']
    },  // Optional, type: Record<string, string | number | Array<string | number>>, default: undefined
    body: undefined // Optional, type: any, default: undefined
}, {
  transformError: async (e) => {
    return {
      status: 'NOTOK',
      message: e.message
    }
  }, // Optional, type: (data: any) => Promise<PostError>, default: undefined
  transformResponse: async (data: any, response: ReHttpResponse) => {
      if (data.id && response.status === 200) {
        return {
          id: data.id,
          title: data.title.toUpperCase()
        }
      } else {
        return Promise.reject(new Error('Post has no id'))
      }
  }, // Optional, type: (data: any, response: ReHttpResponse) => Promise<Post>, default: undefined
  transformRequest: async (res: ReHttpRequest) => {
    const token = await SomeAsyncStorageOrApiOrWhatever().token
    return {
      ...res,
      params: {
        foo: 'bar',
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }, // Optional, type: (data: ReHttpRequest) => Promise<ReHttpRequest>, default: undefined
  lazy: true, // Optional, type: boolean, default: false
  noCache: true, // Optional, type: boolean, default: false
});
```


##### Need to use in class component? No Problem!

```tsx
import React from 'react'
import { ReHttp, ReHttpProps } from 'rehttp'

interface Post {
  id: string,
  title: string,
}
interface PostError {
  message: string,
  status: 'NOTOK',
}

class MyComponent extends React.Component {
    reHttpProps: Omit<ReHttpProps<Post, PostError>, 'children'> = {
        method: 'GET', // Optional, type: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT', default: 'GET'
        url: 'https://jsonplaceholder.typicode.com/posts', // Optional, type: string, default: ''
        headers: {
          Accept: 'application/json'
        }, // Optional, type: Record<string, string>, default: { Accept: 'application/json', 'Content-Type': 'application/json' }
        params: {
          page: 1,
          per_page: 5,
          tags: ['hello', 'world']
        },  // Optional, type: Record<string, string | number | Array<string | number>>, default: undefined
        body: undefined, // Optional, type: any, default: undefined
        onRequest: () => {
            showLoader()
        }, //Optional, type: (data: ReHttpRequest) => Promise<void>
        onResponse: () => {
            showSuccess('request success')
        }, //Optional, type: (data: any, response: ReHttpResponse) => Promise<void>
        onError: (error) => {
            showAlert(error.message)
        }, // Optional, type: (error: any) => Promise<void>

        transformError: async (e) => {
            return {
              status: 'NOTOK',
              message: e.message
            }
        }, // Optional, type: (data: any) => Promise<PostError>, default: undefined
        transformResponse: async (data: any, response: ReHttpResponse) => {
          if (data.id && response.status === 200) {
            return {
              id: data.id,
              title: data.title.toUpperCase()
            }
          } else {
            return Promise.reject(new Error('Post has no id'))
          }
        }, // Optional, type: (data: any, response: ReHttpResponse) => Promise<Post>, default: undefined
        transformRequest: async (res: ReHttpRequest) => {
        const token = await SomeAsyncStorageOrApiOrWhatever().token
        return {
          ...res,
          params: {
            foo: 'bar',
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
        }, // Optional, type: (data: ReHttpRequest) => Promise<ReHttpRequest>, default: undefined
        lazy: true, // Optional, type: boolean, default: false
        noCache: true, // Optional, type: boolean, default: false
    }
    render() {
        <ReHttp<Post, PostError> {...this.reHttpProps}>
          {
            ({data, refetch}) => (
              <>
                {data.title}
                <button onClick={() => refetch()}>Refetch</button>
              </>
          )
        </ReHttp>
    }
}
```


##### Need to set options globally? No problem!

#### `ReHttpProvider`

```tsx
import React from 'react'

import { ReHttpProvider, ReHttpProviderProps, ReHttpRequest, ReHttpResponse, InMemoryAdapter } from 'rehttp'

const App: React.FC = () => {
    const options: ReHttpProviderProps = {
        cacheAdapter: new InMemoryAdapter({ttl: 5 * 60 * 1000, size: 50}),  // Optional, type: CacheAdapter, params: {ttl?: 5 * 60* 1000, size?: 50}?, ttl is in milliseconds
        baseUrl: 'https://jsonplaceholder.typicode.com', // Optional, type: string
        method: 'GET', // Optional, type: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
        params: {}, // Optional, type: Record<string, string | number | Array<string | number>>
        headers: {}, // Optional, type: Record<string, string>
        onRequest: () => {
            showLoader()
        }, //Optional, type: (data: ReHttpRequest) => Promise<void>
        onResponse: () => {
            showSuccess('request success')
        }, //Optional, type: (data: any, response: ReHttpResponse) => Promise<void>
        onError: (error) => {
            showAlert(error.message)
        }, // Optional, type: (error: any) => Promise<void>
        onComplete: (dataOrError, response) => {
            hideLoader()
        }, // Optional, type: (dataOrError: any, response?: ReHttpResponse) => Promise<void>
        transformError: async (e) => {
            return {
                status: 'NOTOK',
                message: e.message
            }
        }, // Optional, type: (data: any) => Promise<PostError>, default: undefined
        transformResponse: async (data: any, response: ReHttpResponse) => {
            if (data.id && response.status === 200) {
                return {
                    id: data.id,
                    title: data.title.toUpperCase()
                }
            } else {
                return Promise.reject(new Error('Post has no id'))
            }
        }, // Optional, type: (data: any, response: ReHttpResponse) => Promise<Post>, default: undefined
        transformRequest: async (res: ReHttpRequest) => {
            const token = await SomeAsyncStorageOrApiOrWhatever().token
            return {
                ...res,
                params: {
                    foo: 'bar',
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        }, // Optional, type: (data: ReHttpRequest) => Promise<ReHttpRequest>, default: undefined
        lazy: true, // Optional, type: boolean
    }
    return (
        <ReHttpProvider {...options}>
            <Main />
        </ReHttpProvider>
    )
}
```

##### Need to use it outside of react context (like redux thunk etc.) and still use context values? No Problem!

#### `reHttpInstance`

```tsx
import React from 'react'

import { reHttpInstance } from 'rehttp'

reHttpInstance({
  url: 'https://jsonplaceholder.typicode.com'
}).then(res => {
  console.log('Response from ReHttp', res)
}) // option lazy: true will have no effect here

const MyComponent: React.FC = () => {
    return <div>Hello World!</div>
}
```


## License

MIT © [harryy2510](https://github.com/harryy2510)
