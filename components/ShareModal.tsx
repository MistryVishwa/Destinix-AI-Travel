import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Mail, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  shareTitle: string;
  shareText: string;
  shareSubject: string;
}

const WhatsAppIcon: React.FC = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12.031 2c-5.514 0-9.99 4.476-9.99 9.99 0 2.057.625 4.002 1.799 5.61L2 22l4.57-1.492c1.543.957 3.327 1.482 5.161 1.482 5.513 0 10-4.476 10-9.99A9.996 9.996 0 0 0 12.031 2zm0 18.064c-1.745 0-3.415-.494-4.85-1.428l-.348-.224-2.859.932.956-2.73-.243-.377a7.994 7.994 0 0 1-1.378-4.492c0-4.417 3.593-8.01 8.01-8.01 4.417 0 8.01 3.593 8.01 8.01 0 4.417-3.593 8.01-8.01 8.01zm4.39-5.992c-.243-.122-1.439-.71-1.663-.792-.224-.082-.387-.122-.55.122-.163.245-.632.793-.775.956-.143.162-.285.183-.528.061-.243-.122-1.026-.379-1.954-1.208-.722-.644-1.21-1.44-1.352-1.685-.143-.245-.015-.377.107-.498.11-.11.243-.285.366-.428.122-.142.163-.244.244-.407.082-.163.041-.305-.02-.428-.062-.122-.55-1.325-.754-1.814-.199-.48-.402-.414-.55-.422-.143-.008-.306-.008-.469-.008a.9.9 0 0 0-.651.305c-.224.244-.855.835-.855 2.033 0 1.198.871 2.355.993 2.518.122.163 1.713 2.617 4.15 3.67 1.952.84 2.484.779 2.923.633.438-.146 1.439-.588 1.643-1.159.204-.571.204-1.059.143-1.159-.061-.1-.224-.162-.469-.284z"/>
  </svg>
);

const XIcon: React.FC = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
  shareTitle,
  shareText,
  shareSubject
}) => {
  const [copied, setCopied] = useState(false);
  const [supportNative, setSupportNative] = useState(false);

  useEffect(() => {
    if (navigator.share) {
      setSupportNative(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl
      });
      onClose();
    } catch (err) {
      // User cancelled or share failed, fallback gracefully
      console.log('Native share failed or cancelled', err);
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const encodedSubject = encodeURIComponent(shareSubject);

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const mailUrl = `mailto:?subject=${encodedSubject}&body=${encodedText}%0A%0A${encodedUrl}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-x-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            className="relative w-full max-w-md bg-gray-900/90 border border-white/10 rounded-[32px] p-8 shadow-2xl flex flex-col backdrop-blur-xl z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-9 h-9 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full flex items-center justify-center transition-all border border-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="mb-6 pr-6">
              <span className="inline-flex items-center space-x-1 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-3 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                <Share2 className="w-3 h-3" />
                <span>Share Journey</span>
              </span>
              <h3 className="text-2xl font-serif font-bold text-white mb-2 leading-tight">
                Invite Others
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Share this curated travel plan with friends and family to design your dream trip together.
              </p>
            </div>

            {/* Link Copy Field */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex items-center mb-8 focus-within:border-indigo-500/50 transition-colors">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="bg-transparent border-none text-white text-xs w-full focus:outline-none px-2 select-all overflow-hidden text-ellipsis whitespace-nowrap"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 shrink-0 transition-all ${
                  copied
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Social Share Grid */}
            <div className="space-y-4">
              <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                Share Via Social Channels
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center py-4 rounded-2xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 text-gray-400 hover:text-emerald-400 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <WhatsAppIcon />
                  </div>
                  <span className="text-xs font-medium">WhatsApp</span>
                </a>

                {/* Twitter/X */}
                <a
                  href={xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-gray-400 hover:text-white transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <XIcon />
                  </div>
                  <span className="text-xs font-medium">Twitter / X</span>
                </a>

                {/* Email */}
                <a
                  href={mailUrl}
                  className="flex flex-col items-center justify-center py-4 rounded-2xl bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/40 text-gray-400 hover:text-indigo-400 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">Email</span>
                </a>
              </div>
            </div>

            {/* Mobile Native Share Button */}
            {supportNative && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <button
                  onClick={handleNativeShare}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center space-x-2 text-sm shadow-md"
                >
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <span>Other Sharing Options</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
