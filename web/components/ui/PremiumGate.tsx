"use client";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
  isPremium: boolean;
  feature: string; // e.g. "Live Stream", "AI Preview"
}

export function PremiumGate({ children, isPremium, feature }: Props) {
  const router = useRouter();

  if (isPremium) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-sm opacity-40">
        {children}
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center
                      bg-black/60 rounded-lg backdrop-blur-sm"
      >
        <div className="text-center p-6">
          <div className="text-3xl mb-2">🔒</div>
          <p className="text-white font-semibold text-lg mb-1">
            Premium Feature
          </p>
          <p className="text-gray-300 text-sm mb-4">
            {feature} is available on the Premium plan.
          </p>
          <button
            onClick={() => router.push("/pricing")}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2
                       rounded-full font-semibold text-sm transition"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
}
