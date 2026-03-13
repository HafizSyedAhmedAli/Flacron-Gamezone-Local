"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BackButtonProps {
  href?: string;
  label?: string;
  onClick?: () => void;
}

export function BackButton({ href, label = "Back", onClick }: BackButtonProps) {
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

  const className =
    "group inline-flex items-center gap-2.5 px-5 py-2.5 text-sm bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 rounded-xl backdrop-blur-sm relative overflow-hidden";

  const inner = (
    <>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-cyan-500/5 group-hover:to-blue-500/10 transition-all duration-300" />
      <div className="relative flex items-center gap-2.5">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="font-medium">{label}</span>
      </div>
    </>
  );

  if (href)
    return (
      <Link href={href} className={className} onClick={handleClick}>
        {inner}
      </Link>
    );
  return (
    <button onClick={handleClick} className={className}>
      {inner}
    </button>
  );
}
