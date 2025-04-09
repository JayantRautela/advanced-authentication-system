import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login.tsx'
import Signup from './pages/Signup.tsx'
import Home from './pages/Home.tsx'
import NotFound from './pages/NotFound.tsx'
import OtpLogin from './pages/OtpLogin.tsx'
import { Toaster } from './components/ui/sonner.tsx'

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Home/>
  },
  {
    path: '/login',
    element: <Login/>
  },
  {
    path: '/signup',
    element: <Signup/>
  },
  {
    path: '/otp-login',
    element: <OtpLogin/>
  },
  {
    path: '*',
    element: <NotFound/>
  }
])

function App() {

  return (
    <>
      <RouterProvider router={appRouter}></RouterProvider>
      <Toaster />
    </>
  )
}

export default App
