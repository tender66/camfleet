"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Camera, ArrowLeftRight, Clapperboard, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/equipment", label: "Équipements", icon: Camera },
  { href: "/loans", label: "Emprunts", icon: ArrowLeftRight },
  { href: "/productions", label: "Productions", icon: Clapperboard },
  { href: "/locations", label: "Lieux", icon: MapPin },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2.5 text-[9px] font-bold uppercase tracking-wide transition-colors",
                active ? "text-indigo-600" : "text-slate-400"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
