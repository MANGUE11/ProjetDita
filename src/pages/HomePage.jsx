import React from 'react'
import { ToastContainer } from 'react-toastify'
import Header from '../components/Header'
import Home from './Home'
import FeaturesSection from '../components/FeaturesSection'
import HowItWorksSection from '../components/HowItWorksSection'
import MembersSection from '../components/MembersSection'
import TestimonialsSection from '../components/TestimonialsSection'
import HeroMembersSection from '../components/HeroMembersSection'
import Footer from '../components/Footer'
import BlogArticle from '../components/BlogArticle'
import PourquoiNousChoisir from '../components/PourquoiNousChoisir'

const HomePage = () => {
  return (
    <>
      <Header />
      <ToastContainer />
      <Home />
      <FeaturesSection />
      <HowItWorksSection />
      <MembersSection />
      <BlogArticle />
      <PourquoiNousChoisir />
      <TestimonialsSection />
      <HeroMembersSection />
      {/* <Footer /> */}
    </>
  )
}

export default HomePage
