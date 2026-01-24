import { LucideIcon, TrendingUp } from "lucide-react";

interface TeamStatsCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  color: "green" | "yellow" | "red" | "blue" | "purple";
  showTrending?: boolean;
}

const colorStyles = {
  green: {
    gradient: "from-green-500/10 to-green-600/5",
    border: "border-green-500/20",
    hoverBorder: "hover:border-green-500/40",
    hoverShadow: "hover:shadow-green-500/10",
    bg: "bg-green-500/20",
    borderInner: "border-green-500/30",
    text: "text-green-400",
  },
  yellow: {
    gradient: "from-yellow-500/10 to-yellow-600/5",
    border: "border-yellow-500/20",
    hoverBorder: "hover:border-yellow-500/40",
    hoverShadow: "hover:shadow-yellow-500/10",
    bg: "bg-yellow-500/20",
    borderInner: "border-yellow-500/30",
    text: "text-yellow-400",
  },
  red: {
    gradient: "from-red-500/10 to-red-600/5",
    border: "border-red-500/20",
    hoverBorder: "hover:border-red-500/40",
    hoverShadow: "hover:shadow-red-500/10",
    bg: "bg-red-500/20",
    borderInner: "border-red-500/30",
    text: "text-red-400",
  },
  blue: {
    gradient: "from-blue-500/10 to-blue-600/5",
    border: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/40",
    hoverShadow: "hover:shadow-blue-500/10",
    bg: "bg-blue-500/20",
    borderInner: "border-blue-500/30",
    text: "text-blue-400",
  },
  purple: {
    gradient: "from-purple-500/10 to-purple-600/5",
    border: "border-purple-500/20",
    hoverBorder: "hover:border-purple-500/40",
    hoverShadow: "hover:shadow-purple-500/10",
    bg: "bg-purple-500/20",
    borderInner: "border-purple-500/30",
    text: "text-purple-400",
  },
};

export function TeamStatsCard({
  icon: Icon,
  value,
  label,
  color,
  showTrending = false,
}: TeamStatsCardProps) {
  const styles = colorStyles[color];

  return (
    <div
      className={`bg-gradient-to-br ${styles.gradient} backdrop-blur-sm border ${styles.border} rounded-2xl p-6 ${styles.hoverBorder} hover:shadow-lg ${styles.hoverShadow} transition-all duration-300 group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl ${styles.bg} border ${styles.borderInner} flex items-center justify-center group-hover:scale-110 transition-transform`}
        >
          <Icon className={`w-6 h-6 ${styles.text}`} />
        </div>
        {showTrending && (
          <TrendingUp className={`w-5 h-5 ${styles.text} opacity-50`} />
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}
