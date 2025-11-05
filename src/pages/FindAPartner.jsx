import React, { useState, useEffect } from 'react'
import axiosInstance from '../utils/axiosInstance'
import { ChevronDown } from 'lucide-react'
import { FaHeart, FaTimes } from 'react-icons/fa'

// Toast component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg z-50
      ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}
    >
      {message}
    </div>
  )
}

const FindAPartner = () => {
  const [showPopup, setShowPopup] = useState(false)
  const [profiles, setProfiles] = useState([])
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [photoUrls, setPhotoUrls] = useState({})
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return

    const fetchProfiles = async () => {
      try {
        const res = await axiosInstance.get('/matching/suggestions')
        const data = res.data?.content
        if (Array.isArray(data)) {
          setProfiles(data)
        } else {
          console.warn('Résultat inattendu:', res.data)
          setProfiles([])
        }
      } catch (err) {
        console.error('Erreur récupération suggestions:', err)
        setProfiles([])
      }
    }

    fetchProfiles()
  }, [isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn || profiles.length === 0) return

    const fetchPhotos = async () => {
      const newPhotoUrls = {}
      await Promise.all(
        profiles.map(async (profile) => {
          const profilePhoto = profile.photos.find(
            (p) => p.type === 'PROFILE' && p.main && p.approved
          )
          if (profilePhoto) {
            try {
              const response = await axiosInstance.get(
                `/profile/view/${encodeURIComponent(profilePhoto.photoKey)}`,
                { responseType: 'blob' }
              )
              const url = URL.createObjectURL(response.data)
              newPhotoUrls[profile.id] = url
            } catch (error) {
              console.error('Erreur chargement photo profil:', error)
              newPhotoUrls[profile.id] = null
            }
          } else {
            newPhotoUrls[profile.id] = null
          }
        })
      )
      setPhotoUrls(newPhotoUrls)
    }

    fetchPhotos()

    return () => {
      Object.values(photoUrls).forEach((url) => {
        if (url) URL.revokeObjectURL(url)
      })
    }
  }, [isLoggedIn, profiles])

  const openPopup = (profile) => {
    setSelectedProfile(profile)
    setShowPopup(true)
  }

  const closePopup = () => {
    setShowPopup(false)
    setSelectedProfile(null)
  }

  const handleLoginClick = () => {
    window.location.href = '/login'
  }

  const handleRegisterClick = () => {
    window.location.href = '/signup'
  }

  const handlePass = async (userId) => {
    try {
      await axiosInstance.post(`/matching/pass/${userId}`)
      setToast({ message: 'Profil ignoré avec succès.', type: 'success' })
      closePopup()
    } catch (err) {
      setToast({
        message:
          err?.response?.data?.message || "Erreur lors de l'envoi du pass.",
        type: 'error',
      })
    }
  }

  const handleLike = async (userId) => {
    try {
      await axiosInstance.post(`/matching/like/${userId}`)
      setToast({ message: 'Like envoyé avec succès !', type: 'success' })
      closePopup()
    } catch (err) {
      setToast({
        message:
          err?.response?.data?.message || "Erreur lors de l'envoi du like.",
        type: 'error',
      })
    }
  }

  return (
    <div className='bg-white min-h-screen relative'>
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Hero */}
      <div className='relative h-64 w-full'>
        <img
          src='/fond.jpg'
          alt='Hero'
          className='absolute inset-0 w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-b from-red-800/70 to-red-900/70 flex items-center justify-center'>
          <h1 className='text-3xl md:text-5xl font-bold text-white'>
            Trouver un partenaire !
          </h1>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-6 py-8'>
        {!isLoggedIn ? (
          <div className='flex flex-col items-center justify-center gap-6 h-96 text-center'>
            <p className='text-lg font-semibold text-gray-700'>
              Vous devez être connecté pour voir les profils.
            </p>
            <div className='flex gap-4'>
              <button
                onClick={handleLoginClick}
                className='bg-yellow-400 text-white px-6 py-2 rounded-full font-semibold hover:bg-yellow-500 transition'
              >
                Connexion
              </button>
              <button
                onClick={handleRegisterClick}
                className='bg-orange-400 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-500 transition'
              >
                S'inscrire
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Filtres */}
            <div className='flex flex-wrap gap-4 mb-8 justify-center'>
              {[
                'Langue maternelle',
                "Pays d'origine",
                'Pays de résidence',
                'Ethnie',
              ].map((filter, index) => (
                <div
                  key={index}
                  className='bg-orange-100 text-orange-900 px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer hover:bg-orange-200 transition'
                >
                  <span>{filter}</span>
                  <ChevronDown size={16} />
                </div>
              ))}
              <button className='bg-yellow-400 text-white px-6 py-2 rounded-full font-semibold hover:bg-yellow-500 transition'>
                Rechercher
              </button>
            </div>

            {/* Liste des profils */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {profiles.map((profile) => {
                const photoUrl = photoUrls[profile.id] || '/default-profile.png'
                return (
                  <div
                    key={profile.id}
                    className='bg-orange-100 rounded-lg p-0 flex text-left shadow-md min-h-[200px] overflow-hidden'
                  >
                    <div className='w-1/2 flex-none h-full'>
                      <img
                        src={photoUrl}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <div className='w-1/2 p-4 flex flex-col justify-center bg-gradient-to-r from-red-700 to-red-900 text-white'>
                      <h3 className='text-lg font-bold mb-1'>
                        {profile.firstName} {profile.lastName}
                      </h3>
                      <p className='text-sm whitespace-pre-line mb-4'>
                        {profile.bio || 'Pas de description disponible.'}
                      </p>
                      <button
                        className='bg-orange-400 text-white px-4 py-2 rounded-full font-semibold w-max'
                        onClick={() => openPopup(profile)}
                      >
                        Voir Profil
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Pop-up profil */}
      {showPopup && selectedProfile && (
        <div className='fixed inset-0 bg-black/60 z-50 flex items-center justify-center'>
          <div className='bg-gradient-to-b from-red-800 to-red-900 text-white p-6 rounded-xl w-[300px] relative'>
            <button
              className='absolute top-4 left-4 text-xl text-white'
              onClick={closePopup}
            >
              <FaTimes />
            </button>

            <div className='flex justify-center'>
              <img
                src={photoUrls[selectedProfile.id] || '/default-profile.png'}
                alt={`${selectedProfile.firstName} ${selectedProfile.lastName}`}
                className='w-40 h-40 rounded-full border-4 border-white object-cover'
              />
            </div>

            <h2 className='text-center text-2xl font-bold mt-4 mb-2'>
              {selectedProfile.firstName}, {selectedProfile.age || 'N/A'}
            </h2>

            <div className='text-sm text-center space-y-1'>
              <p>
                <span className='font-semibold'>Langue maternelle :</span>{' '}
                {selectedProfile.motherTongue || 'N/A'}
              </p>
              <p>
                <span className='font-semibold'>Pays d’origine :</span>{' '}
                {selectedProfile.countryOfOrigin || 'N/A'}
              </p>
              <p>
                <span className='font-semibold'>Pays de résidence :</span>{' '}
                {selectedProfile.countryOfResidence || 'N/A'}
              </p>
              <p>
                <span className='font-semibold'>Ethnie :</span>{' '}
                {selectedProfile.ethnicity || 'N/A'}
              </p>
              <p>
                <span className='font-semibold'>Religion :</span>{' '}
                {selectedProfile.religion || 'N/A'}
              </p>
            </div>

            <div className='flex justify-center mt-6 gap-10'>
              <button
                className='text-white text-xl hover:scale-110 transition'
                onClick={() => handlePass(selectedProfile.id)}
              >
                <FaTimes />
              </button>
              <button
                className='text-yellow-400 text-xl hover:scale-110 transition'
                onClick={() => handleLike(selectedProfile.id)}
              >
                <FaHeart />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FindAPartner
