import React from 'react'
import { FaUsers, FaMapMarkerAlt, FaHeart } from 'react-icons/fa'

const PourquoiNousChoisir = () => {
  return (
    <section className='bg-gradient-to-r from-red-700 to-red-900 text-white mt-20 py-16 relative overflow-hidden'>
      {/* Decorative waves background */}
      <div className='absolute inset-0 opacity-10'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 1440 320'
          className='w-full h-full fill-white'
        >
          <path
            fill='currentColor'
            d='M0,64L60,90.7C120,117,240,171,360,165.3C480,160,600,96,720,64C840,32,960,32,1080,58.7C1200,85,1320,139,1380,165.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z'
          ></path>
        </svg>
      </div>

      <div className='relative z-10 max-w-6xl mx-auto px-6 text-center'>
        <h2 className='text-4xl font-bold mb-12'>Pourquoi nous choisir ?</h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-10'>
          <div className='flex flex-col items-center'>
            <FaUsers className='text-5xl mb-4' />
            <h3 className='text-xl font-semibold mb-2'>Créer du lien</h3>
            <p className='text-white/90'>
              Rencontrez des partenaires partageant vos valeurs culturelles et
              personnelles
            </p>
          </div>

          <div className='flex flex-col items-center'>
            <FaMapMarkerAlt className='text-5xl mb-4' />
            <h3 className='text-xl font-semibold mb-2'>Ancrage culturel</h3>
            <p className='text-white/90'>
              Trouvez quelqu’un qui comprend votre monde et vos traditions
            </p>
          </div>

          <div className='flex flex-col items-center'>
            <FaHeart className='text-5xl mb-4' />
            <h3 className='text-xl font-semibold mb-2'>Esprit de sincérité</h3>
            <p className='text-white/90'>
              Commencez des relations honnêtes basées sur la confiance mutuelle
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PourquoiNousChoisir
