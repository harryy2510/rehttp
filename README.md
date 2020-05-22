# React + HTTP = ReHTTP
> A highly customizable http client library for react


[![npm (scoped)](https://img.shields.io/npm/v/@harryy/rehttp)](https://npmjs.com/package/@harryy/rehttp)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
![GitHub](https://img.shields.io/github/license/harryy2510/rehttp)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@harryy/rehttp)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@harryy/rehttp)
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
- [ ] Caching
- [ ] Use outside of react context
- [ ] HOC & Component (for class based component)

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

### `const {data, response, error, loading, execute, isRequestInFlight} = useReHttp(request, options?)`

By default, request will be fired if `lazy: true` is not passed as an option.

`data` contains json serialized data

`response` contains the raw response from the server

`error` contains the error if any

`loading` is `true` only when there is no data or error

`isRequestInFlight` tells whether the request is in flight or not

`execute` can be called with optional `request` parameters to refetch data again


```tsx
import React from 'react'
import { useReHttp, ReRequest } from 'rehttp'

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
    }, // Optional, type: Record<string, string>, default: { Accept: 'application/json', 'Content-Type': 'application/json' }
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
  transformResponse: async (data: any, response: Response) => {
      if (data.id && response.status === 200) {
        return {
          id: data.id,
          title: data.title.toUpperCase()
        }
      } else {
        return Promise.reject(new Error('Post has no id'))
      }
  }, // Optional, type: (data: any, response: Response) => Promise<Post>, default: undefined
  transformRequest: async (res: ReRequest) => {
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
  }, // Optional, type: (data: ReRequest) => Promise<ReRequest>, default: undefined
  lazy: true, // Optional, type: boolean, default: false
});
```


#### Need to set options globally? No problem!

### `ReHttpProvider`

```tsx
import React from 'react'

import { ReHttpProvider, ReHttpProviderProps } from 'rehttp'

const App: React.FC = () => {
    const options: ReHttpProviderProps = {
        baseUrl: 'https://jsonplaceholder.typicode.com', // Optional, type: string
        method: 'GET', // Optional, type: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
        params: {}, // Optional, type: Record<string, string | number | Array<string | number>>
        headers: {}, // Optional, type: Record<string, string>
        onRequest: () => {
            showLoader()
        }, //Optional, type: (data: ReRequest) => Promise<void>
        onResponse: () => {
            showSuccess('request success')
        }, //Optional, type: (data: any, response: Response) => Promise<void>
        onError: (error) => {
            showAlert(error.message)
        }, // Optional, type: (error: any) => Promise<void>
        onComplete: (dataOrError, response) => {
            hideLoader()
        }, // Optional, type: (dataOrError: any, response?: Response) => Promise<void>
        transformError: async (e) => {
            return {
                status: 'NOTOK',
                message: e.message
            }
        }, // Optional, type: (data: any) => Promise<PostError>, default: undefined
        transformResponse: async (data: any, response: Response) => {
            if (data.id && response.status === 200) {
                return {
                    id: data.id,
                    title: data.title.toUpperCase()
                }
            } else {
                return Promise.reject(new Error('Post has no id'))
            }
        }, // Optional, type: (data: any, response: Response) => Promise<Post>, default: undefined
        transformRequest: async (res: ReRequest) => {
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
        }, // Optional, type: (data: ReRequest) => Promise<ReRequest>, default: undefined
        lazy: true, // Optional, type: boolean
    }
    return (
        <ReHttpProvider {...options}>
            <Main />
        </ReHttpProvider>
    )
}
```


## License

MIT © [harryy2510](https://github.com/harryy2510)
