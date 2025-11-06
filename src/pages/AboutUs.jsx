import React from 'react'

const AboutUs = () => {
  return (
    <div className='min-h-screen bg-gray-50 text-gray-800'>
      {/* ✅ HERO SECTION */}
      <section className='relative bg-red-600 text-white py-20 md:py-32 flex items-center justify-center'>
        <div className='text-center px-4 max-w-3xl'>
          <h1 className='text-4xl md:text-6xl font-extrabold mb-3 md:mb-4 font-[Poppins]'>
            À Propos de Nous
          </h1>

          <p className='text-lg md:text-2xl opacity-90 font-[Poppins] font-light'>
            Notre Mission : Connecter les Cœurs et Construire des Histoires
          </p>
        </div>
      </section>

      {/* ✅ SECTION CONTENU */}
      <section className='py-16 px-6 max-w-5xl mx-auto'>
        <div className='grid md:grid-cols-2 gap-12 items-center'>
          {/* ✅ TEXTE */}
          <div className='space-y-6'>
            <h2 className='text-2xl md:text-3xl font-bold text-red-600 font-[Poppins]'>
              Notre Histoire
            </h2>

            <p className='text-base md:text-lg leading-relaxed'>
              Lancé en 2024, DIYA est né d'une vision simple : créer une
              plateforme de rencontre où l'authenticité et la connexion
              véritable priment...
            </p>

            <p className='text-base md:text-lg leading-relaxed'>
              Notre équipe passionnée, composée d'experts en technologie et de
              psychologues, a travaillé sans relâche pour concevoir un espace
              sûr, intuitif et enrichissant.
            </p>
          </div>

          {/* ✅ IMAGE ILLUSTRATION */}
          <div className='flex justify-center md:justify-end'>
            <img
              src='https://image.pollinations.ai/prompt/Two%20people%20looking%20at%20a%20tablet%20together,%20concept%20of%20online%20dating%20app%20development,%20modern%20startup%20office,%20warm%20lighting,%20diverse%20team,%20collaboration'
              alt="Illustration de l'histoire de DIYA"
              className='rounded-xl shadow-lg w-full max-w-md object-cover'
            />
          </div>
        </div>

        {/* ✅ VALEURS */}
        <div className='mt-20'>
          <h2 className='text-2xl md:text-3xl font-bold text-center mb-10 text-red-600 font-[Poppins]'>
            Nos Valeurs Fondamentales
          </h2>

          <div className='grid md:grid-cols-3 gap-8'>
            {/* Valeur 1 */}
            <div className='bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300'>
              <h3 className='text-lg md:text-xl font-semibold mb-3 text-pink-600 font-[Poppins]'>
                Authenticité
              </h3>
              <p className='text-gray-700'>
                Nous encourageons chaque membre à être lui-même.
              </p>
            </div>

            {/* Valeur 2 */}
            <div className='bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300'>
              <h3 className='text-lg md:text-xl font-semibold mb-3 text-red-500 font-[Poppins]'>
                Sécurité
              </h3>
              <p className='text-gray-700'>
                La protection de nos utilisateurs est notre priorité absolue.
              </p>
            </div>

            {/* Valeur 3 */}
            <div className='bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300'>
              <h3 className='text-lg md:text-xl font-semibold mb-3 text-purple-600 font-[Poppins]'>
                Innovation
              </h3>
              <p className='text-gray-700'>
                Nous innovons constamment pour améliorer l'expérience
                utilisateur.
              </p>
            </div>
          </div>
        </div>

        {/* ✅ CTA */}
        <div className='text-center mt-20 p-10 bg-pink-100 rounded-xl shadow-inner'>
          <h2 className='text-2xl md:text-3xl font-bold mb-4 text-pink-700 font-[Poppins]'>
            Rejoignez la Communauté DIYA !
          </h2>

          <p className='text-lg md:text-xl text-gray-700 mb-6'>
            Prêt(e) à écrire votre propre histoire ?
          </p>

          <button className='bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-10 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all duration-300 font-[Poppins]'>
            Commencez l'aventure
          </button>
        </div>
      </section>
    </div>
  )
}

export default AboutUs
