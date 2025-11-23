import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://16.170.240.170:8081/api/v1',
})

// Ajouter un interceptor pour injecter automatiquement le token dans chaque requête
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axiosInstance
