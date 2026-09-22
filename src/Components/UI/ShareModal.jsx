import React from 'react';
import { X } from 'lucide-react';
import ToastMSG from './ToastMSG';

export default function ShareModal({ isOpen, onClose, url, title }) {
  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url)
        .then(() => ToastMSG("success", "Link copied to clipboard!"))
        .catch(() => ToastMSG("error", "Failed to copy link"));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        ToastMSG("success", "Link copied to clipboard!");
      } catch (err) {
        ToastMSG("error", "Failed to copy link");
      }
      document.body.removeChild(textArea);
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`,
      icon: (
        <svg viewBox="0 0 60 60" className="w-12 h-12">
          <circle cx="30" cy="30" r="30" fill="#25D366" />
          <path d="M39.77 19.35C37.05 16.55 33.42 15 29.56 15C21.6 15 15.12 21.66 15.12 29.87C15.12 32.49 15.78 35.06 17.05 37.3L15 45L22.66 42.93C24.77 44.12 27.15 44.73 29.56 44.73C37.51 44.73 44 38.07 44 29.86C44 25.9 42.5 22.16 39.77 19.35ZM29.56 42.23C27.4 42.23 25.28 41.63 23.45 40.51L23 40.24L18.47 41.46L19.67 36.91L19.39 36.43C18.19 34.46 17.56 32.18 17.56 29.86C17.56 23.04 22.96 17.5 29.57 17.5C32.78 17.5 35.8 18.79 38.06 21.12C40.32 23.45 41.57 26.56 41.57 29.86C41.56 36.69 36.18 42.23 29.56 42.23ZM36.14 32.97C35.78 32.78 34.01 31.88 33.68 31.76C33.35 31.64 33.11 31.57 32.88 31.95C32.63 32.32 31.95 33.15 31.74 33.41C31.52 33.66 31.32 33.68 30.96 33.49C30.6 33.31 29.44 32.92 28.06 31.66C26.98 30.67 26.26 29.45 26.04 29.09C25.83 28.72 26.03 28.51 26.21 28.33C26.37 28.16 26.57 27.88 26.75 27.68C26.93 27.46 27 27.31 27.12 27.07C27.23 26.81 27.18 26.61 27.08 26.42C27 26.24 26.27 24.4 25.98 23.67C25.68 22.94 25.38 23.04 25.17 23.02C24.95 23.01 24.72 23.01 24.47 23.01C24.23 23.01 23.85 23.09 23.52 23.46C23.19 23.84 22.25 24.74 22.25 26.56C22.25 28.39 23.53 30.14 23.71 30.4C23.9 30.65 26.26 34.39 29.87 36.01C30.73 36.4 31.41 36.62 31.93 36.79C32.79 37.08 33.59 37.03 34.21 36.94C34.91 36.84 36.34 36.04 36.66 35.18C36.95 34.31 36.95 33.56 36.87 33.41C36.75 33.26 36.51 33.15 36.14 32.97Z" fill="white" />
        </svg>
      )
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: (
        <svg viewBox="0 0 60 60" className="w-12 h-12">
          <path d="M28.49 59.97C21.85 59.4 16.93 57.64 12.16 54.15C4.44 48.47 0 39.65 0 29.99C0 15.11 10.51 2.8 25.27.37C31.3-.62 37.97.42 43.56 3.22C57.14 10.04 63.34 25.76 58.21 40.32C54.68 50.32 45.42 57.94 34.81 59.57C32.73 59.89 29.75 60.08 28.49 59.97Z" fill="#3B5998" />
          <path d="M25.73 45H31.19V30.01H35.28L36.09 25.33H31.19V21.93C31.19 20.83 31.9 19.68 32.91 19.68H35.7V15H32.28C26.93 15.19 25.84 18.29 25.74 21.54V25.33H23V30.01H25.73V45Z" fill="#FFF" />
        </svg>
      )
    },
    {
      name: "X",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      icon: (
        <svg viewBox="0 0 192 192" className="w-12 h-12">
          <rect width="192" height="192" rx="96" fill="black" />
          <path fillRule="evenodd" clipRule="evenodd" d="M42 47H76L100 78.5L127 47H144L107.5 88.5L150 145H117L91 111L61 145H44L83 100.5L42 47ZM62 57H71.5L130.5 135H121.5L62 57Z" fill="white" />
        </svg>
      )
    },
    {
      name: "Email",
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
      icon: (
        <svg viewBox="0 0 60 60" className="w-12 h-12">
          <path d="M28.49 59.97C21.85 59.4 16.93 57.64 12.16 54.15C4.44 48.47 0 39.65 0 29.99C0 15.11 10.51 2.8 25.27.37C31.3-.62 37.97.42 43.56 3.22C57.14 10.04 63.34 25.76 58.21 40.32C54.68 50.32 45.42 57.94 34.81 59.57C32.73 59.89 29.75 60.08 28.49 59.97Z" fill="#888" />
          <path d="M40.53 19.16H18.53C16.79 19.16 15.54 20.4 15.53 22.16V38.16C15.53 39.92 16.79 41.16 18.53 41.16H40.53C42.27 41.16 43.53 39.92 43.53 38.16V22.16C43.53 20.4 42.27 19.16 40.53 19.16ZM40.53 25.16L29.53 32.16L18.53 25.16V22.16L29.53 29.16L40.53 22.16V25.16Z" fill="#FFF" />
        </svg>
      )
    },
    {
      name: "Reddit",
      url: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      icon: (
        <svg viewBox="0 0 60 60" className="w-12 h-12">
          <circle cx="30" cy="30" r="30" fill="#FF4500" />
          <path d="M43 28.5C43 26 41 24 38.5 24C36.6 24 35 25.2 34.4 26.9C31.9 25.4 28.9 24.5 25.5 24.4L27.5 15.3L33.7 16.6C33.8 18.2 35.1 19.4 36.8 19.4C38.5 19.4 39.9 18 39.9 16.3C39.9 14.6 38.5 13.2 36.8 13.2C35.3 13.2 34 14.3 33.7 15.7L26.9 14.3C26.7 14.3 26.5 14.4 26.4 14.6L24 25.3C20.6 25.6 17.7 26.5 15.1 28C14.5 26.3 12.9 25.1 11.1 25.1C8.6 25.1 6.6 27.1 6.6 29.6C6.6 31.3 7.5 32.8 8.9 33.5C8.8 34.1 8.7 34.7 8.7 35.3C8.7 42.1 18.2 47.6 29.8 47.6C41.4 47.6 50.9 42.1 50.9 35.3C50.9 34.7 50.8 34.1 50.7 33.5C52.1 32.8 53 31.3 53 29.6C53 27.1 51 25.1 48.5 25.1C46.6 25.1 45 26.2 44.4 27.9C43.9 28 43.5 28.2 43 28.5Z" fill="#FFF" />
          <circle cx="21" cy="33.5" r="3" fill="#FF4500" />
          <circle cx="38" cy="33.5" r="3" fill="#FF4500" />
          <path d="M22.5 41C24.5 42.5 27 43 29.5 43C32 43 34.5 42.5 36.5 41C37 40.6 37 39.8 36.5 39.4C36 39 35.2 39 34.8 39.4C33.3 40.5 31.5 40.9 29.5 40.9C27.5 40.9 25.7 40.5 24.2 39.4C23.8 39 23 39 22.5 39.4C22 39.8 22 40.6 22.5 41Z" fill="#FF4500" />
        </svg>
      )
    },
    {
      name: "Pinterest",
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
      icon: (
        <svg viewBox="0 0 60 60" className="w-12 h-12">
          <path d="M28.49 59.97C21.85 59.4 16.93 57.64 12.16 54.15C4.44 48.47 0 39.65 0 29.99C0 15.11 10.51 2.8 25.27.37C31.3-.62 37.97.42 43.56 3.22C57.14 10.04 63.34 25.76 58.21 40.32C54.68 50.32 45.42 57.94 34.81 59.57C32.73 59.89 29.75 60.08 28.49 59.97Z" fill="#BD081C" />
          <path d="M30 14C21.16 14 14 21.17 14 30.02C14 36.61 17.98 42.27 23.67 44.73C23.63 43.61 23.67 42.28 23.95 41.07C24.26 39.77 26.02 32.31 26.02 32.31C26.02 32.31 25.51 31.28 25.51 29.76C25.51 27.38 26.89 25.6 28.61 25.6C30.07 25.6 30.78 26.7 30.78 28.02C30.78 29.49 29.84 31.69 29.36 33.72C28.96 35.42 30.22 36.81 31.9 36.81C34.94 36.81 36.99 32.9 36.99 28.26C36.99 24.74 34.62 22.1 30.31 22.1C25.44 22.1 22.4 25.74 22.4 29.8C22.4 31.2 22.81 32.19 23.46 32.95C23.76 33.3 23.8 33.44 23.69 33.85C23.61 34.14 23.44 34.85 23.37 35.13C23.26 35.54 22.93 35.68 22.56 35.53C20.32 34.62 19.27 32.16 19.27 29.4C19.27 24.83 23.12 19.36 30.75 19.36C36.88 19.36 40.91 23.8 40.91 28.57C40.91 34.88 37.41 39.59 32.25 39.59C30.52 39.59 28.89 38.65 28.33 37.59C28.33 37.59 27.39 41.29 27.2 42.01C26.86 43.23 26.21 44.45 25.61 45.41C27.01 45.81 28.49 46.03 30.02 46.03C38.85 46.03 46 38.86 46 30.02C46 21.18 38.84 14 30 14Z" fill="#FFF" />
        </svg>
      )
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      icon: (
        <svg viewBox="0 0 60 60" className="w-12 h-12">
          <path d="M28.49 59.97C21.85 59.4 16.93 57.64 12.16 54.15C4.44 48.47 0 39.65 0 29.99C0 15.11 10.51 2.8 25.27.37C31.3-.62 37.97.42 43.56 3.22C57.14 10.04 63.34 25.76 58.21 40.32C54.68 50.32 45.42 57.94 34.81 59.57C32.73 59.89 29.75 60.08 28.49 59.97Z" fill="#0077B5" />
          <path d="M17.88 22.08C20.02 22.08 21.76 20.5 21.76 18.54C21.76 16.59 20.02 15 17.88 15C15.74 15 14 16.59 14 18.54C14 20.5 15.74 22.08 17.88 22.08ZM14.89 44.85H21.85V24.78H14.89V44.85ZM31.61 33.68C31.61 31.38 32.7 29.13 35.3 29.13C37.91 29.13 38.55 31.38 38.55 33.63V44.59H45.48V33.18C45.48 25.25 40.79 23.89 37.91 23.89C35.03 23.89 33.44 24.86 31.61 27.22V24.52H24.67V44.59H31.62V33.68H31.61Z" fill="#FFF" />
        </svg>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 px-6 border-b border-gray-100">
          <h2 
            className="text-xl font-semibold text-[#001e2d]"
            style={{ fontFamily: '"Noto Serif", "Noto Serif Fallback", serif' }}
          >
            Share
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 pt-5">
          <div className="flex overflow-x-auto gap-4 pb-4 mb-2 scrollbar-hide">
            {shareLinks.map((platform) => (
              <a 
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group flex-shrink-0"
                title={`Share to ${platform.name}`}
              >
                <div className="transition-transform group-hover:scale-105 opacity-95 group-hover:opacity-100">
                  {platform.icon}
                </div>
                <span className="text-[13px] text-gray-700 font-medium">{platform.name}</span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 p-1.5 pl-4 bg-gray-50 rounded-lg border border-gray-200 mt-2">
            <input 
              type="text" 
              readOnly 
              value={url} 
              className="flex-1 bg-transparent border-none outline-none text-gray-700 text-sm overflow-hidden text-ellipsis whitespace-nowrap"
            />
            <button 
              onClick={handleCopy}
              className="flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-semibold whitespace-nowrap shadow-sm"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
