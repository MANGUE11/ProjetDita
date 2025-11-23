import React, { useState, useEffect, useCallback } from 'react'
import axiosInstance from '../utils/axiosInstance'
import { FaTimes } from 'react-icons/fa'

// --- Nouveaux Composants de Modale et Galerie (répliqués de FindAPartner) ---

// Composant de Modale générique pour l'image en plein écran
const ImageFullScreenModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null

  // Utilisation d'un z-index très élevé pour être sûr de recouvrir la modale ProfilePage
  return (
    <div
      className='fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4'
      onClick={onClose}
    >
      <div
        className='relative max-w-full max-h-full'
        onClick={(e) => e.stopPropagation()}
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

// Composant pour l'affichage de la galerie des photos extra (dans le popup)
const ProfilePhotoGallery = React.memo(({ profile }) => {
  const [extraPhotoUrls, setExtraPhotoUrls] = useState({})
  const [loading, setLoading] = useState(true)
  const [fullScreenUrl, setFullScreenUrl] = useState(null) // État pour la modale

  // Fonction de base pour récupérer une URL de photo
  const fetchPhotoUrl = useCallback(async (photoKey) => {
    try {
      // Utilise l'instance axios pour la récupération sécurisée
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

      // Filtrer les photos "EXTRAS" et prendre au maximum les 3 premières approuvées
      const extraPhotos = profile.photos
        .filter((p) => p.type === 'EXTRAS' && p.approved)
        // Tri par date de téléchargement pour avoir les plus récentes (si l'API ne le fait pas)
        // On peut le faire côté client si l'API fournit sentAt:
        .sort((a, b) => new Date(b.sentAt || 0) - new Date(a.sentAt || 0))
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
              onClick={() => setFullScreenUrl(extraPhotoUrls[key])} // Ouvre la modale
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

// --- Composant ProfileCard (inchangé sauf pour le pop-up) ---

// Composant pour afficher une seule carte de profil
const ProfileCard = ({
  profile,
  photosMap,
  activeTab,
  setPopupProfile,
  handleBlockAction,
  setToastMsg,
  setActiveTab,
}) => {
  const profileId = profile.id
  // const userName = profile.firstName || 'cet utilisateur' // non utilisé, laissé pour contexte

  // ... (fonctions handlePass, handleLikeBack inchangées)

  // Si c'est l'onglet "Bloqué", le bouton sera "Débloquer"
  if (activeTab === 'blocked') {
    return (
      <div className='flex items-center justify-between bg-white p-4 rounded shadow'>
        <div className='flex items-center gap-4'>
          <img
            src={photosMap[profileId] || '/default-profile.png'}
            alt={profile.firstName}
            className='w-12 h-12 rounded-full object-cover border'
          />
          <p className='font-semibold'>
            {profile.firstName} {profile.lastName}
          </p>
        </div>
        <button
          onClick={() => {
            handleBlockAction(profileId, 'unblock')
          }}
          className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition'
        >
          Débloquer
        </button>
      </div>
    )
  }

  return (
    <div key={profileId} className='bg-white shadow rounded-lg overflow-hidden'>
      <img
        src={photosMap[profileId] || '/default-profile.png'}
        alt={profile.firstName}
        className='w-full h-48 object-cover'
        onError={(e) => (e.target.src = '/default-profile.png')}
      />
      <div className='p-4'>
        <h3 className='text-lg font-bold'>
          {profile.firstName} {profile.lastName}, {profile.age}
        </h3>
        <p className='text-sm text-gray-600'>
          Langue: {profile.motherTongue || 'N/A'} <br />
          Religion: {profile.religion || 'N/A'} <br />
          Résidence: {profile.countryOfResidence || 'N/A'}
        </p>
        <div className='mt-4 text-center'>
          <button
            // NOTE: Nous allons transmettre le profil complet à la modale
            // qui est gérée par le composant ProfilePage.
            onClick={() => setPopupProfile(profile)}
            className='bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600'
          >
            Voir profil
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Composant MatchesLikesContent (Modification de l'appel au pop-up) ---

const MatchesLikesContent = ({
  activeTab,
  profiles, // likesReceived, matches ou blockedUsers
  photosMap,
  setPopupProfile,
  handleBlockAction,
  setToastMsg,
  setActiveTab,
}) => {
  let title = ''
  let content = null

  if (activeTab === 'likes') {
    title = 'Profils qui vous ont liké'
  } else if (activeTab === 'matchs') {
    title = 'Mes Matchs'
  } else if (activeTab === 'blocked') {
    title = 'Conversations Bloquées'
  }

  if (profiles.length === 0) {
    content = (
      <p className='text-gray-600'>
        {activeTab === 'likes' && 'Aucun like pour le moment.'}
        {activeTab === 'matchs' && 'Aucun match pour le moment.'}
        {activeTab === 'blocked' && 'Aucune conversation bloquée.'}
      </p>
    )
  } else if (activeTab === 'blocked') {
    content = (
      <div className='space-y-4'>
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            photosMap={photosMap}
            activeTab={activeTab}
            handleBlockAction={handleBlockAction}
            setActiveTab={setActiveTab}
            setToastMsg={setToastMsg}
          />
        ))}
      </div>
    )
  } else {
    content = (
      <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            photosMap={photosMap}
            activeTab={activeTab}
            setPopupProfile={setPopupProfile}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <h2 className='text-2xl font-bold mb-6'>{title}</h2>
      {content}
      {/* NOTE IMPORTANTE: 
            Le Pop-up Profile (setPopupProfile) est géré par ProfilePage.jsx. 
            Nous n'avons pas besoin de modifier la logique ici, car ProfilePage.jsx
            a déjà toutes les données du profil complet (incluant les photos)
            et nous allons maintenant modifier le pop-up dans ProfilePage.jsx
            pour qu'il utilise le composant ProfilePhotoGallery ci-dessus.
            */}
    </>
  )
}

export default MatchesLikesContent
