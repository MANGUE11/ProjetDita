// src/pages/LoginPage.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await axios.post(
        'http://16.170.240.170:8081/api/v1/auth/signin',
        { email, password, code: '' },
        { headers: { 'Content-Type': 'application/json' } }
      )

      const token = response.data.token

      // Sauvegarder le token et l’email
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify({ email }))

      // Appel à login() qui va charger les infos complètes
      await login({ email })

      navigate('/')
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Email ou mot de passe incorrect, réessayez.'
      )
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='bg-white p-8 rounded shadow-md w-full max-w-md'>
        <h2 className='text-2xl font-bold mb-6 text-center text-red-700'>
          Connexion
        </h2>
        {error && <p className='text-red-500 mb-4'>{error}</p>}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full border p-2 rounded'
            required
          />
          <input
            type='password'
            placeholder='Mot de passe'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full border p-2 rounded'
            required
          />
          <button
            type='submit'
            className='w-full bg-red-700 text-white p-2 rounded hover:bg-red-800'
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
