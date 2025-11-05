const HowItWorksSection = () => {
  return (
    <section className='bg-white pt-8 pb-20 text-black font-poppins'>
      <div className='max-w-screen-xl mx-auto text-center px-4'>
        {/* Ligne de séparation en haut */}
        <div className='border-t-[0.1px] border-[#731502] w-full mb-12'></div>

        <h2 className='text-3xl font-extrabold mb-12'>Comment ça marche</h2>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-8'>
          {/* ÉTAPE 1 */}
          <div
            className='bg-white p-8 rounded-2xl shadow-md border border-transparent cursor-pointer transition-all duration-500 ease-in-out transform hover:scale-105 hover:border-[#731502] hover:-translate-y-1'
            data-aos='fade-up'
          >
            <div className='text-[#731502] text-4xl mb-4'>
              <i className='fas fa-user-plus'></i>
            </div>
            <h3 className='text-xl font-bold mb-2'>Inscription simple</h3>
            <p className='text-base font-light'>
              Créez un profil en quelques étapes pour commencer.
            </p>
          </div>

          {/* ÉTAPE 2 */}
          <div
            className='bg-white p-8 rounded-2xl shadow-md border cursor-pointer border-transparent transition-all duration-500 ease-in-out transform hover:scale-105 hover:border-[#731502] hover:-translate-y-1'
            data-aos='fade-up'
          >
            <div className='text-[#731502] text-4xl mb-4'>
              <i className='fas fa-heart'></i>
            </div>
            <h3 className='text-xl font-bold mb-2'>Rencontres authentiques</h3>
            <p className='text-base font-light'>
              Nos valeurs culturelles et de sécurité vous garantissent une
              expérience sincère.
            </p>
          </div>

          {/* ÉTAPE 3 */}
          <div
            className='bg-white p-8 rounded-2xl shadow-md border cursor-pointer border-transparent transition-all duration-500 ease-in-out transform hover:scale-105 hover:border-[#731502] hover:-translate-y-1'
            data-aos='fade-up'
          >
            <div className='text-[#731502] text-4xl mb-4'>
              <i className='fas fa-comments'></i>
            </div>
            <h3 className='text-xl font-bold mb-2'>Faites des connexions</h3>
            <p className='text-base font-light'>
              Engagez la conversation et apprenez à connaître vos partenaires
              potentiels.
            </p>
          </div>
        </div>

        {/* Ligne de séparation en bas */}
        {/* <div className='border-t-[0.1px] border-[#731502] w-full mt-12'></div> */}
      </div>
    </section>
  )
}

export default HowItWorksSection
