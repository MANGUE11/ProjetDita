import React from 'react'
import aicha from '../assets/aicha.png'

const members = [
  {
    name: 'Aicha',
    age: 27,
    city: 'Conakry',
    type: 'Relation sérieuse',
    image: aicha,
    typeColor: 'text-red-500',
  },
  {
    name: 'Madou',
    age: 31,
    city: 'Paris',
    type: 'Amitié',
    image: aicha,
    typeColor: 'text-orange-500',
  },
  {
    name: 'Fatou',
    age: 29,
    city: 'Dakar',
    type: 'Relation sérieuse',
    image: aicha,
    typeColor: 'text-red-500',
  },
]

export default function MembersSection() {
  return (
    <div className='bg-gradient-to-b from-orange-600 to-red-700 text-white py-16 px-6 text-center'>
      <h2 className='text-3xl font-bold mb-2'>Découvrez nos membres</h2>
      <p className='mb-6'>Inscrivez-vous pour voir encore plus de membres !</p>
      <button className='bg-custom hover:bg-red-600 text-white font-semibold px-6 py-2 rounded mb-10'>
        S’inscrire
      </button>

      {/* Cartes des membres */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto'>
        {members.map((member, index) => (
          <div
            key={index}
            className='bg-neutral-100 rounded-xl overflow-hidden text-black'
          >
            <img
              src={member.image}
              alt={member.name}
              className='w-full h-60 object-cover'
            />
            <div
              className='p-4 text-left'
              style={{ backgroundColor: '#FCE8D7' }}
            >
              <h3 className='font-bold text-lg'>
                {member.name}, {member.age}
              </h3>
              <p className='text-sm text-gray-600'>{member.city}</p>
              <p className={`text-sm font-medium mt-1 ${member.typeColor}`}>
                {member.type}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bouton Voir plus */}
      <div className='mt-10'>
        <button className='bg-custom  text-white-600 font-semibold px-6 py-2 rounded hover:bg-red-500'>
          Voir plus de membres
        </button>
      </div>
    </div>
  )
}
