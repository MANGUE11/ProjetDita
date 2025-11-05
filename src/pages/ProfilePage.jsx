import React, { useState, useEffect, useRef } from 'react'
import axiosInstance from '../utils/axiosInstance'
import Webcam from 'react-webcam'
import { useAuth } from '../context/AuthContext'
import {
  FiUser,
  FiHeart,
  FiUsers,
  FiMessageCircle,
  FiLock,
} from 'react-icons/fi'

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className='fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded shadow z-50'>
      {message}
    </div>
  )
}

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null
  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-lg p-6 max-w-md w-full'
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          onClick={onClose}
          className='mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded'
        >
          Fermer
        </button>
      </div>
    </div>
  )
}

const BlockConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  userName,
}) => {
  if (!isOpen) return null

  const isBlocking = actionType === 'block'

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className='text-xl font-semibold mb-4 text-center'>
        {isBlocking ? `Bloquer ${userName} ?` : `Débloquer ${userName} ?`}
      </h2>
      <p className='text-center text-gray-700 mb-4'>
        {isBlocking
          ? `Êtes-vous sûr de vouloir bloquer cette discussion avec ${userName} ? Vous ne pourrez plus lui envoyer de messages ni en recevoir.`
          : `Êtes-vous sûr de vouloir débloquer cette discussion avec ${userName} ? Vous pourrez à nouveau échanger des messages.`}
      </p>
      <div className='flex justify-around mt-6'>
        <button
          onClick={onClose}
          className='px-6 py-2 rounded bg-gray-300 hover:bg-gray-400'
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          className={`px-6 py-2 rounded text-white ${
            isBlocking
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isBlocking ? 'Confirmer le blocage' : 'Confirmer le déblocage'}
        </button>
      </div>
    </Modal>
  )
}

const ProfilePage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profil')
  const [officialPhotoUrl, setOfficialPhotoUrl] = useState(null)
  const [tempPhotoFile, setTempPhotoFile] = useState(null)
  const [tempPhotoPreview, setTempPhotoPreview] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selfiePreview, setSelfiePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [likesReceived, setLikesReceived] = useState([])
  const [matches, setMatches] = useState([])
  // MODIFICATION : État dédié pour la liste des conversations
  const [conversationList, setConversationList] = useState([])
  const [photosMap, setPhotosMap] = useState({})
  const [popupProfile, setPopupProfile] = useState(null)
  const [conversations, setConversations] = useState({})
  const [messageInput, setMessageInput] = useState('')
  const [sendingMessageTo, setSendingMessageTo] = useState(null)
  const webcamRef = useRef(null)
  const [unreadCounts, setUnreadCounts] = useState({})
  const [blockedConversations, setBlockedConversations] = useState({})
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockActionType, setBlockActionType] = useState('')
  const [blockedUsers, setBlockedUsers] = useState([])
  const [allProfiles, setAllProfiles] = useState({})

  useEffect(() => {
    if (user?.photos) {
      const profilePhoto = user.photos.find(
        (p) => p.type === 'PROFILE' && p.approved && p.valid
      )
      if (profilePhoto) {
        axiosInstance
          .get(`/profile/view/${profilePhoto.photoKey}`, {
            responseType: 'blob',
          })
          .then((res) => {
            const url = URL.createObjectURL(res.data)
            setOfficialPhotoUrl(url)
          })
          .catch(() => setOfficialPhotoUrl(null))
      }
    }
    return () => {
      if (officialPhotoUrl) URL.revokeObjectURL(officialPhotoUrl)
    }
  }, [user])

  const fetchPhotos = async (profiles) => {
    const newPhotosMap = { ...photosMap }
    const profilesToFetch = profiles.filter(
      (p) => p && p.photos && p.photos.length > 0 && !newPhotosMap[p.id]
    )

    await Promise.all(
      profilesToFetch.map(async (profile) => {
        const userId = profile.userId || profile.id
        const photo = profile.photos?.find(
          (p) => p.type === 'PROFILE' && p.main && p.approved
        )
        if (photo) {
          try {
            const res = await axiosInstance.get(
              `/profile/view/${photo.photoKey}`,
              {
                responseType: 'blob',
              }
            )
            newPhotosMap[userId] = URL.createObjectURL(res.data)
          } catch {
            newPhotosMap[userId] = '/default-profile.png'
          }
        } else {
          newPhotosMap[userId] = '/default-profile.png'
        }
      })
    )
    setPhotosMap(newPhotosMap)
  }

  // MODIFICATION : Logique de récupération des données séparée par onglet
  const fetchAllData = async () => {
    try {
      let allFetchedProfiles = []
      const userIdsToFetchDetails = new Set() // Pour stocker les IDs des profils dont nous avons besoin de tous les détails
      const emailsToFetchDetails = new Set() // Pour stocker les emails pour l'API get-by-email

      if (activeTab === 'likes') {
        const likesRes = await axiosInstance.get('/matching/likes-received')
        const likesData = likesRes.data || []
        setLikesReceived(likesData)
        allFetchedProfiles.push(...likesData)
        likesData.forEach((p) => userIdsToFetchDetails.add(p.id))
      } else if (activeTab === 'matchs') {
        const matchesRes = await axiosInstance.get('/matching/matches')
        const matchesData = matchesRes.data || []
        setMatches(matchesData)
        allFetchedProfiles.push(...matchesData)
        matchesData.forEach((p) => userIdsToFetchDetails.add(p.id))
      } else if (activeTab === 'messages') {
        const convsRes = await axiosInstance.get('/messages/conversations')
        const convsData = convsRes.data || []
        setConversationList(convsData)
        // Important: ne pas ajouter les objets convsData directement à allFetchedProfiles ici
        // car ils ne contiennent pas toutes les infos de profil.
        // Nous allons plutôt collecter les emails pour des appels séparés.
        convsData.forEach((conv) => {
          userIdsToFetchDetails.add(conv.userId) // On garde l'ID pour la clé dans allProfiles
          emailsToFetchDetails.add(conv.username) // On ajoute l'email pour la récupération des détails
        })
      } else if (activeTab === 'blocked') {
        const blockedRes = await axiosInstance.get('/matching/block')
        const blockedData = blockedRes.data || []
        setBlockedUsers(blockedData)
        allFetchedProfiles.push(...blockedData)
        blockedData.forEach((p) => userIdsToFetchDetails.add(p.id))
      }

      const blockedUsersRes = await axiosInstance.get('/matching/block')
      const blockedMap = {}
      blockedUsersRes.data.forEach((u) => (blockedMap[u.id] = true))
      setBlockedConversations(blockedMap)
      blockedUsersRes.data.forEach((p) => userIdsToFetchDetails.add(p.id))

      // Étape pour récupérer les détails complets des profils manquants
      const detailedProfilesPromises = []

      // D'abord, récupérer les profils via leurs IDs (pour likes, matchs, bloqués)
      // et ceux des conversations si un ID est déjà présent dans une autre liste avec détails
      Array.from(userIdsToFetchDetails).forEach((userId) => {
        const existingProfile = allProfiles[userId] // Vérifier si déjà en cache
        // Si le profil existe déjà et est complet (avec firstName/lastName), pas besoin de le refetcher
        if (
          existingProfile &&
          existingProfile.firstName &&
          existingProfile.lastName
        ) {
          detailedProfilesPromises.push(Promise.resolve(existingProfile))
        } else {
          // Si on a l'email, on priorise la récupération via l'email si l'ID seul n'est pas suffisant
          // On ne fait cet appel que si le profil n'a pas déjà été récupéré complètement par une autre voie
          // et qu'on n'a pas déjà un appel en cours pour cet email/ID.
          // C'est là que ça devient délicat : l'ID dans `conversationList` est la clé.
          // Il faut mapper l'ID aux emails si on veut utiliser `get-by-email`.
          // Pour l'instant, on suppose que `allProfiles` va être la source de vérité.
        }
      })

      // Maintenant, spécifiquement pour les emails des conversations
      Array.from(emailsToFetchDetails).forEach((email) => {
        detailedProfilesPromises.push(
          axiosInstance
            .get(`/auth/get-by-email/${email}`)
            .then((res) => res.data)
            .catch((err) => {
              console.error(`Error fetching profile for email ${email}:`, err)
              return null // Retourne null en cas d'erreur
            })
        )
      })

      const fetchedDetailedProfiles = (
        await Promise.all(detailedProfilesPromises)
      ).filter(Boolean) // Filtrer les nulls

      const newAllProfilesData = { ...allProfiles } // Conserver les profils déjà chargés
      fetchedDetailedProfiles.forEach((p) => {
        // Assurez-vous que l'objet retourné par get-by-email a un 'id' ou 'userId'
        // qui correspond aux IDs des conversations
        const userId = p.id || p.userId // Ou tout autre champ d'ID unique
        if (userId) {
          newAllProfilesData[userId] = { ...newAllProfilesData[userId], ...p } // Fusionner les infos
        }
      })

      // Ajouter les profils des likes, matchs, bloqués qui sont déjà complets si ce n'est pas déjà fait
      allFetchedProfiles.forEach((p) => {
        const userId = p.userId || p.id
        if (userId && !newAllProfilesData[userId]?.firstName) {
          // N'ajouter que si pas déjà complet
          newAllProfilesData[userId] = { ...newAllProfilesData[userId], ...p }
        }
      })

      setAllProfiles(newAllProfilesData) // Mise à jour de allProfiles

      // Assurez-vous que fetchPhotos utilise les profils les plus récents
      fetchPhotos(Object.values(newAllProfilesData))
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [activeTab])

  const getLastViewedTimestamps = () => {
    try {
      const timestamps = localStorage.getItem('lastViewedTimestamps')
      return timestamps ? JSON.parse(timestamps) : {}
    } catch (error) {
      console.error('Erreur lecture localStorage:', error)
      return {}
    }
  }

  const setLastViewedTimestamp = (userId) => {
    const timestamps = getLastViewedTimestamps()
    timestamps[userId] = Date.now()
    localStorage.setItem('lastViewedTimestamps', JSON.stringify(timestamps))
  }

  // MODIFICATION : Utilise `conversationList`
  const fetchConversationsAndUnreadCounts = async () => {
    if (!user || activeTab !== 'messages') return

    try {
      const updatedConversations = {}
      const newUnreadCounts = {}
      const timestamps = getLastViewedTimestamps()

      for (const conv of conversationList) {
        const res = await axiosInstance.get(`/messages/with/${conv.userId}`)
        updatedConversations[conv.userId] = res.data

        const lastViewed = timestamps[conv.userId] || 0
        const unreadCount = res.data.filter(
          (msg) =>
            msg.senderId !== user.id &&
            new Date(msg.sentAt).getTime() > lastViewed
        ).length

        newUnreadCounts[conv.userId] = unreadCount
      }

      setConversations(updatedConversations)
      setUnreadCounts(newUnreadCounts)
    } catch (err) {
      console.error('Erreur chargement messages :', err)
      setConversations({})
      setUnreadCounts({})
    }
  }

  // MODIFICATION : Dépend de `conversationList`
  useEffect(() => {
    let interval
    if (activeTab === 'messages' && conversationList.length > 0 && user) {
      fetchConversationsAndUnreadCounts()
      interval = setInterval(fetchConversationsAndUnreadCounts, 5000)
    }
    return () => clearInterval(interval)
  }, [activeTab, conversationList, user])

  const handleConversationSelect = (userId) => {
    setSendingMessageTo(userId)
    setLastViewedTimestamp(userId)

    setUnreadCounts((prevCounts) => ({
      ...prevCounts,
      [userId]: 0,
    }))
  }

  const handleLikeBack = async (id) => {
    try {
      await axiosInstance.post(`/matching/like/${id}`)
      setToastMsg('Vous avez liké ce profil.')
      setLikesReceived((prev) => prev.filter((p) => p.id !== id))
    } catch {
      setToastMsg('Erreur lors du like.')
    }
  }

  const handlePass = async (id) => {
    try {
      await axiosInstance.post(`/matching/pass/${id}`)
      setToastMsg('Profil ignoré.')
      setLikesReceived((prev) => prev.filter((p) => p.id !== id))
    } catch {
      setToastMsg('Erreur lors du pass.')
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (tempPhotoPreview) URL.revokeObjectURL(tempPhotoPreview)
      const previewUrl = URL.createObjectURL(file)
      setTempPhotoFile(file)
      setTempPhotoPreview(previewUrl)
      setOfficialPhotoUrl(previewUrl)
    }
  }

  const uploadPhoto = async () => {
    if (!tempPhotoFile) {
      setToastMsg('Veuillez sélectionner une photo avant de mettre à jour.')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', tempPhotoFile)
      await axiosInstance.post('/profile/photo', formData)
      setToastMsg('Photo mise à jour avec succès.')
      setTempPhotoFile(null)
      setTempPhotoPreview(null)
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Erreur lors de la mise à jour.'
      setToastMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const openModal = () => {
    setShowModal(true)
    setSelfiePreview(null)
  }

  const captureSelfie = () => {
    if (!webcamRef.current) return
    const imageSrc = webcamRef.current.getScreenshot()
    setSelfiePreview(imageSrc)
  }

  const submitSelfie = async () => {
    if (!selfiePreview) {
      setToastMsg('Veuillez prendre un selfie avant de valider.')
      return
    }
    setLoading(true)
    try {
      const blob = await fetch(selfiePreview).then((res) => res.blob())
      const selfieFile = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('selfie', selfieFile)
      await axiosInstance.post('/profile/verify-selfie', formData)
      setToastMsg('Selfie soumis avec succès. Vérification en cours.')
      setShowModal(false)
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Erreur lors de la vérification.'
      setToastMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const renderProfileCard = (profile) => {
    const profileId = profile.id
    return (
      <div
        key={profileId}
        className='bg-white shadow rounded-lg overflow-hidden'
      >
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

  const sendMessage = async () => {
    if (!messageInput.trim() || !sendingMessageTo) return

    try {
      await axiosInstance.post(`/messages/to/${sendingMessageTo}`, {
        content: messageInput.trim(),
      })
      setMessageInput('')
      setLastViewedTimestamp(sendingMessageTo)
      await fetchConversationsAndUnreadCounts()
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error)
      setToastMsg("Erreur lors de l'envoi du message.")
    }
  }

  const handleBlockAction = (userId, actionType) => {
    setSendingMessageTo(userId)
    setBlockActionType(actionType)
    setShowBlockModal(true)
  }

  const handleConfirmBlock = async () => {
    if (!sendingMessageTo) return
    const userId = sendingMessageTo

    try {
      if (blockActionType === 'block') {
        await axiosInstance.post(`/matching/block/${userId}`)
        setToastMsg('Discussion bloquée avec succès.')
        setSendingMessageTo(null)
        // Pour le blocage, on rafraîchit les données de l'onglet actuel
        await fetchAllData()
      } else {
        // Pour le déblocage
        await axiosInstance.delete(`/matching/block/${userId}`)
        setToastMsg('Discussion débloquée avec succès.')

        // MODIFICATION CLÉ :
        // On change d'onglet. Le useEffect s'occupera de recharger
        // les bonnes données pour l'onglet des messages.
        setActiveTab('messages')
      }
      setShowBlockModal(false)
    } catch (error) {
      // Log detailed error information for debugging
      console.error('Erreur lors du blocage/déblocage:', error)
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
        console.error('Response headers:', error.response.headers)
      } else if (error.request) {
        console.error('No response received:', error.request)
      } else {
        console.error('Error message:', error.message)
      }
      setToastMsg(
        `Erreur lors du ${
          blockActionType === 'block' ? 'blocage' : 'déblocage'
        } de la discussion.`
      )
      setShowBlockModal(false)
    }
  }

  if (!user) return <p>Chargement...</p>

  const totalUnread = Object.values(unreadCounts).reduce(
    (sum, count) => sum + (count || 0),
    0
  )

  const userName = allProfiles[sendingMessageTo]?.firstName || 'cet utilisateur'

  return (
    <div className='flex min-h-screen bg-gray-100 pt-20'>
      <div className='w-64 bg-white shadow-md p-6 space-y-6'>
        <h2 className='text-xl font-bold text-red-700 mb-4'>Mon espace</h2>
        <button
          className={`flex items-center gap-2 w-full py-2 px-3 rounded text-left transition ${
            activeTab === 'profil'
              ? 'bg-red-700 text-white'
              : 'hover:bg-red-100'
          }`}
          onClick={() => setActiveTab('profil')}
        >
          <FiUser /> Profil
        </button>
        <button
          className={`flex items-center gap-2 w-full py-2 px-3 rounded text-left transition ${
            activeTab === 'likes' ? 'bg-red-700 text-white' : 'hover:bg-red-100'
          }`}
          onClick={() => setActiveTab('likes')}
        >
          <FiHeart /> Mes likes
        </button>
        <button
          className={`flex items-center gap-2 w-full py-2 px-3 rounded text-left transition ${
            activeTab === 'matchs'
              ? 'bg-red-700 text-white'
              : 'hover:bg-red-100'
          }`}
          onClick={() => setActiveTab('matchs')}
        >
          <FiUsers /> Mes matchs
        </button>

        <button
          className={`flex items-center gap-2 w-full py-2 px-3 rounded text-left transition ${
            activeTab === 'messages'
              ? 'bg-red-700 text-white'
              : 'hover:bg-red-100'
          }`}
          onClick={() => setActiveTab('messages')}
        >
          <FiMessageCircle /> Mes messages
          {totalUnread > 0 && (
            <span className='ml-auto bg-white text-red-700 text-xs font-bold px-2 py-1 rounded-full'>
              {totalUnread}
            </span>
          )}
        </button>

        <button
          className={`flex items-center gap-2 w-full py-2 px-3 rounded text-left transition ${
            activeTab === 'blocked'
              ? 'bg-red-700 text-white'
              : 'hover:bg-red-100'
          }`}
          onClick={() => setActiveTab('blocked')}
        >
          <FiLock /> Conversations bloquées
        </button>
      </div>

      <div className='flex-1 p-8'>
        {toastMsg && (
          <Toast message={toastMsg} onClose={() => setToastMsg('')} />
        )}

        {activeTab === 'profil' && (
          <>
            <h1 className='text-3xl font-bold mb-6'>Mon Profil</h1>

            {!user.profileVerified && (
              <div className='text-center mb-4 bg-yellow-100 text-yellow-800 p-3 rounded shadow'>
                Votre profil n'est pas encore vérifié. Veuillez soumettre un
                selfie pour vérification.
              </div>
            )}

            <div className='bg-white p-6 rounded shadow-md'>
              <div className='flex items-center gap-6'>
                <img
                  src={officialPhotoUrl || '/default-profile.png'}
                  alt='Photo de profil'
                  className='w-32 h-32 rounded-full object-cover border'
                />
                <div>
                  <p className='text-lg font-semibold'>Nom : {user.lastName}</p>
                  <p className='text-lg font-semibold'>
                    Prénom : {user.firstName}
                  </p>
                  <p className='text-lg font-semibold'>Email : {user.email}</p>
                </div>
              </div>

              <div className='mt-6'>
                <label className='block mb-2 text-sm font-medium'>
                  Changer la photo de profil :
                </label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={handlePhotoChange}
                  className='mb-4'
                />
                {tempPhotoPreview && (
                  <div className='mb-4'>
                    <p className='text-sm mb-2'>Aperçu :</p>
                    <img
                      src={tempPhotoPreview}
                      alt='Preview'
                      className='w-24 h-24 rounded-full object-cover border'
                    />
                  </div>
                )}
                <button
                  onClick={uploadPhoto}
                  className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
                  disabled={loading}
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour la photo'}
                </button>

                {!user.profileVerified && (
                  <button
                    onClick={openModal}
                    className='ml-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700'
                  >
                    Vérifier par selfie
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'likes' && (
          <>
            <h2 className='text-2xl font-bold mb-6'>
              Profils qui vous ont liké
            </h2>
            {likesReceived.length === 0 ? (
              <p className='text-gray-600'>Aucun like pour le moment.</p>
            ) : (
              <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {likesReceived.map((profile) => renderProfileCard(profile))}
              </div>
            )}
          </>
        )}

        {activeTab === 'matchs' && (
          <>
            <h2 className='text-2xl font-bold mb-6'>Mes Matchs</h2>
            {matches.length === 0 ? (
              <p className='text-gray-600'>Aucun match pour le moment.</p>
            ) : (
              <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {matches.map((profile) => renderProfileCard(profile))}
              </div>
            )}
          </>
        )}

        {/* MODIFICATION : Utilise `conversationList` */}
        {activeTab === 'messages' && (
          <>
            <h2 className='text-2xl font-bold mb-6'>Mes messages</h2>
            {conversationList.length === 0 ? (
              <p className='text-gray-600'>Vous n'avez aucune conversation.</p>
            ) : (
              <div className='flex gap-6 rounded-xl overflow-hidden shadow-lg'>
                <div className='w-1/4 bg-gradient-to-b from-[#8B0000] to-[#BF1E2E] text-white space-y-2 p-4 h-[500px] overflow-y-auto'>
                  <h3 className='font-semibold mb-2 text-lg'>Messages</h3>
                  {conversationList.map((conv) => {
                    const fullProfile = allProfiles[conv.userId] || conv
                    const lastMessage = {
                      content: conv.lastMessage,
                      senderId: conv.lastMessageFromMe ? user.id : conv.userId,
                    }
                    const unreadCount = unreadCounts[conv.userId] || 0
                    const isBlocked = blockedConversations[conv.userId]

                    return (
                      <div
                        key={conv.userId}
                        onClick={() => handleConversationSelect(conv.userId)}
                        className={`cursor-pointer flex items-center gap-3 p-2 rounded-lg hover:bg-[#AA2424] transition ${
                          sendingMessageTo === conv.userId ? 'bg-[#AA2424]' : ''
                        } ${isBlocked ? 'opacity-50' : ''}`}
                      >
                        <img
                          src={photosMap[conv.userId] || '/default-profile.png'}
                          alt={fullProfile.firstName || 'Utilisateur'}
                          className='w-10 h-10 rounded-full object-cover border border-white'
                        />
                        <div className='flex-1 overflow-hidden'>
                          <p className='font-semibold'>
                            {fullProfile.firstName || 'Utilisateur'}
                          </p>
                          {lastMessage.content && (
                            <p className='text-sm text-gray-200 truncate'>
                              {isBlocked
                                ? 'Discussion bloquée'
                                : lastMessage.senderId === user.id && 'Vous: '}
                              {!isBlocked && lastMessage.content}
                            </p>
                          )}
                        </div>
                        {unreadCount > 0 && !isBlocked && (
                          <span className='ml-auto bg-white text-red-700 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full'>
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className='flex-1 bg-gradient-to-b from-[#FFD7C2] to-[#FFECD9] flex flex-col h-[500px]'>
                  {!sendingMessageTo ? (
                    <div className='flex items-center justify-center h-full'>
                      <p className='text-gray-700'>
                        Sélectionnez une conversation pour discuter.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className='flex items-center justify-between gap-4 bg-[#c84303] text-white px-4 py-2 shadow sticky top-0 z-10'>
                        <div className='flex items-center gap-4'>
                          <img
                            src={
                              photosMap[sendingMessageTo] ||
                              '/default-profile.png'
                            }
                            alt='Photo'
                            className='w-10 h-10 rounded-full object-cover border border-white'
                          />
                          <p className='text-lg font-semibold'>
                            {allProfiles[sendingMessageTo]?.firstName ||
                              'Utilisateur'}{' '}
                            {allProfiles[sendingMessageTo]?.lastName}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (blockedConversations[sendingMessageTo]) {
                              handleBlockAction(sendingMessageTo, 'unblock')
                            } else {
                              handleBlockAction(sendingMessageTo, 'block')
                            }
                          }}
                          className='bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600 transition'
                        >
                          {blockedConversations[sendingMessageTo]
                            ? 'Débloquer'
                            : 'Bloquer'}
                        </button>
                      </div>

                      <div className='flex-1 overflow-y-auto px-6 py-4 space-y-4 flex flex-col'>
                        {(conversations[sendingMessageTo] || []).map((msg) => (
                          <div
                            key={msg.id}
                            className={`max-w-[75%] px-5 py-3 rounded-2xl shadow ${
                              msg.senderId === user.id
                                ? 'bg-[#BF1E2E] text-white self-end ml-auto rounded-br-none'
                                : 'bg-[#FFF1E6] text-gray-900 self-start mr-auto rounded-bl-none'
                            }`}
                          >
                            <p className='text-sm leading-snug'>
                              {msg.content}
                            </p>
                            <div className='text-[10px] text-right text-gray-400 mt-1'>
                              {new Date(msg.sentAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className='flex items-center gap-3 px-6 py-4 bg-white border-t'>
                        <input
                          type='text'
                          placeholder={
                            blockedConversations[sendingMessageTo]
                              ? 'Conversation bloquée'
                              : 'Écrivez un message...'
                          }
                          className='flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BF1E2E]'
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                          disabled={blockedConversations[sendingMessageTo]}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={
                            !messageInput.trim() ||
                            blockedConversations[sendingMessageTo]
                          }
                          className='bg-[#BF1E2E] text-white px-5 py-2 rounded-full font-medium hover:bg-[#a71823] transition'
                        >
                          Envoyer
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'blocked' && (
          <>
            <h2 className='text-2xl font-bold mb-6'>Conversations bloquées</h2>
            {blockedUsers.length === 0 ? (
              <p className='text-gray-600'>
                Aucune conversation bloquée pour le moment.
              </p>
            ) : (
              <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {blockedUsers.map((profile) => (
                  <div
                    key={profile.id}
                    className='bg-white shadow rounded-lg overflow-hidden flex flex-col items-center p-4'
                  >
                    <img
                      src={photosMap[profile.id] || '/default-profile.png'}
                      alt={profile.firstName || 'Utilisateur'}
                      className='w-32 h-32 object-cover rounded-full mb-4'
                      onError={(e) => (e.target.src = '/default-profile.png')}
                    />
                    <h3 className='text-lg font-bold'>
                      {profile.firstName || 'Utilisateur'} {profile.lastName}
                    </h3>
                    <p className='text-sm text-gray-600'>Discussion bloquée</p>
                    <div className='mt-4'>
                      <button
                        onClick={() => handleBlockAction(profile.id, 'unblock')}
                        className='bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700'
                      >
                        Débloquer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {popupProfile && (
        <Modal isOpen={true} onClose={() => setPopupProfile(null)}>
          <div className='text-center'>
            <img
              src={photosMap[popupProfile.id] || '/default-profile.png'}
              alt='profil'
              className='w-32 h-32 rounded-full mx-auto object-cover mb-4'
            />
            <h3 className='text-xl font-bold'>
              {popupProfile.firstName} {popupProfile.lastName},{' '}
              {popupProfile.age}
            </h3>
            <p className='text-sm'>Langue : {popupProfile.motherTongue}</p>
            <p className='text-sm'>Pays : {popupProfile.countryOfResidence}</p>
            {activeTab === 'likes' ? (
              <div className='flex justify-between mt-6'>
                <button
                  onClick={() => handlePass(popupProfile.id)}
                  className='bg-red-600 text-white px-4 py-2 rounded'
                >
                  Passer
                </button>
                <button
                  onClick={() => handleLikeBack(popupProfile.id)}
                  className='bg-green-600 text-white px-4 py-2 rounded'
                >
                  Liker en retour
                </button>
              </div>
            ) : (
              // MODIFICATION ICI: Bouton "Envoyer un message"
              <button
                onClick={() => {
                  setActiveTab('messages')
                  setSendingMessageTo(popupProfile.id)
                  setPopupProfile(null) // Ferme le popup
                }}
                className='bg-green-600 text-white px-4 py-2 rounded mt-4'
              >
                Envoyer un message
              </button>
            )}
          </div>
        </Modal>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2 className='text-xl font-semibold mb-4'>Vérification par selfie</h2>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat='image/jpeg'
          className='rounded-xl border w-full h-64 object-cover mb-4'
        />
        <div className='flex justify-between'>
          <button
            onClick={captureSelfie}
            className='px-4 py-2 bg-gray-700 text-white rounded'
            disabled={loading}
          >
            Prendre un selfie
          </button>
          <button
            onClick={submitSelfie}
            className='px-4 py-2 bg-green-700 text-white rounded'
            disabled={loading}
          >
            {loading ? 'Vérification...' : 'Soumettre'}
          </button>
        </div>
        {selfiePreview && (
          <div className='mt-4 text-center'>
            <h3 className='font-medium mb-2'>Aperçu du selfie</h3>
            <img
              src={selfiePreview}
              alt='Selfie Preview'
              className='w-40 h-40 rounded-full object-cover mx-auto'
            />
          </div>
        )}
      </Modal>

      <BlockConfirmModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleConfirmBlock}
        actionType={blockActionType}
        userName={userName}
      />
    </div>
  )
}

export default ProfilePage
