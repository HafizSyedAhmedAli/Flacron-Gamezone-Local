'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export function ScrollToTop() {
   const [visible, setVisible] = useState(false);

   useEffect(() => {
      const fn = () => setVisible(window.scrollY > 300);
      window.addEventListener('scroll', fn, { passive: true });
      return () => window.removeEventListener('scroll', fn);
   }, []);

   if (!visible) return null;

   return (
      <button
         onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
         aria-label="Scroll to top"
         className="fixed bottom-8 right-8 z-50 p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full shadow-2xl shadow-blue-500/50 transition-all hover:scale-110"
      >
         <ChevronUp className="w-6 h-6" />
      </button>
   );
}
