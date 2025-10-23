import { Home, LayoutDashboard, Store, PillBottle, User, UserRound, FolderPlus, Contrast } from "lucide-react";

export type IconType = React.ComponentType<{ className?: string }>;
export type RouteEntry = { id: string; label: string; href: string; icon: IconType };
export type EntityEntry = { id: string; label: string; meta?: string; icon: IconType; href?: string };
export type CommandEntry = { id: string; label: string; shortcut?: string; icon: IconType; run: () => void };

export function buildRoutes(): RouteEntry[] {
  return [
    { id: "r-home", label: "Home", href: "/", icon: Home },
    { id: "r-dashboard", label: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
    { id: "r-market", label: "Marketplace", href: "/marketplace", icon: Store },
    { id: "r-prescriptions", label: "Prescriptions", href: "/patient/prescriptions", icon: PillBottle },
    { id: "r-profile", label: "Profile", href: "/patient/profile", icon: User },
  ];
}

export const PATIENTS: EntityEntry[] = [
  { id: "p-1", label: "Aulia Pratama", meta: "ID 10023", icon: UserRound, href: "/doctor/consultation" },
  { id: "p-2", label: "Rudi Hartono", meta: "ID 10024", icon: UserRound, href: "/doctor/consultation" },
  { id: "p-3", label: "Dewi Kartika", meta: "ID 10025", icon: UserRound, href: "/doctor/consultation" },
];

export const DOCTORS: EntityEntry[] = [
  { id: "d-1", label: "Dr. Meida", meta: "Internist", icon: UserRound },
  { id: "d-2", label: "Dr. Andi", meta: "Cardiology", icon: UserRound },
  { id: "d-3", label: "Dr. Rina", meta: "Pulmonology", icon: UserRound },
];

export function buildCommands(navigate: (href: string) => void, toggleTheme: () => void): CommandEntry[] {
  return [
    { id: "c-new-rx", label: "New Prescription", shortcut: "N", icon: FolderPlus, run: () => navigate("/patient/prescriptions") },
    { id: "c-open-profile", label: "Open Profile", shortcut: "P", icon: User, run: () => navigate("/patient/profile") },
    { id: "c-toggle-theme", label: "Toggle Theme", shortcut: "T", icon: Contrast, run: toggleTheme },
  ];
}
