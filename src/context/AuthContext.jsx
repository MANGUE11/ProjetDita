import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  const fetchUserByEmail = async (email) => {
    try {
      const token = localStorage.getItem('token') // ✅ Récupération du token
      const API_URL = process.env.REACT_APP_API_URL

      const res = await axios.get(
        `${API_URL}/api/v1/users/get-by-email/${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ En-tête sécurisé
          },
        }
      )

      console.log('✅ Utilisateur récupéré :', res.data)
      setUser(res.data)
    } catch (err) {
      console.error('❌ Erreur fetchUserByEmail:', err)
      setUser(null)
    }
  }

  const login = async ({ email }) => {
    setUser(null) // Réinitialisation
    localStorage.setItem('user', JSON.stringify({ email }))
    await fetchUserByEmail(email)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      const email = JSON.parse(storedUser).email
      fetchUserByEmail(email)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
