import React from 'react'
import bgImage from '../assets/fond.jpg'

export default function HeroMembersSection() {
  return (
    <div className='relative min-h-[400px] flex items-center justify-center overflow-hidden'>
      {/* Image parallax visible sans opacité */}
      <div
        className='absolute top-0 left-0 w-full h-full bg-cover bg-center bg-fixed z-0'
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/* Dégradé rouge semi-transparent */}
      <div
        className='absolute top-0 left-0 w-full h-full z-10'
        style={{
          background:
            'linear-gradient(to right, rgba(153, 27, 27, 0.8), rgba(136, 19, 55, 0.8))',
        }}
      ></div>

      {/* Contenu */}
      <div className='relative z-20 max-w-4xl text-center text-white px-4 py-12'>
        <h1 className='text-4xl md:text-5xl font-bold mb-6'>
          Prêt à faire des rencontres qui honorent vos origines ?
        </h1>
        <p className='text-sm md:text-base mb-6 leading-relaxed'>
          Rencontrez des célibataires authentiques prêts à écrire une belle
          histoire. Notre communauté est composée de personnes partageant vos
          valeurs et votre culture. Explorez les profils, échangez et trouvez la
          connexion qui vous correspond. L’amour vous attend peut-être ici !
        </p>
        <button className='bg-custom hover:bg-gray-800 text-white px-6 py-2 rounded transition'>
          Découvrez →
        </button>
      </div>
    </div>
  )
}
