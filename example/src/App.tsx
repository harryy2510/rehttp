import React from 'react'
import { useReHttp, ReHttpProvider } from 'rehttp'
const Component = () => {
  const res = useReHttp({
    url: 'https://gorest.co.in/public-api/users?_format=json&access-token=RWyK6NPI2irjKOF3HigQxn04nPnK6wJwJcul'
  })
  console.log(res)
  return <button onClick={() => res.execute()}>fetch</button>
}
const App = () => {
  return (
    <ReHttpProvider>
      <Component />
    </ReHttpProvider>
  )
}

export default App
