import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { TripJournal } from '../types';
import { getPublicJournals } from '../services/journalService';
import { Page } from '../types';

interface CommunityFeedProps {
  onNavigate: (page: Page) => void;
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ onNavigate }) => {
  const [journals, setJournals] = useState<TripJournal[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const data = await getPublicJournals();
        setJournals(data);
      } catch (err) {
        console.error("Failed to fetch journals", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJournals();
  }, []);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <h2 className="text-indigo-400 font-bold tracking-widest uppercase mb-4 text-xs">Community</h2>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">Travel Journals</h1>
          <p className="text-gray-400 mt-4 max-w-xl">
            Get inspired by authentic travel stories from the Destinix community. Read about their adventures, tips, and unforgettable memories.
          </p>
        </div>
        <button
          onClick={() => navigate('/journals/new')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)] shrink-0"
        >
          Share Your Journey
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl h-80 animate-pulse"></div>
          ))}
        </div>
      ) : journals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {journals.map((journal, i) => (
            <motion.div
              key={journal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/journals/${journal.id}`)}
              className="group cursor-pointer bg-white/5 border border-white/10 rounded-[32px] overflow-hidden hover:bg-white/10 hover:border-indigo-500/30 transition-all flex flex-col h-full"
            >
              <div className="h-48 overflow-hidden relative">
                {journal.coverImage ? (
                  <img src={journal.coverImage} alt={journal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
                    <span className="text-4xl">✈️</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10 flex items-center gap-1 text-white">
                  <span>❤️</span> {journal.likes}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                  {journal.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-grow">
                  {journal.content}
                </p>
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center overflow-hidden border border-indigo-500/30">
                    {journal.user?.avatar ? (
                      <img src={journal.user.avatar} alt="Author" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-indigo-300 font-bold">{journal.user?.name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-200">{journal.user?.name || 'Anonymous Traveler'}</p>
                    <p className="text-xs text-gray-500">{new Date(journal.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center bg-white/5 border border-white/10 border-dashed rounded-[40px] text-center">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">📝</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-white mb-2">No journals yet!</h3>
          <p className="text-gray-500 max-w-md mb-8">Be the first to share your amazing travel experiences with the Destinix community.</p>
          <button 
            onClick={() => navigate('/journals/new')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-colors"
          >
            Start Writing
          </button>
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
