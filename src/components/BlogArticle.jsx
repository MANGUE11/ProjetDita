// src/components/BlogArticle.jsx
import React from 'react'
import blogImage from '../assets/coupleBlog.jpg' // Assure-toi que l'image est bien ici

const BlogArticle = () => {
  const article = {
    imageUrl: blogImage,
    title: 'Découvrir la beauté naturelle du monde',
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
    Curabitur et ligula nec erat luctus dignissim. Donec vehicula 
    cursus metus, non commodo lorem facilisis et. Sed vitae quam 
    nec justo sollicitudin faucibus.`,
    author: 'SYLLA Mangué',
    date: '2025-05-22',
    time: '14:30',
  }

  return (
    <section className='max-w-4xl mx-auto mt-20 px-6'>
      <h1 className='text-4xl font-bold text-center mb-12'>Nos blogs</h1>
      <article className='flex space-x-6 bg-white rounded-none p-4'>
        {/* Image à gauche */}
        <img
          src={article.imageUrl}
          alt={article.title}
          className='w-64 h-64 object-cover rounded-lg flex-shrink-0 cursor-pointer'
        />

        {/* Texte à droite */}
        <div className='flex flex-col justify-between'>
          <div>
            <h2 className='text-2xl font-bold mb-3'>{article.title}</h2>
            <p className='text-justify text-gray-700 leading-relaxed'>
              {article.content}
            </p>
          </div>

          {/* Info date, heure, auteur */}
          <div className='mt-4 text-sm text-gray-500'>
            Publié le {article.date} à {article.time} par {article.author}
          </div>
        </div>
      </article>
    </section>
  )
}

export default BlogArticle
