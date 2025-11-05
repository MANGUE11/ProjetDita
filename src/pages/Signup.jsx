import React, { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import axiosInstance from '../utils/axiosInstance'

const Signup = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    age: '',
    sexe: '',
    profession: '',
    langue: '',
    paysOrigine: '',
    paysResidence: '',
    religion: '',
    interets: '',
    valeurs: '',
    bio: '',
    email: '',
    pseudonyme: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Mapper genre et religion en valeurs attendues par backend (MAJ selon enum du backend)
  const mapGender = (g) => {
    const gLow = g?.toLowerCase()
    if (gLow === 'masculin' || gLow === 'male' || gLow === 'homme')
      return 'MALE'
    if (gLow === 'féminin' || gLow === 'female' || gLow === 'femme')
      return 'FEMALE'
    return 'OTHER'
  }

  const mapReligion = (r) => {
    const rLow = r?.toLowerCase()
    if (rLow === 'musulman' || rLow === 'muslim') return 'MUSLIM'
    if (rLow === 'chrétien' || rLow === 'christian') return 'CHRISTIAN'
    if (rLow === 'traditionnel' || rLow === 'traditional') return 'TRADITIONAL'
    if (rLow === 'aucune' || rLow === 'none') return 'NONE'
    return 'OTHER'
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const signupBody = {
        firstName: formData.prenom,
        lastName: formData.nom,
        number: '0000000000',
        pseudonym: formData.pseudonyme,
        age: parseInt(formData.age, 10),
        gender: mapGender(formData.sexe),
        email: formData.email,
        password: formData.password,
        motherTongue: formData.langue,
        countryOfOrigin: formData.paysOrigine,
        countryOfResidence: formData.paysResidence,
        religion: mapReligion(formData.religion),
        bio: formData.bio,
        profession: formData.profession,
        interests: formData.interets,
        coreValues: formData.valeurs,
        userRole: 'USER',
      }

      await axiosInstance.post('/auth/signup', signupBody)

      alert(
        'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.'
      )
      setStep(1)
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Erreur inconnue'
      alert(`Erreur lors de la création du compte : ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Header />

      <main className='flex-grow px-6 pt-40 pb-10 max-w-2xl mx-auto'>
        <h1 className='text-2xl font-bold text-center mb-8'>
          Création de votre profil
        </h1>

        <div className='space-y-4'>
          <input
            type='email'
            name='email'
            placeholder='Email'
            value={formData.email}
            onChange={handleChange}
            className='w-full border p-3 rounded'
          />
          <input
            type='text'
            name='pseudonyme'
            placeholder='Pseudonyme'
            value={formData.pseudonyme}
            onChange={handleChange}
            className='w-full border p-3 rounded'
          />
          <input
            type='password'
            name='password'
            placeholder='Mot de passe'
            value={formData.password}
            onChange={handleChange}
            className='w-full border p-3 rounded'
          />
          <input
            type='text'
            name='prenom'
            placeholder='Prénom'
            value={formData.prenom}
            onChange={handleChange}
            className='w-full border p-3 rounded'
          />
          <input
            type='text'
            name='nom'
            placeholder='Nom'
            value={formData.nom}
            onChange={handleChange}
            className='w-full border p-3 rounded'
          />
          <input
            type='number'
            name='age'
            placeholder='Âge'
            value={formData.age}
            onChange={handleChange}
            className='w-full border p-3 rounded'
          />
          <input
            type='text'
            name='sexe'
            placeholder='Sexe (Masculin/Féminin)'
            value={formData.sexe}
            onChange={handleChange}
            className='w-full border p-3 rounded'
          />
          <input
            type='text'
            name='profession'
            placeholder='Profession'
            value={formData.profession}
            onChange={handleChange}
            className='w-full border p-3 rounded'
          />
          <input
            type='text'
            name='langue'
            placeholder='Langue maternelle'
            value={formData.langue}
            onChange={handleChange}
            className='w-full border p-3 rounded'
          />
          <input
            type='text'
            name='paysOrigine'
            placeholder="Pays d'origine"
            value={formData.paysOrigine}
            onChange={handleChange}
            className='w-full border p-3 rounded'
          />
          <input
            type='text'
            name='paysResidence'
            placeholder='Pays de résidence'
            value={formData.paysResidence}
            onChange={handleChange}
            className='w-full border p-3 rounded'
          />
          <input
            type='text'
            name='religion'
            placeholder='Religion (Musulman/Chrétien/Traditionnel/Aucune)'
            value={formData.religion}
            onChange={handleChange}
            className='w-full border p-3 rounded'
          />
          <input
            type='text'
            name='interets'
            placeholder='Centres d’intérêt'
            value={formData.interets}
            onChange={handleChange}
            className='w-full border p-3 rounded'
          />
          <input
            type='text'
            name='valeurs'
            placeholder='Valeurs essentielles'
            value={formData.valeurs}
            onChange={handleChange}
            className='w-full border p-3 rounded'
          />
          <textarea
            name='bio'
            placeholder='Petite bio'
            value={formData.bio}
            onChange={handleChange}
            className='w-full border p-3 rounded h-32 resize-none'
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className='bg-red-700 text-white px-6 py-3 rounded w-full mt-4 hover:bg-red-800 disabled:opacity-50'
          >
            {loading ? 'Inscription en cours...' : "Valider l'inscription"}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Signup
