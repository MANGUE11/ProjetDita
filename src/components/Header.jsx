import React, { useState, useEffect } from 'react'
import logo from '../assets/logo.png'
import { FiMenu, FiX } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const [photoUrl, setPhotoUrl] = useState(null)
  const [isPulsing, setIsPulsing] = useState(false)
  const [loadingLogout, setLoadingLogout] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    if (user?.photos) {
      const profilePhoto = user.photos.find(
        (p) => p.type === 'PROFILE' && p.approved && p.valid
      )
      if (profilePhoto) {
        const token = localStorage.getItem('token')
        axios
          .get(
            `http://16.170.240.170:8081/api/v1/profile/view/${profilePhoto.photoKey}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: '*/*',
              },
              responseType: 'blob',
            }
          )
          .then((res) => {
            if (!isMounted) return
            const url = URL.createObjectURL(res.data)
            setPhotoUrl(url)
          })
          .catch((err) => {
            console.error('Erreur chargement photo:', err)
            setPhotoUrl(null)
          })
      }
    }
    return () => {
      isMounted = false
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl)
      }
    }
  }, [user])

  useEffect(() => {
    if (user?.profileVerified) {
      setIsPulsing(true)
      const timeout = setTimeout(() => {
        setIsPulsing(false)
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [user?.profileVerified])

  const handleLogout = async () => {
    try {
      setLoadingLogout(true)
      if (photoUrl) URL.revokeObjectURL(photoUrl)
      await logout()
      toast.success('Déconnecté avec succès')
      navigate('/login')
    } catch (err) {
      console.error('Erreur logout:', err)
      toast.error('Erreur lors de la déconnexion')
    } finally {
      setLoadingLogout(false)
    }
  }

  return (
    <header className='bg-red-700 fixed top-0 left-0 w-full z-30 py-4 px-6'>
      <div className='max-w-screen-xl mx-auto flex justify-between items-center'>
        <Link to='/'>
          <img src={logo} alt='DIYA Logo' className='h-12' />
        </Link>

        {/* Desktop navigation */}
        <nav className='hidden md:flex space-x-6 text-white items-center'>
          <Link to='/' className='hover:text-red-300'>
            Accueil
          </Link>
          <a href='/about' className='hover:text-pink-300'>
            A propos
          </a>
          <Link to='/find-a-partner' className='hover:text-red-300'>
            Trouver un partenaire
          </Link>
          <a href='#' className='hover:text-pink-300'>
            Contacts
          </a>

          {user ? (
            <>
              <Link to='/profile' className='hover:text-pink-300'>
                Mon Profil
              </Link>
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt='Photo profil'
                  className={`w-9 h-9 rounded-full object-cover mr-2 border-2 transition-all duration-300 ${
                    user.profileVerified
                      ? isPulsing
                        ? 'border-green-500 animate-pulse-green'
                        : 'border-green-500'
                      : 'border-gray-300'
                  }`}
                />
              )}
              <span className='text-white'>
                Bienvenue, {user.firstName} {user.lastName}
              </span>
              <button
                onClick={handleLogout}
                className='bg-white text-red-700 px-4 py-2 rounded-full hover:bg-gray-100 ml-4'
                disabled={loadingLogout}
              >
                {loadingLogout ? 'Déconnexion...' : 'Déconnexion'}
              </button>
            </>
          ) : (
            <>
              <Link
                to='/login'
                className='bg-custom text-white px-4 py-2 rounded-full hover:bg-gray-700'
              >
                Se connecter
              </Link>
              <Link
                to='/signup'
                className='bg-custom text-white px-4 py-2 rounded-full hover:bg-gray-700'
              >
                S'inscrire
              </Link>
            </>
          )}
        </nav>

        {/* Mobile button */}
        <button
          onClick={() => setIsOpen(true)}
          className='md:hidden text-white text-2xl'
        >
          <FiMenu />
        </button>
      </div>

      {/* Mobile side menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-red-800 text-white transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='flex justify-between items-center px-6 py-4 border-b border-white/20'>
          <span className='font-bold text-xl'>Menu</span>
          <button onClick={() => setIsOpen(false)} className='text-2xl'>
            <FiX />
          </button>
        </div>
        <nav className='flex flex-col px-6 py-4 space-y-4'>
          <Link
            to='/'
            onClick={() => setIsOpen(false)}
            className='hover:text-pink-300'
          >
            Accueil
          </Link>
          <Link
            to='/about'
            onClick={() => setIsOpen(false)}
            className='hover:text-pink-300'
          >
            A propos
          </Link>
          <Link
            to='/partenaires'
            onClick={() => setIsOpen(false)}
            className='hover:text-pink-300'
          >
            Trouver partenaires
          </Link>
          <Link
            to='/contact'
            onClick={() => setIsOpen(false)}
            className='hover:text-pink-300'
          >
            Contacts
          </Link>
          {user ? (
            <>
              <Link
                to='/profile'
                onClick={() => setIsOpen(false)}
                className='hover:text-pink-300'
              >
                Mon Profil
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false)
                  handleLogout()
                }}
                className='bg-white text-red-700 px-4 py-2 rounded-full hover:bg-gray-100'
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              to='/signup'
              onClick={() => setIsOpen(false)}
              className='bg-custom text-white px-4 py-2 rounded-full hover:bg-gray-700'
            >
              S'inscrire
            </Link>
          )}
        </nav>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className='fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden'
        ></div>
      )}
    </header>
  )
}

export default Header
