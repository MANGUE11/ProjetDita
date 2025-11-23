import React, { useState, useEffect, useCallback } from 'react'
import axiosInstance from '../utils/axiosInstance'
import { useAuth } from '../context/AuthContext'
import { FaTimes } from 'react-icons/fa' // Ajout de FaTimes pour le bouton de fermeture
// Importation des composants
import SideMenu from '../components/SideMenu'
import ProfileContent from '../components/ProfileContent'
import MatchesLikesContent from '../components/MatchesLikesContent'
import MessagesSection from '../components/MessagesSection'
import {
  Toast,
  BlockConfirmModal,
  SelfieVerificationModal,
} from '../components/Modals' // Retire Modal si elle n'est plus utilisée pour popupProfile

// --- NOUVEAUX COMPOSANTS POUR LA GALERIE DANS LE POP-UP ---

// Composant de Modale générique pour l'image en plein écran
const ImageFullScreenModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null

  return (
    <div
      className='fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4' // z-index très haut
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
        // Tri par date de téléchargement pour avoir les plus récentes
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

// --- COMPOSANT PRINCIPAL PROFILEPAGE ---

const ProfilePage = () => {
  const { user, setUser } = useAuth() // Assurez-vous que setUser est disponible
  const [activeTab, setActiveTab] = useState('profil')
  const [officialPhotoUrl, setOfficialPhotoUrl] = useState(null)
  const [showSelfieModal, setShowSelfieModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [likesReceived, setLikesReceived] = useState([])
  const [matches, setMatches] = useState([])
  const [conversationList, setConversationList] = useState([])
  const [photosMap, setPhotosMap] = useState({})
  const [popupProfile, setPopupProfile] = useState(null)
  const [conversations, setConversations] = useState({})
  const [messageInput, setMessageInput] = useState('')
  const [sendingMessageTo, setSendingMessageTo] = useState(null)
  const [unreadCounts, setUnreadCounts] = useState({})
  const [blockedConversations, setBlockedConversations] = useState({})
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockActionType, setBlockActionType] = useState('')
  const [blockedUsers, setBlockedUsers] = useState([])
  const [allProfiles, setAllProfiles] = useState({}) // --- LOGIQUE PHOTO & INITIALISATION --- // Fonction pour rafraîchir les données de l'utilisateur (incluant les photos)

  const refetchUserData = async () => {
    try {
      const res = await axiosInstance.get('/auth/me') // Endpoint pour récupérer l'utilisateur complet
      setUser(res.data) // Mettre à jour l'état du contexte Auth
      setToastMsg('Données utilisateur rafraîchies.')
    } catch (error) {
      console.error('Erreur de rafraîchissement utilisateur', error)
    }
  }

  useEffect(() => {
    // Initialisation de la photo officielle
    if (user?.photos) {
      const profilePhoto = user.photos.find(
        (p) => p.type === 'PROFILE' && p.approved && p.valid
      ) // Si une URL temporaire existe (après un upload), on la conserve // Sinon, on charge l'officielle
      if (!officialPhotoUrl || !officialPhotoUrl.startsWith('blob:')) {
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
        } else {
          setOfficialPhotoUrl(null)
        }
      }
    }
    return () => {
      // Nettoyage des objets URL
      if (officialPhotoUrl && officialPhotoUrl.startsWith('blob:'))
        URL.revokeObjectURL(officialPhotoUrl)
    }
  }, [user.photos, officialPhotoUrl]) // Ajout de officialPhotoUrl dans le tableau de dépendance

  const fetchPhotos = async (profiles) => {
    // Logique de récupération des photos
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
              { responseType: 'blob' }
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
  } // --- LOGIQUE DE RÉCUPÉRATION DES DONNÉES PAR ONGLET ---

  const fetchAllData = async () => {
    try {
      let allFetchedProfiles = []
      const userIdsToFetchDetails = new Set()
      const emailsToFetchDetails = new Set() // 1. Récupération des données spécifiques à l'onglet actif

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
        setConversationList((prevList) => {
          const newIds = new Set(convsData.map((c) => c.userId))
          const existingMatches = prevList.filter((c) => !newIds.has(c.userId))
          return [...convsData, ...existingMatches]
        })

        convsData.forEach((conv) => {
          userIdsToFetchDetails.add(conv.userId)
          emailsToFetchDetails.add(conv.username)
        })
      } else if (activeTab === 'blocked') {
        const blockedRes = await axiosInstance.get('/matching/block')
        const blockedData = blockedRes.data || []
        setBlockedUsers(blockedData)
        allFetchedProfiles.push(...blockedData)
        blockedData.forEach((p) => userIdsToFetchDetails.add(p.id))
      } // 2. Récupération des utilisateurs bloqués (commun à tous les onglets)

      const blockedUsersRes = await axiosInstance.get('/matching/block')
      const blockedMap = {}
      blockedUsersRes.data.forEach((u) => (blockedMap[u.id] = true))
      setBlockedConversations(blockedMap)
      blockedUsersRes.data.forEach((p) => userIdsToFetchDetails.add(p.id)) // 3. Récupération des détails complets

      const detailedProfilesPromises = []
      Array.from(emailsToFetchDetails).forEach((email) => {
        detailedProfilesPromises.push(
          axiosInstance
            .get(`/auth/get-by-email/${email}`)
            .then((res) => res.data)
            .catch(() => null)
        )
      })
      const fetchedDetailedProfiles = (
        await Promise.all(detailedProfilesPromises)
      ).filter(Boolean)

      const newAllProfilesData = { ...allProfiles }
      fetchedDetailedProfiles.forEach((p) => {
        const userId = p.id || p.userId
        if (userId) {
          newAllProfilesData[userId] = { ...newAllProfilesData[userId], ...p }
        }
      })
      allFetchedProfiles.forEach((p) => {
        const userId = p.userId || p.id
        if (userId && !newAllProfilesData[userId]?.firstName) {
          newAllProfilesData[userId] = { ...newAllProfilesData[userId], ...p }
        }
      })

      setAllProfiles(newAllProfilesData)
      fetchPhotos(Object.values(newAllProfilesData))
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [activeTab]) // --- LOGIQUE DE MESSAGERIE (TIMESTAMPS, CONVERSATIONS, UNREAD) ---

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

  const fetchConversationsAndUnreadCounts = async () => {
    if (!user || activeTab !== 'messages') return

    try {
      const updatedConversations = {}
      const newUnreadCounts = {}
      const timestamps = getLastViewedTimestamps() // Assurer que conversationList est à jour

      const currentConversationList = conversationList

      for (const conv of currentConversationList) {
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

  useEffect(() => {
    let interval
    if (activeTab === 'messages' && user) {
      fetchConversationsAndUnreadCounts()
      interval = setInterval(fetchConversationsAndUnreadCounts, 5000)
    }

    return () => clearInterval(interval)
  }, [activeTab, conversationList, user, sendingMessageTo])

  const handleConversationSelect = (userId) => {
    setSendingMessageTo(userId)
    setLastViewedTimestamp(userId)

    setUnreadCounts((prevCounts) => ({
      ...prevCounts,
      [userId]: 0,
    }))
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
      await fetchAllData()
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error)
      setToastMsg("Erreur lors de l'envoi du message.")
    }
  } // --- LOGIQUE MATCHS & BLOCAGE ---

  const handleMessageUser = (profile) => {
    const userId = profile.id
    const userEmail = profile.email

    setPopupProfile(null)

    setConversationList((prevList) => {
      if (prevList.some((conv) => conv.userId === userId)) {
        return prevList
      }
      const newConv = {
        userId: userId,
        username: userEmail,
        lastMessage: '',
        lastMessageFromMe: false,
        lastMessageSentAt: new Date().toISOString(),
      }
      return [newConv, ...prevList]
    })

    setAllProfiles((prevProfiles) => {
      const existing = prevProfiles[userId] || {}
      if (!existing.firstName) {
        return {
          ...prevProfiles,
          [userId]: { ...existing, ...profile },
        }
      }
      return prevProfiles
    })

    setActiveTab('messages')
    setSendingMessageTo(userId)
    setLastViewedTimestamp(userId)
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
      } else {
        await axiosInstance.delete(`/matching/block/${userId}`)
        setToastMsg('Discussion débloquée avec succès.')
      }
      setShowBlockModal(false)
      await fetchAllData()
      if (blockActionType !== 'block') {
        await fetchConversationsAndUnreadCounts()
      }
    } catch (error) {
      console.error('Erreur lors du blocage/déblocage:', error)
      setToastMsg(
        `Erreur lors du ${
          blockActionType === 'block' ? 'blocage' : 'déblocage'
        } de la discussion.`
      )
      setShowBlockModal(false)
    }
  } // --- RENDU FINAL ---

  if (!user) return <p>Chargement...</p>

  const totalUnread = Object.values(unreadCounts).reduce(
    (sum, count) => sum + (count || 0),
    0
  )

  const userNameForModal =
    allProfiles[sendingMessageTo]?.firstName || 'cet utilisateur'

  let currentProfiles = []
  if (activeTab === 'likes') currentProfiles = likesReceived
  else if (activeTab === 'matchs') currentProfiles = matches
  else if (activeTab === 'blocked') currentProfiles = blockedUsers

  return (
    <div className='flex min-h-screen bg-gray-100 pt-20'>
           {' '}
      <SideMenu
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalUnread={totalUnread}
      />
           {' '}
      <div className='flex-1 p-8'>
               {' '}
        {toastMsg && (
          <Toast message={toastMsg} onClose={() => setToastMsg('')} />
        )}
               {' '}
        {activeTab === 'profil' && (
          <ProfileContent
            officialPhotoUrl={officialPhotoUrl}
            setOfficialPhotoUrl={setOfficialPhotoUrl}
            userPhotos={user.photos || []}
            setToastMsg={setToastMsg}
            openSelfieModal={() => setShowSelfieModal(true)}
            refetchUserData={refetchUserData}
          />
        )}
               {' '}
        {(activeTab === 'likes' ||
          activeTab === 'matchs' ||
          activeTab === 'blocked') && (
          <MatchesLikesContent
            activeTab={activeTab}
            profiles={currentProfiles}
            photosMap={photosMap}
            setPopupProfile={setPopupProfile}
            handleBlockAction={handleBlockAction}
            setToastMsg={setToastMsg}
            setActiveTab={setActiveTab}
          />
        )}
               {' '}
        {activeTab === 'messages' && (
          <MessagesSection
            conversationList={conversationList}
            allProfiles={allProfiles}
            photosMap={photosMap}
            unreadCounts={unreadCounts}
            blockedConversations={blockedConversations}
            sendingMessageTo={sendingMessageTo}
            conversations={conversations}
            handleConversationSelect={handleConversationSelect}
            handleBlockAction={handleBlockAction}
            sendMessage={sendMessage}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
          />
        )}
             {' '}
      </div>
            {/* --- MODALES --- */}
           {' '}
      <SelfieVerificationModal
        isOpen={showSelfieModal}
        onClose={() => setShowSelfieModal(false)}
        setToastMsg={setToastMsg}
      />
           {' '}
      {/* POPUP PROFIL (utilisé par MatchesLikesContent) - NOUVELLE STRUCTURE RESPONSIVE */}
           {' '}
      {popupProfile && (
        <div
          className='fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4'
          onClick={() => setPopupProfile(null)} // Fermer en cliquant en dehors
        >
          <div
            className='bg-gradient-to-b from-red-800 to-red-900 text-white p-4 rounded-xl relative 
                               max-w-4xl w-full max-h-[90vh] overflow-y-auto 
                               md:p-6 md:flex md:space-x-6'
            onClick={(e) => e.stopPropagation()} // Empêche la fermeture lors du clic sur la modale
          >
            {/* Bouton de Fermeture */}
            <button
              className='absolute top-4 right-4 text-2xl text-white hover:text-yellow-400 transition z-10'
              onClick={() => setPopupProfile(null)}
            >
              <FaTimes />
            </button>

            {/* Colonne 1: Photos Extra (à gauche) */}
            {/* Les photos extra sont stockées dans l'objet user qui est le popupProfile */}
            <div className='hidden md:block md:w-1/4'>
              <ProfilePhotoGallery profile={popupProfile} />
            </div>

            {/* Colonne 2: Infos Profil (Centre/Principal) */}
            <div className='flex-1 flex flex-col items-center text-center'>
              <div className='flex justify-center'>
                <img
                  src={photosMap[popupProfile.id] || '/default-profile.png'}
                  alt={popupProfile.firstName}
                  className='w-40 h-40 rounded-full border-4 border-white object-cover'
                />
              </div>

              <h2 className='text-2xl font-bold mt-4 mb-2'>
                {popupProfile.firstName}, {popupProfile.age || 'N/A'}
              </h2>

              <div className='text-sm space-y-2 mb-4 max-w-sm'>
                <p className='text-base font-semibold border-b border-white/50 pb-1'>
                  {popupProfile.bio || 'Pas de description disponible.'}
                </p>
                <p>
                  <span className='font-semibold'>Langue maternelle :</span>{' '}
                  {popupProfile.motherTongue || 'N/A'}
                </p>
                <p>
                  <span className='font-semibold'>Pays d’origine :</span>{' '}
                  {popupProfile.countryOfOrigin || 'N/A'}
                </p>
                <p>
                  <span className='font-semibold'>Pays de résidence :</span>{' '}
                  {popupProfile.countryOfResidence || 'N/A'}
                </p>
                <p>
                  <span className='font-semibold'>Ethnie:</span>{' '}
                  {popupProfile.ethnicity || 'N/A'}
                </p>
                <p>
                  <span className='font-semibold'>Religion :</span>{' '}
                  {popupProfile.religion || 'N/A'}
                </p>
              </div>

              {/* Boutons (au centre pour Matchs/Likes) */}
              {(activeTab === 'likes' || activeTab === 'matchs') && (
                <div className='flex justify-center mt-4'>
                  <button
                    onClick={() => handleMessageUser(popupProfile)}
                    className='px-6 py-2 rounded text-white bg-yellow-600 hover:bg-yellow-700 font-semibold'
                  >
                    Envoyer message
                  </button>
                </div>
              )}
            </div>

            {/* Colonne 3: Photos Extra (mobile) et espace pour actions futures */}
            <div className='md:w-1/4 flex flex-col justify-center items-center p-2'>
              {/* Affichage des photos extra sur mobile */}
              <div className='md:hidden w-full mb-4'>
                <ProfilePhotoGallery profile={popupProfile} />
              </div>
            </div>
          </div>
        </div>
      )}
           {' '}
      <BlockConfirmModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleConfirmBlock}
        actionType={blockActionType}
        userName={userNameForModal}
      />
         {' '}
    </div>
  )
}

export default ProfilePage
