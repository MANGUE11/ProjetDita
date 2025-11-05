import React, { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'

import aicha from '../assets/aicha.png'

const testimonials = [
  {
    text: 'Je ne m’attendais pas à une telle expérience. J’ai rencontré des personnes incroyables, et je me suis découvert de nouveaux horizons. Une plateforme vraiment bien pensée !',
    name: 'Sylla Mangué',
    role: 'Developer / Designer',
    image: aicha,
  },
  {
    text: 'Je ne m’attendais pas à une telle expérience. J’ai rencontré des personnes incroyables, et je me suis découvert de nouveaux horizons. Une plateforme vraiment bien pensée !',
    name: 'Fatoumata Diallo',
    role: 'Product Manager',
    image: aicha,
  },
  {
    text: 'Je ne m’attendais pas à une telle expérience. J’ai rencontré des personnes incroyables, et je me suis découvert de nouveaux horizons. Une plateforme vraiment bien pensée !',
    name: 'Mamadou Bah',
    role: 'UX Designer',
    image: aicha,
  },
  {
    text: 'Je ne m’attendais pas à une telle expérience. J’ai rencontré des personnes incroyables, et je me suis découvert de nouveaux horizons. Une plateforme vraiment bien pensée !',
    name: 'Aïssatou Camara',
    role: 'Ingénieure Logiciel',
    image: aicha,
  },
]

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.realIndex)
  }

  const getSlideStyle = (index) => {
    const total = testimonials.length
    const left = (activeIndex - 1 + total) % total
    const right = (activeIndex + 1) % total

    if (index === activeIndex) {
      return {
        container: 'bg-gradient-to-br from-red-800 to-red-500 text-white',
        text: 'text-white',
        border: 'border-white opacity-30',
        role: 'text-white/70',
      }
    } else if (index === left || index === right) {
      return {
        container: 'bg-white text-black',
        text: 'text-black',
        border: 'border-gray-300 opacity-30',
        role: 'text-gray-500',
      }
    } else {
      return {
        container: 'bg-white text-gray-400 opacity-70',
        text: 'text-gray-500',
        border: 'border-gray-200 opacity-10',
        role: 'text-gray-400',
      }
    }
  }

  return (
    <>
      <style>{`
        .swiper-pagination {
          margin-top: 20px !important;
          bottom: -30px !important;
        }
      `}</style>

      <div className='py-16 px-6 bg-white text-center'>
        <h2 className='text-3xl font-bold mb-12'>Témoignages !</h2>

        <Swiper
          modules={[Autoplay, Pagination]}
          loop
          autoplay={{ delay: 4000 }}
          pagination={{ clickable: true }}
          centeredSlides
          onSlideChange={handleSlideChange}
          className='max-w-6xl mx-auto'
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            640: {
              slidesPerView: 1.2,
            },
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
        >
          {testimonials.map((testimonial, index) => {
            const style = getSlideStyle(index)

            return (
              <SwiperSlide key={index}>
                <div
                  className={`rounded-xl p-6 h-full shadow-md transition-all duration-300 ${style.container} cursor-pointer`}
                  style={{ minHeight: '320px' }}
                >
                  <div className={`text-5xl mb-4 ${style.text}`}>“</div>
                  <p className={`text-sm leading-relaxed mb-6 ${style.text}`}>
                    {testimonial.text}
                  </p>
                  <hr className={`my-4 border-t-1 ${style.border}`} />
                  <div className='flex items-center gap-3'>
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className='w-12 h-12 rounded-full object-cover'
                    />
                    <div className='text-left'>
                      <p className={`font-bold ${style.text}`}>
                        {testimonial.name}
                      </p>
                      <p className={`text-sm ${style.role}`}>
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
    </>
  )
}
