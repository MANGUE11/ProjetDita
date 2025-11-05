import React from 'react'
import { FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa'
import logo from '../assets/logo.png' // Assure-toi que logo.png est dans ce chemin

const Footer = () => {
  return (
    <footer className='bg-gradient-to-r from-red-700 to-red-900 text-white px-6 py-10 mt-20'>
      {/* Partie principale */}
      <div className='max-w-[1300px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-8'>
        {/* Colonne 1 avec le logo */}
        <div>
          <img src={logo} alt='Logo DIYA' className='h-12 mb-4' />
          <p className='text-sm leading-relaxed'>
            Notre plateforme est bien plus qu’un simple site de rencontre :
            c’est un espace dédié aux célibataires africains en quête
            ............
          </p>
        </div>

        {/* Colonne 2 */}
        <div>
          <h3 className='font-semibold mb-4'>Liens importants</h3>
          <ul className='space-y-2 text-sm'>
            <li>
              <a href='#'>Se connecter</a>
            </li>
            <li>
              <a href='#'>S'enregistrer</a>
            </li>
            <li>
              <a href='#'>Voir les membres</a>
            </li>
          </ul>
        </div>

        {/* Colonne 3 */}
        <div>
          <h3 className='font-semibold mb-4'>Resources</h3>
          <ul className='space-y-2 text-sm'>
            <li>
              <a href='#'>Blog</a>
            </li>
            <li>
              <a href='#'>Contacts</a>
            </li>
            <li>
              <a href='#'>Messagerie</a>
            </li>
          </ul>
        </div>

        {/* Colonne 4 */}
        <div>
          <h3 className='font-semibold mb-4'>DIYA</h3>
          <ul className='space-y-2 text-sm'>
            <li>
              <a href='#'>À propos de nous</a>
            </li>
            <li>
              <a href='#'>Inscription</a>
            </li>
          </ul>
        </div>

        {/* Colonne 5 */}
        <div>
          <h3 className='font-bold text-lg mb-4'>Inscrivez vous !</h3>
          <p className='text-sm mb-4'>Inscrivez vous dès maintenant</p>
          <a
            href='#'
            className='inline-flex items-center bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition'
          >
            Inscription
            <span className='ml-2'>→</span>
          </a>
        </div>
      </div>

      {/* Bas de page */}
      <div className='border-t border-white/20 mt-10 pt-6 max-w-[1300px] mx-auto flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0'>
        {/* Partie globe (désactivée) */}
        {/* <div className='flex items-center space-x-2'>
          <IoGlobeOutline />
          <span>Anglais</span>
        </div> */}

        <div className='flex space-x-4'>
          <a href='#'>Terms & privacy</a>
          <a href='#'>Sécurité</a>
          <a href='#'>Status</a>
        </div>

        <div>©2025 developed by @masy.</div>

        <div className='flex space-x-4 text-white'>
          <a href='#'>
            <FaFacebookF />
          </a>
          <a href='#'>
            <FaTwitter />
          </a>
          <a href='#'>
            <FaLinkedinIn />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
