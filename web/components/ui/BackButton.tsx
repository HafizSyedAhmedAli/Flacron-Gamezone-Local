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

  const content = (
    <>
      <ArrowLeft className="w-4 h-4" />
      {label}
    </>
  );

  const className =
    "inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-slate-800/50";

  if (href) {
    return (
      <Link href={href} className={className} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={handleClick} className={className}>
      {content}
    </button>
  );
}
