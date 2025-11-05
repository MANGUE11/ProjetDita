import React from 'react'
import heroImage from '../assets/hero-image.png'

const Home = () => {
  return (
    <main className='relative bg-gradient-to-r from-red-700 to-[#731502] text-white overflow-hidden'>
      {/* Image de fond pour mobile/tablette */}
      <div className='absolute inset-0 md:hidden z-0'>
        <img
          src={heroImage}
          alt='Fond'
          className='w-full h-full object-cover opacity-20'
        />
      </div>

      {/* Contenu principal */}
      <div className='max-w-screen-xl mx-auto relative z-10'>
        <section className='flex flex-col md:flex-row items-center justify-between min-h-[80vh] md:min-h-[640px] px-4 py-10 md:py-0'>
          {/* Texte avec margin-top uniquement en mobile */}
          <div className='text-center md:text-left max-w-2xl flex flex-col justify-center h-full mt-24 md:mt-0'>
            <h2 className='text-2xl md:text-3xl font-extrabold mb-4 font-poppins'>
              L’amour n’attend pas. Faites le premier pas dès maintenant !
            </h2>
            <p className='text-base md:text-lg mb-8 font-poppins font-light'>
              Ne laissez pas le hasard décider pour vous. Rencontrez des
              personnes qui partagent vos envies, vos valeurs et vos
              aspirations. Que vous cherchiez une belle histoire ou une
              connexion sincère, tout commence par une simple rencontre.
              Inscrivez-vous dès aujourd’hui et laissez la magie opérer !
            </p>
            {/* Bouton en bas et plus petit */}
            <div className='w-fit mx-auto md:mx-0'>
              <a
                href='#'
                className='bg-custom text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-700 transition'
              >
                Se connecter
              </a>
            </div>
          </div>

          {/* Image desktop uniquement */}
          <div className='hidden md:block flex-shrink-0 w-[530px] h-[640px]'>
            <img
              src={heroImage}
              alt='Couple'
              className='w-full h-full object-cover'
            />
          </div>
        </section>
      </div>
    </main>
  )
}

export default Home
