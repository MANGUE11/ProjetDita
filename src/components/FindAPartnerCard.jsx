import React from 'react'
import { FaHeart, FaTimes } from 'react-icons/fa'

const FindAPartnerCard = ({
  profile,
  photoUrl,
  onLike = () => {},
  onPass = () => {},
  onView = () => {},
  showButtons = true,
}) => {
  const fallbackPhoto = '/default-profile.png'

  return (
    <div className='bg-orange-100 rounded-lg p-0 flex text-left shadow-md min-h-[200px] overflow-hidden'>
      <div className='w-1/2 flex-none h-full'>
        <img
          src={photoUrl || fallbackPhoto}
          alt={`${profile.firstName} ${profile.lastName}`}
          className='w-full h-full object-cover'
          onError={(e) => {
            e.target.onerror = null
            e.target.src = fallbackPhoto
          }}
        />
      </div>
      <div className='w-1/2 p-4 flex flex-col justify-center bg-gradient-to-r from-red-700 to-red-900 text-white'>
        <h3 className='text-lg font-bold mb-1'>
          {profile.firstName} {profile.lastName}
        </h3>
        <p className='text-sm whitespace-pre-line mb-2'>
          {profile.bio || 'Pas de description disponible.'}
        </p>

        {showButtons && (
          <div className='flex justify-center gap-6 mt-2'>
            <button
              title='Passer'
              onClick={() => onPass(profile)}
              className='text-white text-xl hover:text-gray-300 transition'
            >
              <FaTimes />
            </button>
            <button
              title='Liker'
              onClick={() => onLike(profile)}
              className='text-yellow-400 text-xl hover:text-yellow-300 transition'
            >
              <FaHeart />
            </button>
          </div>
        )}

        <button
          onClick={() => onView(profile)}
          className='mt-4 bg-orange-400 text-white px-4 py-2 rounded-full font-semibold w-max mx-auto hover:bg-orange-500 transition'
        >
          Voir Profil
        </button>
      </div>
    </div>
  )
}

export default FindAPartnerCard
