'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Props {
   href?: string;
   label?: string;
   onClick?: () => void;
}

export function BackButton({ href, label = 'Back', onClick }: Props) {
   const router = useRouter();

   const handleClick = (e: React.MouseEvent) => {
      if (onClick) {
         e.preventDefault();
         onClick();
      } else if (!href) {
         e.preventDefault();
         router.back();
      }
   };

   const cls =
      'group inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 hover:border-blue-500/50 rounded-xl transition-all duration-300';

   const inner = (
      <>
         <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
         {label}
      </>
   );

   if (href)
      return (
         <Link href={href} className={cls} onClick={handleClick}>
            {inner}
         </Link>
      );

   return (
      <button onClick={handleClick} className={cls}>
         {inner}
      </button>
   );
}
