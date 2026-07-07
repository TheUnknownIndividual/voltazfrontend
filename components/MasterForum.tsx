
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

interface ForumMessage {
  id: number;
  author: string;
  authorRole: string;
  content: string;
  date: string;
  likes: number;
  dislikes: number;
  isReported: boolean;
  replies: ForumMessage[];
}

interface MasterForumProps {
  masters?: any[];
  lang?: 'az' | 'en' | 'ru' | 'tr';
}

const MasterForum: React.FC<MasterForumProps> = ({ masters = [] }) => {
  const { showNotification, confirm } = useNotification();
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; author: string } | null>(null);
  const [currentUser] = useState({ name: 'Admin', role: 'admin' });
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('volt_master_forum');
    if (saved) {
      const parsed = JSON.parse(saved);
      setMessages(Array.isArray(parsed) ? parsed : []);
    } else {
      const initialMessages: ForumMessage[] = [
        {
          id: 1,
          author: 'Əli Məmmədov',
          authorRole: 'Elektrik',
          content: '@Vüsal H. salam, son layihədə istifadə etdiyimiz panellərin məhsuldarlığı necədir?',
          date: new Date(Date.now() - 3600000).toISOString(),
          likes: 5,
          dislikes: 0,
          isReported: false,
          replies: [
            {
              id: 2,
              author: 'Vüsal H.',
              authorRole: 'Mühəndis',
              content: 'Salam Əli bəy, @Əli Məmmədov məhsuldarlıq gözlədiyimizdən yüksəkdir, 21% ətrafında stabil qalır.',
              date: new Date(Date.now() - 1800000).toISOString(),
              likes: 3,
              dislikes: 0,
              isReported: false,
              replies: []
            }
          ]
        }
      ];
      setMessages(initialMessages);
      localStorage.setItem('volt_master_forum', JSON.stringify(initialMessages));
    }
  }, []);

  const saveMessages = (updated: ForumMessage[]) => {
    setMessages(updated);
    localStorage.setItem('volt_master_forum', JSON.stringify(updated));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: ForumMessage = {
      id: Date.now(),
      author: currentUser.name,
      authorRole: currentUser.role,
      content: newMessage,
      date: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      isReported: false,
      replies: []
    };

    if (replyTo) {
      const addReply = (list: ForumMessage[]): ForumMessage[] => {
        return list.map(m => {
          if (m.id === replyTo.id) {
            return { ...m, replies: [...m.replies, msg] };
          }
          if (m.replies.length > 0) {
            return { ...m, replies: addReply(m.replies) };
          }
          return m;
        });
      };
      saveMessages(addReply(messages));
      setReplyTo(null);
    } else {
      saveMessages([msg, ...messages]);
    }
    setNewMessage('');
  };

  const handleInputChange = (val: string) => {
    setNewMessage(val);
    const lastAt = val.lastIndexOf('@');
    if (lastAt !== -1 && lastAt === val.length - 1) {
      setShowTagSuggestions(true);
      setTagSearch('');
    } else if (showTagSuggestions) {
      const search = val.slice(lastAt + 1);
      if (search.includes(' ')) {
        setShowTagSuggestions(false);
      } else {
        setTagSearch(search);
      }
    }
  };

  const handleTagSelect = (name: string) => {
    const lastAt = newMessage.lastIndexOf('@');
    const prefix = newMessage.slice(0, lastAt);
    setNewMessage(`${prefix}@${name} `);
    setShowTagSuggestions(false);
  };

  const handleAction = async (id: number, type: 'like' | 'dislike' | 'report' | 'delete') => {
    if (type === 'delete' && !(await confirm('Bu mesajı silmək istədiyinizə əminsiniz?'))) return;

    const updateInList = (list: ForumMessage[]): ForumMessage[] => {
      const safeList = Array.isArray(list) ? list : [];
      if (type === 'delete') {
        // Filter out the message if it's in the top level
        const filtered = safeList.filter(msg => msg.id !== id);
        // If nothing was filtered, look into replies
        return filtered.map(msg => ({
          ...msg,
          replies: updateInList(msg.replies || [])
        }));
      }

      return safeList.map(msg => {
        if (msg.id === id) {
          if (type === 'like') return { ...msg, likes: (msg.likes || 0) + 1 };
          if (type === 'dislike') return { ...msg, dislikes: (msg.dislikes || 0) + 1 };
          if (type === 'report') return { ...msg, isReported: true };
        }
        if (Array.isArray(msg.replies) && msg.replies.length > 0) {
          return { ...msg, replies: updateInList(msg.replies) };
        }
        return msg;
      });
    };
    saveMessages(updateInList(messages));
    if (type === 'report') showNotification('Mesaj bildirildi.', 'warning');
    if (type === 'delete') showNotification('Mesaj silindi.', 'info');
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(@[\w\s.]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-emerald-600 font-bold hover:underline cursor-pointer">{part}</span>;
      }
      return part;
    });
  };

  const MessageItem: React.FC<{ msg: ForumMessage; isReply?: boolean }> = ({ msg, isReply }) => (
    <div className={`flex gap-3 ${isReply ? 'ml-12 mt-3' : 'mt-6'}`}>
      <div className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} flex-shrink-0 bg-slate-200 rounded-sm overflow-hidden`}>
        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold uppercase text-xs">
          {msg.author[0]}
        </div>
      </div>
      <div className="flex-grow">
        <div className="bg-[#f2f3f5] px-3 py-2 rounded-2xl inline-block max-w-full">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-slate-900 hover:underline cursor-pointer">{msg.author}</span>
            <span className="text-[11px] text-slate-500">•</span>
            <span className="text-[11px] font-medium text-slate-500">{msg.authorRole}</span>
          </div>
          <div className="text-[13px] text-[#1c1e21] leading-normal mt-0.5 whitespace-pre-wrap break-words">
            {renderContent(msg.content)}
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-1 ml-1 text-[12px]">
          <button onClick={() => handleAction(msg.id, 'like')} className="font-bold text-emerald-600 hover:underline">
            Bəyən {msg.likes > 0 && <span className="ml-0.5">({msg.likes})</span>}
          </button>
          <button 
            onClick={() => {
              setReplyTo({ id: msg.id, author: msg.author });
              setNewMessage(`@${msg.author} `);
            }}
            className="font-bold text-emerald-600 hover:underline"
          >
            Cavabla
          </button>
          <span className="text-slate-500">
            {new Date(msg.date).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {currentUser.role === 'admin' && (
            <button onClick={() => handleAction(msg.id, 'delete')} className="font-bold text-red-600 hover:underline">
              Sil
            </button>
          )}
          <button onClick={() => handleAction(msg.id, 'report')} className="text-slate-400 hover:text-red-500">
            {msg.isReported ? 'Bildirilib' : 'Bildir'}
          </button>
        </div>

        {(Array.isArray(msg.replies) ? msg.replies : []).map(reply => (
          <MessageItem key={reply.id} msg={reply} isReply />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px] relative font-sans">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white">
        <h3 className="text-[16px] font-bold text-slate-900">{messages.length} Şərh</h3>
        <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500">
          <span>Sırala:</span>
          <select className="bg-transparent border-none outline-none cursor-pointer text-slate-900">
            <option>Ən yeni</option>
            <option>Ən köhnə</option>
          </select>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-grow overflow-y-auto px-6 py-4 custom-scrollbar">
        {/* Add Comment Input at Top (Facebook style) */}
        <div className="flex gap-3 mb-8">
          <div className="w-10 h-10 flex-shrink-0 bg-slate-200 rounded-sm flex items-center justify-center text-slate-400 font-bold uppercase text-xs">
            {currentUser.name[0]}
          </div>
          <div className="flex-grow">
            {replyTo && (
              <div className="flex items-center justify-between bg-emerald-50 px-3 py-1.5 rounded-t-lg border-x border-t border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-700">
                  <span className="opacity-60">Cavab verilir:</span> @{replyTo.author}
                </span>
                <button onClick={() => { setReplyTo(null); setNewMessage(''); }} className="text-emerald-700 hover:text-emerald-900">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="relative">
              <textarea
                value={newMessage}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Şərh əlavə edin..."
                className={`w-full border border-slate-200 p-3 text-[13px] outline-none focus:border-emerald-400 transition-all min-h-[80px] resize-none ${replyTo ? 'rounded-b-lg' : 'rounded-lg'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e as any);
                  }
                }}
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-emerald-600 text-white px-4 py-1.5 rounded text-[12px] font-bold disabled:opacity-50 hover:bg-slate-900 transition-all"
                >
                  Göndər
                </button>
              </div>
            </form>
          </div>
        </div>

        {messages.length === 0 && (
          <div className="py-20 text-center text-slate-400">
            <p className="text-[13px]">Hələ ki heç bir şərh yoxdur.</p>
          </div>
        )}
        
        <div className="divide-y divide-slate-100">
          {messages.map((msg) => (
            <div key={msg.id} className="pb-6">
              <MessageItem msg={msg} />
            </div>
          ))}
        </div>
      </div>

      {/* Tag Suggestions */}
      {showTagSuggestions && (
        <div className="absolute top-40 left-20 right-20 bg-white border border-slate-200 rounded shadow-xl z-50 max-h-40 overflow-y-auto divide-y divide-slate-50">
          {(Array.isArray(masters) ? masters : [])
            .filter(m => m && m.name && m.name.toLowerCase().includes(tagSearch.toLowerCase()))
            .map(m => (
              <button 
                key={m.email}
                onClick={() => handleTagSelect(m.name)}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 transition-colors"
              >
                <div className="w-6 h-6 bg-slate-100 rounded-sm flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                  {m.name[0]}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900">{m.name}</div>
                  <div className="text-[9px] text-slate-400">{m.masterType}</div>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default MasterForum;
