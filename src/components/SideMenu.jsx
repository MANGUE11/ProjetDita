import React from 'react'
import {
  FiUser,
  FiHeart,
  FiUsers,
  FiMessageCircle,
  FiLock,
} from 'react-icons/fi'

const SideMenu = ({ activeTab, setActiveTab, totalUnread }) => {
  return (
    <div className='w-64 bg-white shadow-md p-6 space-y-6'>
      <h2 className='text-xl font-bold text-red-700 mb-4'>Mon espace</h2>
      <button
        className={`flex items-center gap-2 w-full py-2 px-3 rounded text-left transition ${
          activeTab === 'profil' ? 'bg-red-700 text-white' : 'hover:bg-red-100'
        }`}
        onClick={() => setActiveTab('profil')}
      >
        <FiUser /> Profil
      </button>
      <button
        className={`flex items-center gap-2 w-full py-2 px-3 rounded text-left transition ${
          activeTab === 'likes' ? 'bg-red-700 text-white' : 'hover:bg-red-100'
        }`}
        onClick={() => setActiveTab('likes')}
      >
        <FiHeart /> Mes likes
      </button>
      <button
        className={`flex items-center gap-2 w-full py-2 px-3 rounded text-left transition ${
          activeTab === 'matchs' ? 'bg-red-700 text-white' : 'hover:bg-red-100'
        }`}
        onClick={() => setActiveTab('matchs')}
      >
        <FiUsers /> Mes matchs
      </button>

      <button
        className={`flex items-center gap-2 w-full py-2 px-3 rounded text-left transition ${
          activeTab === 'messages'
            ? 'bg-red-700 text-white'
            : 'hover:bg-red-100'
        }`}
        onClick={() => setActiveTab('messages')}
      >
        <FiMessageCircle /> Mes messages
        {totalUnread > 0 && (
          <span className='ml-auto bg-white text-red-700 text-xs font-bold px-2 py-1 rounded-full'>
            {totalUnread}
          </span>
        )}
      </button>

      <button
        className={`flex items-center gap-2 w-full py-2 px-3 rounded text-left transition ${
          activeTab === 'blocked' ? 'bg-red-700 text-white' : 'hover:bg-red-100'
        }`}
        onClick={() => setActiveTab('blocked')}
      >
        <FiLock /> Conversations bloquées
      </button>
    </div>
  )
}

export default SideMenu
