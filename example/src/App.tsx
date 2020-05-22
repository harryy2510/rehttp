import React from 'react'
import { useReHttp } from 'rehttp'
const App = () => {
  const res = useReHttp(
    {
      url: 'https://gorest.co.in/public-api/users?_format=json&access-token=G1KYY_HKk953GDfpzWh68Gtn2g7qvRH_uWoA'
    },
    {
      transformResponse: async (data, response) => {
        console.log(data, response)
        if (data) {
          return Promise.reject('sdad')
        }
        return data
      }
    }
  )
  console.log(res)
  return <button onClick={() => res.execute()}>fetch</button>
}

export default App
