// src/api.js
import axios from 'axios'

const API = axios.create({
  baseURL: 'http://16.170.240.170:8081/', // ta base URL
})

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) {
    req.headers.Authorization = `Bearer ${token}`
  }
  return req
})

export default API
