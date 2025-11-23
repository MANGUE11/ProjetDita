import React, { useRef, useState } from 'react'
import Webcam from 'react-webcam'
import axiosInstance from '../utils/axiosInstance'
import { useEffect } from 'react'

// --- Toast Component ---
export const Toast = ({ message, onClose }) => {
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

// --- Generic Modal Component ---
export const Modal = ({ isOpen, onClose, children }) => {
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

// --- Block Confirmation Modal Component ---
export const BlockConfirmModal = ({
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

// --- Selfie Verification Modal Component ---
export const SelfieVerificationModal = ({ isOpen, onClose, setToastMsg }) => {
  const webcamRef = useRef(null)
  const [selfiePreview, setSelfiePreview] = useState(null)
  const [loading, setLoading] = useState(false)

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
      onClose()
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Erreur lors de la vérification.'
      setToastMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  // Réinitialiser le preview à l'ouverture/fermeture
  useEffect(() => {
    if (isOpen) {
      setSelfiePreview(null)
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className='text-2xl font-bold mb-4 text-center'>
        Vérification par Selfie
      </h2>
      {selfiePreview ? (
        <img
          src={selfiePreview}
          alt='Aperçu Selfie'
          className='w-full h-auto object-cover rounded mb-4'
        />
      ) : (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat='image/jpeg'
          width={400}
          height={300}
          className='w-full h-auto rounded mb-4'
        />
      )}
      <div className='flex justify-around'>
        <button
          onClick={captureSelfie}
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          disabled={loading}
        >
          {selfiePreview ? 'Reprendre' : 'Prendre le selfie'}
        </button>
        {selfiePreview && (
          <button
            onClick={submitSelfie}
            className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
            disabled={loading}
          >
            {loading ? 'Soumission...' : 'Soumettre'}
          </button>
        )}
      </div>
    </Modal>
  )
}
