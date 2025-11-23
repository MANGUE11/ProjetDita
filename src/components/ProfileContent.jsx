import React, { useState } from 'react'
import axiosInstance from '../utils/axiosInstance'
import { useAuth } from '../context/AuthContext'
import { FiXCircle, FiPlusCircle } from 'react-icons/fi'

// Composant de Carte d'Image pour les images supplémentaires
const ImageCard = ({ photo, handleRemove, fetchPhotoUrl }) => {
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    if (photo.type === 'EXTRAS') {
      fetchPhotoUrl(photo.photoKey)
        .then((url) => {
          setImageUrl(url)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
    // Nettoyage de l'URL objet
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:'))
        URL.revokeObjectURL(imageUrl)
    }
  }, [photo.photoKey, photo.type, fetchPhotoUrl])

  // N'affiche que les images supplémentaires (EXTRAS)
  if (photo.type !== 'EXTRAS') return null

  return (
    <div className='relative w-32 h-32 rounded-lg overflow-hidden shadow-lg border-2 border-gray-200'>
      {loading ? (
        <div className='w-full h-full flex items-center justify-center bg-gray-200 text-gray-500'>
          Chargement...
        </div>
      ) : (
        <img
          src={imageUrl || '/default-placeholder.png'}
          alt='Photo supplémentaire'
          className='w-full h-full object-cover'
        />
      )}

      {/* Bouton de Suppression */}
      <button
        onClick={() => handleRemove(photo.photoKey)}
        className='absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition'
        title='Supprimer cette image'
      >
        <FiXCircle size={20} />
      </button>

      {/* Statut de Modération */}
      <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center p-0.5'>
        {photo.approved ? 'Approuvée ✅' : 'En attente ⏳'}
      </div>
    </div>
  )
}

const ProfileContent = ({
  officialPhotoUrl,
  setOfficialPhotoUrl,
  userPhotos,
  setToastMsg,
  openSelfieModal,
  refetchUserData,
}) => {
  const { user } = useAuth()
  const [tempProfilePhotoFile, setTempProfilePhotoFile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingExtra, setLoadingExtra] = useState(false)
  const [newExtraPhotoFile, setNewExtraPhotoFile] = useState(null)

  const extraPhotos = userPhotos.filter((p) => p.type === 'EXTRAS')
  const currentProfilePhoto = userPhotos.find(
    (p) => p.type === 'PROFILE' && p.main
  )

  // --- LOGIQUE PHOTO DE PROFIL ---

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Nettoyer l'ancienne URL si elle existe
      if (officialPhotoUrl && officialPhotoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(officialPhotoUrl)
      }
      const previewUrl = URL.createObjectURL(file)
      setTempProfilePhotoFile(file)
      // Mettre à jour l'URL affichée
      setOfficialPhotoUrl(previewUrl)
    }
  }

  const uploadProfilePhoto = async () => {
    if (!tempProfilePhotoFile) {
      setToastMsg('Veuillez sélectionner une photo avant de mettre à jour.')
      return
    }
    setLoadingProfile(true)
    try {
      const formData = new FormData()
      formData.append('file', tempProfilePhotoFile)

      await axiosInstance.post('/profile/photo', formData)
      setToastMsg(
        'Photo de profil mise à jour avec succès. (En attente de modération si nouveau.)'
      )
      setTempProfilePhotoFile(null)
      await refetchUserData() // Rafraîchir les données de l'utilisateur
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Erreur lors de la mise à jour.'
      setToastMsg(msg)
    } finally {
      setLoadingProfile(false)
    }
  }

  // --- LOGIQUE PHOTOS SUPPLÉMENTAIRES ---

  const handleExtraPhotoChange = (e) => {
    const file = e.target.files[0]
    setNewExtraPhotoFile(file)
  }

  const uploadExtraPhoto = async () => {
    if (!newExtraPhotoFile) {
      setToastMsg('Veuillez sélectionner une image à ajouter.')
      return
    }
    if (extraPhotos.length >= 5) {
      setToastMsg('Maximum de 5 images supplémentaires atteint.')
      return
    }

    setLoadingExtra(true)
    try {
      const formData = new FormData()
      formData.append('file', newExtraPhotoFile)

      await axiosInstance.post('/profile/images', formData)

      setToastMsg(
        'Image supplémentaire téléchargée avec succès. (En attente de modération)'
      )
      setNewExtraPhotoFile(null)
      await refetchUserData()
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Erreur lors du téléchargement.'
      setToastMsg(msg)
    } finally {
      setLoadingExtra(false)
    }
  }

  const removeExtraPhoto = async (photoKey) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?'))
      return

    try {
      // Ligne modifiée pour utiliser le nouvel endpoint /profile/delete/{photoKey}
      await axiosInstance.delete(`/profile/delete/${photoKey}`)
      setToastMsg('Image supprimée avec succès.')
      await refetchUserData()
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Erreur lors de la suppression.'
      setToastMsg(msg)
    }
  }

  // Fonction pour récupérer l'URL objet de l'image (pour l'affichage local)
  const fetchPhotoUrl = React.useCallback(async (photoKey) => {
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

  return (
    <>
      <h1 className='text-3xl font-bold mb-6'>Mon Profil</h1>

      {/* --- STATUT DE VÉRIFICATION --- */}
      {!user.profileVerified && (
        <div className='flex items-center justify-between p-3 mb-4 bg-yellow-100 text-yellow-800 rounded shadow border-l-4 border-yellow-500'>
          <p className='font-medium'>
            Votre profil n'est pas encore vérifié. Veuillez soumettre un selfie
            pour vérification.
          </p>
          <button
            onClick={openSelfieModal}
            className='px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm'
          >
            Vérifier par selfie
          </button>
        </div>
      )}

      <div className='bg-white p-6 rounded shadow-md mb-8'>
        <h2 className='text-xl font-semibold mb-4 border-b pb-2'>
          Photo Principale et Informations de Base
        </h2>

        <div className='flex items-center gap-6'>
          <div className='relative'>
            <img
              src={officialPhotoUrl || '/default-profile.png'}
              alt='Photo de profil'
              className='w-32 h-32 rounded-full object-cover border-4 border-red-500'
            />
            {currentProfilePhoto && (
              <div className='absolute bottom-0 right-0 bg-red-700 text-white text-xs px-2 py-0.5 rounded-full'>
                {currentProfilePhoto.approved ? 'Approuvée' : 'Modération...'}
              </div>
            )}
          </div>

          <div>
            <p className='text-lg font-semibold'>Nom : {user.lastName}</p>
            <p className='text-lg font-semibold'>Prénom : {user.firstName}</p>
            <p className='text-lg font-semibold'>Email : {user.email}</p>
          </div>
        </div>

        <div className='mt-6 pt-4 border-t'>
          <label className='block mb-2 text-sm font-medium'>
            Changer la photo de profil :
          </label>
          <input
            type='file'
            accept='image/*'
            onChange={handleProfilePhotoChange}
            className='mb-4'
          />
          <button
            onClick={uploadProfilePhoto}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
            disabled={loadingProfile || !tempProfilePhotoFile}
          >
            {loadingProfile ? 'Mise à jour...' : 'Mettre à jour la photo'}
          </button>
        </div>
      </div>

      {/* --- SECTION DES PHOTOS SUPPLÉMENTAIRES --- */}

      <div className='bg-white p-6 rounded shadow-md'>
        <h2 className='text-xl font-semibold mb-4 border-b pb-2'>
          Photos Supplémentaires (EXTRAS)
        </h2>

        {/* Galerie des Photos Existantes */}
        <div className='flex flex-wrap gap-4 mb-6'>
          {extraPhotos.length === 0 ? (
            <p className='text-gray-500'>
              Aucune image supplémentaire ajoutée.
            </p>
          ) : (
            extraPhotos.map((photo) => (
              <ImageCard
                key={photo.photoKey}
                photo={photo}
                handleRemove={removeExtraPhoto}
                fetchPhotoUrl={fetchPhotoUrl}
              />
            ))
          )}
        </div>

        {/* Formulaire d'Upload */}
        <div className='mt-4 pt-4 border-t'>
          <h3 className='text-lg font-medium mb-3'>
            Ajouter une nouvelle image (Maximum 5 images supplémentaires)
          </h3>
          <input
            type='file'
            accept='image/*'
            onChange={handleExtraPhotoChange}
            className='mb-4'
            disabled={extraPhotos.length >= 5 || loadingExtra}
          />
          {extraPhotos.length >= 5 && (
            <p className='text-red-500 text-sm mb-2'>
              Maximum d'images atteint (5).
            </p>
          )}

          <button
            onClick={uploadExtraPhoto}
            className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
            disabled={
              loadingExtra || !newExtraPhotoFile || extraPhotos.length >= 5
            }
          >
            <FiPlusCircle />
            {loadingExtra ? 'Téléchargement...' : "Télécharger l'image"}
          </button>
        </div>
      </div>
    </>
  )
}

export default ProfileContent
