// src/services/authService.js
import API from '../api'

export const login = (email, password) =>
  API.post('/api/v1/auth/signin', {
    email,
    password,
  })
