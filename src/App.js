import React, { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import 'font-awesome/css/font-awesome.min.css'
import AppRoutes from './Routes'
import ScrollToTop from './components/ScrollToTop'

function App() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true })
  }, [])

  return (
    <div className='App'>
      <ScrollToTop />
      <AppRoutes />
    </div>
  )
}

export default App
