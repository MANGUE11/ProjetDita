const ConversationBox = ({ match, messages, currentUserId, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    await onSendMessage(newMessage)
    setNewMessage('')
  }

  return (
    <div className='mb-6 bg-white p-4 rounded shadow max-h-96 overflow-y-auto flex flex-col'>
      <h3 className='text-lg font-semibold mb-2'>
        Conversation avec {match?.firstName} {match?.lastName}
      </h3>
      <div className='space-y-2 text-sm text-gray-700 flex-grow overflow-y-auto mb-4'>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded max-w-xs break-words ${
              msg.senderId === currentUserId
                ? 'bg-blue-100 ml-auto text-right'
                : 'bg-gray-100 mr-auto text-left'
            }`}
          >
            {msg.content}
            <div className='text-xs text-gray-400 mt-1'>
              {new Date(msg.sentAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className='flex gap-2'>
        <input
          type='text'
          placeholder='Écrire un message...'
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className='flex-grow border border-gray-300 rounded px-3 py-2'
        />
        <button
          type='submit'
          className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
        >
          Envoyer
        </button>
      </form>
    </div>
  )
}
