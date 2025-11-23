import React, { useState, useEffect, useCallback } from 'react'
import axiosInstance from '../utils/axiosInstance'
import { ChevronDown } from 'lucide-react'
import { FaHeart, FaTimes } from 'react-icons/fa'

// --- Composants Modales et Toasts ---

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

// Composant de Modale générique pour l'image en plein écran
const ImageFullScreenModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null

  return (
    <div
      className='fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4'
      onClick={onClose}
    >
      <div
        className='relative max-w-full max-h-full'
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture lors du clic sur l'image
      >
        <img
          src={imageUrl}
          alt='Photo en plein écran'
          className='max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl'
        />
        <button
          onClick={onClose}
          className='absolute top-2 right-2 p-2 bg-red-700 text-white rounded-full text-xl opacity-90 hover:opacity-100 transition'
        >
          <FaTimes />
        </button>
      </div>
    </div>
  )
}

// --- Composant Galerie de Photos Extra ---

const ProfilePhotoGallery = React.memo(({ profile }) => {
  const [extraPhotoUrls, setExtraPhotoUrls] = useState({})
  const [loading, setLoading] = useState(true)
  const [fullScreenUrl, setFullScreenUrl] = useState(null) // État pour la modale

  // Fonction de base pour récupérer une URL de photo
  const fetchPhotoUrl = useCallback(async (photoKey) => {
    try {
      const res = await axiosInstance.get(`/profile/view/${photoKey}`, {
        responseType: 'blob',
      })
      return URL.createObjectURL(res.data)
    } catch (error) {
      console.error("Erreur de récupération de l'image:", error)
      return null
    }
  }, [])

  useEffect(() => {
    const fetchExtraPhotos = async () => {
      setLoading(true)
      const newExtraUrls = {}

      // Filtrer les photos "EXTRAS" et prendre au maximum les 3 premières
      const extraPhotos = profile.photos
        .filter((p) => p.type === 'EXTRAS' && p.approved)
        .slice(0, 3)

      await Promise.all(
        extraPhotos.map(async (photo) => {
          const url = await fetchPhotoUrl(photo.photoKey)
          if (url) {
            newExtraUrls[photo.photoKey] = url
          }
        })
      )
      setExtraPhotoUrls(newExtraUrls)
      setLoading(false)
    }

    if (profile) {
      fetchExtraPhotos()
    }

    // Nettoyage des URL objets lorsque le composant se démonte
    return () => {
      Object.values(extraPhotoUrls).forEach((url) => {
        if (url && url.startsWith('blob:')) URL.revokeObjectURL(url)
      })
    }
  }, [profile, fetchPhotoUrl])

  if (loading) {
    return (
      <div className='text-white text-center p-4'>Chargement des photos...</div>
    )
  }

  const photoKeys = Object.keys(extraPhotoUrls)

  return (
    <>
      <div className='flex flex-col gap-3 p-2 bg-black/10 rounded-lg min-w-[120px]'>
        <h3 className='text-sm font-semibold border-b border-white/50 pb-1'>
          Photos Extra
        </h3>
        {photoKeys.length === 0 ? (
          <p className='text-xs text-white/70'>
            Aucune autre photo disponible.
          </p>
        ) : (
          photoKeys.map((key) => (
            <img
              key={key}
              src={extraPhotoUrls[key]}
              alt='Photo supplémentaire'
              className='w-full h-24 object-cover rounded-lg shadow-md border-2 border-white/20 cursor-pointer hover:opacity-80 transition'
              onClick={() => setFullScreenUrl(extraPhotoUrls[key])} // <-- NOUVEAU: Ouvre la modale
            />
          ))
        )}
      </div>

      {/* Modale plein écran */}
      <ImageFullScreenModal
        imageUrl={fullScreenUrl}
        onClose={() => setFullScreenUrl(null)}
      />
    </>
  )
})

// --- Composant Principal FindAPartner ---

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
        if (url && url.startsWith('blob:')) URL.revokeObjectURL(url)
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
      // Retirer le profil de la liste après action
      setProfiles((prev) => prev.filter((p) => p.id !== userId))
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
      // Retirer le profil de la liste après action
      setProfiles((prev) => prev.filter((p) => p.id !== userId))
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
        <div className='fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4'>
          <div
            className='bg-gradient-to-b from-red-800 to-red-900 text-white p-4 rounded-xl relative 
                       max-w-4xl w-full max-h-[90vh] overflow-y-auto 
                       md:p-6 md:flex md:space-x-6'
          >
            {/* Bouton de Fermeture */}
            <button
              className='absolute top-4 right-4 text-2xl text-white hover:text-yellow-400 transition z-10'
              onClick={closePopup}
            >
              <FaTimes />
            </button>

            {/* Colonne 1: Photos Extra (à gauche) */}
            <div className='hidden md:block md:w-1/4'>
              <ProfilePhotoGallery profile={selectedProfile} />
            </div>

            {/* Colonne 2: Infos Profil (Centre/Principal) */}
            <div className='flex-1 flex flex-col items-center text-center'>
              <div className='flex justify-center'>
                <img
                  src={photoUrls[selectedProfile.id] || '/default-profile.png'}
                  alt={`${selectedProfile.firstName} ${selectedProfile.lastName}`}
                  className='w-40 h-40 rounded-full border-4 border-white object-cover'
                />
              </div>

              <h2 className='text-2xl font-bold mt-4 mb-2'>
                {selectedProfile.firstName}, {selectedProfile.age || 'N/A'}
              </h2>

              <div className='text-sm space-y-2 mb-4 max-w-sm'>
                <p className='text-base font-semibold border-b border-white/50 pb-1'>
                  {selectedProfile.bio || 'Pas de description disponible.'}
                </p>
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
                  <span className='font-semibold'>Ethnie:</span>{' '}
                  {selectedProfile.ethnicity || 'N/A'}
                </p>
                <p>
                  <span className='font-semibold'>Religion :</span>{' '}
                  {selectedProfile.religion || 'N/A'}
                </p>
              </div>
            </div>

            {/* Colonne 3: Boutons (à droite, pour la cohérence visuelle) */}
            <div className='md:w-1/4 flex flex-col justify-center items-center p-2'>
              {/* Affichage des photos extra sur mobile */}
              <div className='md:hidden w-full mb-4'>
                <ProfilePhotoGallery profile={selectedProfile} />
              </div>

              <div className='flex justify-center md:flex-col md:space-y-4 md:space-x-0 space-x-10 mt-6 md:mt-0'>
                <button
                  className='bg-white text-red-700 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg hover:scale-110 transition'
                  onClick={() => handlePass(selectedProfile.id)}
                >
                  <FaTimes />
                </button>
                <button
                  className='bg-yellow-400 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg hover:scale-110 transition'
                  onClick={() => handleLike(selectedProfile.id)}
                >
                  <FaHeart />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FindAPartner
