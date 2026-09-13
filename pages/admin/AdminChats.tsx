import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../stores/useStore';
import { motion } from 'framer-motion';
import { Send, MessageCircle, User, Search } from 'lucide-react';
import { formatDateTime, generateId } from '../../utils/helpers';

export default function AdminChats() {
  const { t } = useTranslation();
  const { currentUser, users, chatMessages, addChatMessage, markChatRead } = useStore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const regularUsers = users.filter((u) => u.role === 'user');

  const conversations = regularUsers.map((user) => {
    const userMsgs = chatMessages.filter(
      (m) =>
        (m.senderId === user.id && m.receiverId === currentUser?.id) ||
        (m.senderId === currentUser?.id && m.receiverId === user.id)
    );
    const lastMsg = userMsgs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    const unread = userMsgs.filter((m) => m.senderId === user.id && !m.read).length;

    return { user, lastMsg, unread };
  }).filter((c) =>
    c.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
    c.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
    c.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const selectedMessages = selectedUserId
    ? chatMessages
        .filter(
          (m) =>
            (m.senderId === selectedUserId && m.receiverId === currentUser?.id) ||
            (m.senderId === currentUser?.id && m.receiverId === selectedUserId)
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedMessages]);

  useEffect(() => {
    if (selectedUserId && currentUser) {
      markChatRead(selectedUserId, currentUser.id);
    }
  }, [selectedUserId, currentUser, markChatRead]);

  const handleSend = () => {
    if (!message.trim() || !currentUser || !selectedUserId) return;

    addChatMessage({
      id: generateId(),
      senderId: currentUser.id,
      receiverId: selectedUserId,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    });

    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-900">{t('admin.chats')}</h1>
        <p className="text-surface-500 mt-1">Chat with your users</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-220px)] min-h-[400px]">
        {/* User List */}
        <div className="w-72 bg-white rounded-2xl border border-surface-100 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-surface-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                className="input-field pl-10 text-sm"
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.user.id}
                onClick={() => setSelectedUserId(conv.user.id)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-surface-50 transition-colors border-b border-surface-50 ${
                  selectedUserId === conv.user.id ? 'bg-primary-50 border-l-2 border-l-primary-500' : ''
                }`}
              >
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-surface-900 text-sm truncate">
                      {conv.user.firstName} {conv.user.lastName}
                    </p>
                    {conv.unread > 0 && (
                      <span className="bg-primary-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-surface-400 truncate">
                    {conv.lastMsg?.message || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-2xl border border-surface-100 flex flex-col overflow-hidden">
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-surface-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-surface-900 text-sm">
                    {users.find((u) => u.id === selectedUserId)?.firstName}{' '}
                    {users.find((u) => u.id === selectedUserId)?.lastName}
                  </p>
                  <p className="text-xs text-surface-400">
                    {users.find((u) => u.id === selectedUserId)?.email}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-10 h-10 text-surface-200 mx-auto mb-2" />
                    <p className="text-surface-400 text-sm">{t('chat.noMessages')}</p>
                  </div>
                ) : (
                  selectedMessages.map((msg) => {
                    const isMine = msg.senderId === currentUser?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                            isMine
                              ? 'bg-primary-600 text-white rounded-br-md'
                              : 'bg-surface-100 text-surface-900 rounded-bl-md'
                          }`}
                        >
                          <p>{msg.message}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-200' : 'text-surface-400'}`}>
                            {formatDateTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-surface-100">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 input-field text-sm"
                    placeholder={t('chat.placeholder')}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="btn-primary px-4 disabled:opacity-50 flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-surface-200 mx-auto mb-3" />
                <p className="text-surface-400">Select a user to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
