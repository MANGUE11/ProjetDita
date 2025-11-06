// src/Routes.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Signup from './pages/Signup'
import FindAPartner from './pages/FindAPartner'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import PrivateRoute from './components/PrivateRoute'
import AboutUs from './pages/AboutUs.jsx'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path='signup' element={<Signup />} />
        <Route path='find-a-partner' element={<FindAPartner />} />
        <Route path='login' element={<LoginPage />} />
        {/* La Route pour votre page AboutUs */}
        <Route path='/about' element={<AboutUs />} />
        <Route
          path='/profile'
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default AppRoutes
