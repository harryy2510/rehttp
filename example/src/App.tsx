import React from 'react'
import { useReHttp, ReHttpProvider, ReHttp, reHttpInstance, InMemoryAdapter } from 'rehttp'

const url = 'https://gorest.co.in/public-api/users?_format=json&access-token=RWyK6NPI2irjKOF3HigQxn04nPnK6wJwJcul'

const ComponentA = () => {
  const res = useReHttp({ url })
  console.log(res)
  React.useEffect(() => {
    setTimeout(() => {
      reHttpInstance({ url }).then(res => {
        console.log('Response from ReHttp', res)
      })
    }, 3000)
  }, [])
  return <button onClick={() => res.execute()}>fetch</button>
}
const ComponentB = () => {
  return (
    <ReHttp url={url}>
      {({ execute, data }) => {
        console.log(data)
        return <button onClick={() => execute()}>fetch</button>
      }}
    </ReHttp>
  )
}
const App = () => {
  return (
    <ReHttpProvider cacheAdapter={new InMemoryAdapter()}>
      <ComponentA />
      <ComponentB />
    </ReHttpProvider>
  )
}

export default App
