import React, { useState } from 'react'
import axiosInstance from '../utils/axiosInstance'
import { useAuth } from '../context/AuthContext'

// Composant pour la Conversation List Item
const ConversationListItem = ({
  conv,
  fullProfile,
  photosMap,
  user,
  unreadCount,
  isBlocked,
  sendingMessageTo,
  handleConversationSelect,
}) => {
  const lastMessage = {
    content: conv.lastMessage,
    senderId: conv.lastMessageFromMe ? user.id : conv.userId,
  }

  return (
    <div
      key={conv.userId}
      onClick={() => handleConversationSelect(conv.userId)}
      className={`cursor-pointer flex items-center gap-3 p-2 rounded-lg hover:bg-[#AA2424] transition ${
        sendingMessageTo === conv.userId ? 'bg-[#AA2424]' : ''
      } ${isBlocked ? 'opacity-50' : ''}`}
    >
      <img
        src={photosMap[conv.userId] || '/default-profile.png'}
        alt={fullProfile.firstName || 'Utilisateur'}
        className='w-10 h-10 rounded-full object-cover border border-white'
      />
      <div className='flex-1 overflow-hidden'>
        <p className='font-semibold'>
          {fullProfile.firstName || 'Utilisateur'}
        </p>
        {lastMessage.content && (
          <p className='text-sm text-gray-200 truncate'>
            {isBlocked
              ? 'Discussion bloquée'
              : lastMessage.senderId === user.id && 'Vous: '}
            {!isBlocked && lastMessage.content}
          </p>
        )}
      </div>
      {unreadCount > 0 && !isBlocked && (
        <span className='ml-auto bg-white text-red-700 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full'>
          {unreadCount}
        </span>
      )}
    </div>
  )
}

// Composant pour la Fenêtre de Chat
const ChatWindow = ({
  sendingMessageTo,
  allProfiles,
  photosMap,
  conversations,
  blockedConversations,
  handleBlockAction,
  sendMessage,
  messageInput,
  setMessageInput,
  user,
}) => {
  const isBlocked = blockedConversations[sendingMessageTo]
  const userName = allProfiles[sendingMessageTo]?.firstName || 'Utilisateur'

  return (
    <div className='flex-1 bg-gradient-to-b from-[#FFD7C2] to-[#FFECD9] flex flex-col h-[500px]'>
      <div className='flex items-center justify-between gap-4 bg-[#c84303] text-white px-4 py-2 shadow sticky top-0 z-10'>
        <div className='flex items-center gap-4'>
          <img
            src={photosMap[sendingMessageTo] || '/default-profile.png'}
            alt='Photo'
            className='w-10 h-10 rounded-full object-cover border border-white'
          />
          <p className='text-lg font-semibold'>
            {allProfiles[sendingMessageTo]?.firstName || 'Utilisateur'}{' '}
            {allProfiles[sendingMessageTo]?.lastName}
          </p>
        </div>
        <button
          onClick={() => {
            if (isBlocked) {
              handleBlockAction(sendingMessageTo, 'unblock')
            } else {
              handleBlockAction(sendingMessageTo, 'block')
            }
          }}
          className='bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600 transition'
        >
          {isBlocked ? 'Débloquer' : 'Bloquer'}
        </button>
      </div>

      <div className='flex-1 overflow-y-auto px-6 py-4 space-y-4 flex flex-col'>
        {(conversations[sendingMessageTo] || []).map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[75%] px-5 py-3 rounded-2xl shadow ${
              msg.senderId === user.id
                ? 'bg-[#BF1E2E] text-white self-end ml-auto rounded-br-none'
                : 'bg-[#FFF1E6] text-gray-900 self-start mr-auto rounded-bl-none'
            }`}
          >
            <p className='text-sm leading-snug'>{msg.content}</p>
            <div className='text-[10px] text-right text-gray-400 mt-1'>
              {new Date(msg.sentAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}
      </div>

      <div className='flex items-center gap-3 px-6 py-4 bg-white border-t'>
        <input
          type='text'
          placeholder={
            isBlocked ? 'Conversation bloquée' : 'Écrivez votre message...'
          }
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage()
            }
          }}
          disabled={isBlocked}
          className='flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-red-500'
        />
        <button
          onClick={sendMessage}
          disabled={!messageInput.trim() || isBlocked}
          className={`px-4 py-2 rounded-full text-white transition ${
            !messageInput.trim() || isBlocked
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-700 hover:bg-red-800'
          }`}
        >
          Envoyer
        </button>
      </div>
    </div>
  )
}

const MessagesSection = ({
  conversationList,
  allProfiles,
  photosMap,
  unreadCounts,
  blockedConversations,
  sendingMessageTo,
  conversations,
  handleConversationSelect,
  handleBlockAction,
  sendMessage,
  messageInput,
  setMessageInput,
}) => {
  const { user } = useAuth()

  // Utiliser un Set pour garantir l'unicité et ajouter l'utilisateur actif
  const uniqueUserIds = new Set([
    ...(sendingMessageTo ? [sendingMessageTo] : []),
    ...conversationList.map((c) => c.userId),
  ])

  // Transformer le Set en tableau de conversations (avec fallback)
  const displayConversations = Array.from(uniqueUserIds)
    .map((userId) => {
      // Trouver l'objet conversation réel ou utiliser allProfiles comme base
      const conv = conversationList.find((c) => c.userId === userId)
      if (conv) return conv
      // Si l'utilisateur est sélectionné mais pas dans la liste (nouveau match)
      if (userId === sendingMessageTo && allProfiles[userId]) {
        return {
          userId: userId,
          username: allProfiles[userId].email,
          lastMessage: '',
          lastMessageFromMe: false,
          lastMessageSentAt: new Date().toISOString(),
        }
      }
      return null
    })
    .filter(Boolean)
    .sort(
      (a, b) => new Date(b.lastMessageSentAt) - new Date(a.lastMessageSentAt)
    ) // Tri par date

  return (
    <>
      <h2 className='text-2xl font-bold mb-6'>Mes messages</h2>
      {conversationList.length === 0 && !sendingMessageTo ? (
        <p className='text-gray-600'>Vous n'avez aucune conversation.</p>
      ) : (
        <div className='flex gap-6 rounded-xl overflow-hidden shadow-lg'>
          <div className='w-1/4 bg-gradient-to-b from-[#8B0000] to-[#BF1E2E] text-white space-y-2 p-4 h-[500px] overflow-y-auto'>
            <h3 className='font-semibold mb-2 text-lg'>Messages</h3>
            {displayConversations.map((conv) => (
              <ConversationListItem
                key={conv.userId}
                conv={conv}
                fullProfile={allProfiles[conv.userId] || conv}
                photosMap={photosMap}
                user={user}
                unreadCount={unreadCounts[conv.userId]}
                isBlocked={blockedConversations[conv.userId]}
                sendingMessageTo={sendingMessageTo}
                handleConversationSelect={handleConversationSelect}
              />
            ))}
          </div>

          <div className='flex-1 bg-gradient-to-b from-[#FFD7C2] to-[#FFECD9] flex flex-col h-[500px]'>
            {!sendingMessageTo ? (
              <div className='flex items-center justify-center h-full'>
                <p className='text-gray-700'>
                  Sélectionnez une conversation pour discuter.
                </p>
              </div>
            ) : (
              <ChatWindow
                sendingMessageTo={sendingMessageTo}
                allProfiles={allProfiles}
                photosMap={photosMap}
                conversations={conversations}
                blockedConversations={blockedConversations}
                handleBlockAction={handleBlockAction}
                sendMessage={sendMessage}
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                user={user}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default MessagesSection
