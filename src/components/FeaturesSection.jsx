const FeaturesSection = () => {
  return (
    <section className='bg-white text-black py-20 font-poppins'>
      <div className='max-w-screen-xl mx-auto text-center'>
        <h2 className='text-3xl font-extrabold mb-12'>
          Découvrez nos fonctionnalités
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12'>
          {/* Fonctionnalité 1 */}
          <div className='flex flex-col items-center transition-transform duration-300 cursor-pointer hover:shadow-lg hover:rounded-xl'>
            <div className='bg-gray-100 text-black p-6 rounded-full mb-4'>
              <i className='fas fa-lock text-4xl'></i>
            </div>
            <h3 className='text-xl font-bold mb-2'>Profil sécurisé</h3>
            <p className='text-base font-light mb-6'>
              Vos informations sont protégées.
            </p>
          </div>

          {/* Fonctionnalité 2 */}
          <div className='flex flex-col items-center transition-transform duration-300 cursor-pointer hover:shadow-lg hover:rounded-xl'>
            <div className='bg-gray-100 text-black p-6 rounded-full mb-4'>
              <i className='fas fa-handshake text-4xl'></i>
            </div>
            <h3 className='text-xl font-bold mb-2'>
              Mise en relation culturelle
            </h3>
            <p className='text-base font-light mb-6'>
              Trouvez des partenaires partageant vos racines.
            </p>
          </div>

          {/* Fonctionnalité 3 */}
          <div className='flex flex-col items-center transition-transform duration-300 cursor-pointer hover:shadow-lg hover:rounded-xl'>
            <div className='bg-gray-100 text-black p-6 rounded-full mb-4'>
              <i className='fas fa-users text-4xl'></i>
            </div>
            <h3 className='text-xl font-bold mb-2'>Rencontres sérieuses</h3>
            <p className='text-base font-light mb-6'>
              Énovez-vous dans des relations authentiques.
            </p>
          </div>
        </div>

        <a
          href='/signup'
          className='bg-orange-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-orange-600 mt-10 inline-block'
        >
          Inscrivez-vous
        </a>
      </div>
    </section>
  )
}

export default FeaturesSection
