import axios from 'axios'

// Crée une instance axios avec config de base
const axiosInstance = axios.create({
  baseURL: 'http://13.51.235.99:8081/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter automatiquement le token à chaque requête (si présent)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default axiosInstance
