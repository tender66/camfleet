"use client";

import { createClient } from "@/lib/supabase/client";
import { Video } from "lucide-react";

export default function LoginPage() {
  function signInWithGoogle() {
    const supabase = createClient();
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` },
    });
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-slate-900 border-r border-slate-800 p-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
            <Video className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">CamFleet</p>
            <p className="text-[10px] text-slate-500 tracking-widest uppercase">Radio-Canada</p>
          </div>
        </div>

        <div>
          <p className="text-2xl font-bold text-white leading-snug mb-3">
            Gestion d&apos;inventaire<br />pour le département<br />caméra.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            Suivez vos équipements Sony et Canon, gérez les emprunts et coordonnez les productions — depuis n&apos;importe quel appareil.
          </p>
        </div>

        <p className="text-xs text-slate-600">© 2026 Radio-Canada · CamFleet MVP</p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500">
              <Video className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">CamFleet</p>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase">Radio-Canada</p>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Connexion</h1>
            <p className="text-slate-400 text-sm mt-1.5">
              Utilisez votre compte Google pour accéder à l&apos;application.
            </p>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white text-slate-800 text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>

          <p className="text-center text-xs text-slate-600">
            L&apos;accès doit être approuvé par un gestionnaire avant de pouvoir utiliser l&apos;application.
          </p>
        </div>
      </div>
    </div>
  );
}
