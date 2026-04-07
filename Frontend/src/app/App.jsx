import React from 'react'
import { RouterProvider } from 'react-router'
import { router } from '../app/app.routes.jsx'
import { useAuth } from '../features/auth/hook/useAuth.js'
import { useEffect } from 'react'
const App = () => {
  
  const auth = useAuth()
  useEffect(()=>{
    auth.handleGetMe();
  },[])
  return (
    <RouterProvider router={router} />
  )
}

export default App