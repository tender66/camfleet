"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Camera, ArrowLeftRight,
  Clapperboard, MapPin, Users, LogOut, Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/equipment", label: "Équipements", icon: Camera },
  { href: "/loans", label: "Emprunts", icon: ArrowLeftRight },
  { href: "/productions", label: "Productions", icon: Clapperboard },
  { href: "/locations", label: "Lieux", icon: MapPin },
];

const managerItems = [
  { href: "/users", label: "Utilisateurs", icon: Users },
];

function NavItem({ href, label, icon: Icon, exact, pathname }: {
  href: string; label: string; icon: React.ElementType; exact?: boolean; pathname: string;
}) {
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
        active
          ? "bg-indigo-50 text-indigo-700 font-semibold"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-medium"
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-7 h-7 rounded-lg shrink-0",
        active
          ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/40"
          : "bg-slate-100 text-slate-400"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      {label}
    </Link>
  );
}

export function AppSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = profile.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile.email[0].toUpperCase();

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="px-5 pt-6 pb-6 flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500 shadow-md shadow-indigo-500/30">
          <Video className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 tracking-tight">CamFleet</p>
          <p className="text-[10px] text-slate-400 mt-0.5 tracking-widest uppercase">Radio-Canada</p>
        </div>
      </div>

      {/* Nav */}
      <div className="px-4 mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Navigation</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} pathname={pathname} />
        ))}

        {profile.role === "manager" && (
          <>
            <div className="pt-5 pb-2 px-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Administration
              </p>
            </div>
            {managerItems.map((item) => (
              <NavItem key={item.href} {...item} pathname={pathname} />
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
          <Avatar className="h-8 w-8 shrink-0 ring-2 ring-slate-200">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">
              {profile.full_name ?? profile.email}
            </p>
            <p className="text-[10px] text-slate-400">
              {profile.role === "manager" ? "Gestionnaire" : "Personnel"}
            </p>
          </div>
          <button
            onClick={signOut}
            className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
