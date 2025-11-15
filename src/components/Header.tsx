// src/components/Header.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Search,
  MessageCircle,
  User2,
  LogOut,
  Home,
  Settings,
  CreditCard,
  CalendarCheck,
  Ticket,
  Building2,
  Sparkles,
} from "lucide-react";

const LINKS = [
  { href: "/venues", label: "Săli" },
  { href: "/events", label: "Evenimente" },
  { href: "/tickets", label: "Bilete" },
  { href: "/activitati", label: "Activități" },
  { href: "/dashboard", label: "Dashboard" }, // только в guest-view
];

export type AppRole = "GUEST" | "USER" | "PROVIDER" | "ADMIN";

export type HeaderProps = {
  isAuthed?: boolean;
  role?: AppRole;
  userName?: string | null;
  userEmail?: string | null;
  userAvatarUrl?: string | null;
};

const Header: React.FC<HeaderProps> = ({
  isAuthed = false,
  role = "GUEST",
  userName,
  userEmail,
  userAvatarUrl,
}) => {
  const [open, setOpen] = useState(false);

  const chatHref = isAuthed ? "/chat" : "/auth?next=/chat";
  const isProvider = role === "PROVIDER";
  const isAdmin = role === "ADMIN";

  const displayName =
    userName || userEmail || (isAuthed ? "Cont BookingArt" : "Guest");
  const displayEmail = userEmail || (isAuthed ? "bookingart.ai" : "");
  const roleLabel = isAdmin
    ? "Admin"
    : isProvider
    ? "Provider"
    : isAuthed
    ? "Client"
    : "";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[rgba(2,9,8,0.92)] backdrop-blur-2xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-3 md:h-16 md:px-6">
          {/* LEFT: menu button */}
          <div className="flex w-[96px] items-center justify-start md:w-[120px]">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.95)] shadow-[0_12px_32px_rgba(0,0,0,0.85)]"
              aria-label="Meniu"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-4 w-4 text-[var(--text-main)]" />
            </button>
          </div>

          {/* CENTER: logo */}
          <a
            href="/"
            className="flex flex-1 items-center justify-center"
            aria-label="BookingArt.ai — platformă de rezervări"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="BookingArt.ai"
              className="h-6 w-auto md:h-7"
            />
          </a>

          {/* RIGHT: actions */}
          <div className="flex w-[96px] items-center justify-end gap-1.5 md:w-[120px] md:gap-2">
            <IconButton href="/search" label="Căutare">
              <Search className="h-4 w-4" />
            </IconButton>

            <IconButton href={chatHref} label="Mesagerie">
              <MessageCircle className="h-4 w-4" />
            </IconButton>

            {!isAuthed ? (
              <a
                href="/auth"
                className="hidden h-9 items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.96)] px-3 text-[11px] font-medium text-[var(--text-main)] shadow-[0_14px_40px_rgba(0,0,0,0.9)] hover:border-[var(--border-accent)] md:inline-flex"
              >
                <User2 className="h-4 w-4" />
                Log in
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Cont"
                className="hidden h-9 items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.96)] px-2.5 text-[11px] text-[var(--text-main)] shadow-[0_14px_40px_rgba(0,0,0,0.9)] hover:border-[var(--border-accent)] md:inline-flex"
              >
                <AvatarCircle
                  size={24}
                  name={displayName}
                  avatarUrl={userAvatarUrl}
                  fallback="BA"
                />
                <span className="max-w-[80px] truncate">{displayName}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {open && (
        <HeaderOverlay
          isAuthed={isAuthed}
          isProvider={isProvider}
          roleLabel={roleLabel}
          displayName={displayName}
          displayEmail={displayEmail}
          avatarUrl={userAvatarUrl}
          chatHref={chatHref}
          onClose={() => setOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default Header;

/* ===== overlay component ===== */

type HeaderOverlayProps = {
  isAuthed: boolean;
  isProvider: boolean;
  roleLabel: string;
  displayName: string;
  displayEmail: string;
  avatarUrl?: string | null;
  chatHref: string;
  onClose: () => void;
  onLogout: () => Promise<void>;
};

function HeaderOverlay({
  isAuthed,
  isProvider,
  roleLabel,
  displayName,
  displayEmail,
  avatarUrl,
  chatHref,
  onClose,
  onLogout,
}: HeaderOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 220);
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex items-stretch justify-start bg-[rgba(2,9,8,0.9)] backdrop-blur-2xl md:items-start md:justify-center md:bg-black/70 md:backdrop-blur-3xl",
        "transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* ПАНЕЛЬ: mobile — слева, занимает ~80% ширины, desktop — центр, max-w-3xl */}
      <div
        className={cn(
          "flex h-full w-[82%] max-w-[420px] flex-col px-4 pt-3 pb-6",
          "md:mt-6 md:h-auto md:w-full md:max-h-[80vh] md:max-w-3xl md:rounded-[28px] md:border md:border-[var(--border-subtle)] md:bg-[rgba(2,9,8,0.97)] md:px-5 md:pb-5 md:shadow-[0_24px_80px_rgba(0,0,0,0.95)]",
          "transition-transform duration-200 ease-out",
          visible ? "translate-y-0" : "translate-y-3"
        )}
      >
        {/* top row */}
        <div className="flex items-center justify-between pb-3 md:pb-4">
          <div className="flex items-center gap-3">
            <AvatarCircle
              size={40}
              name={displayName}
              avatarUrl={avatarUrl}
              fallback={isAuthed ? displayName : "BA"}
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-[var(--text-main)]">
                {isAuthed ? displayName : "Intră în BookingArt.ai"}
              </span>
              <div className="flex flex-wrap items-center gap-1 text-[11px] text-[var(--text-muted)]">
                <span>{displayEmail}</span>
                {roleLabel && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
                    <span className="rounded-full bg-black/50 px-2 py-[1px] text-[10px] uppercase tracking-wide text-[var(--accent)]">
                      {roleLabel}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.95)] shadow-[0_12px_32px_rgba(0,0,0,0.85)]"
            onClick={handleClose}
            aria-label="Close"
          >
            <X className="h-4 w-4 text-[var(--text-main)]" />
          </button>
        </div>

        {/* search */}
        <form action="/search">
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.95)] px-3 py-2 text-sm shadow-[0_14px_40px_rgba(0,0,0,0.9)] focus-within:border-[var(--border-accent)]">
            <Search className="h-4 w-4 text-[var(--text-muted)]" />
            <input
              name="q"
              placeholder="Caută artiști, săli, bilete…"
              className="w-full bg-transparent text-[13px] text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)]"
            />
          </div>
        </form>

        {/* scrollable area */}
        <div className="mt-4 flex-1 space-y-4 overflow-y-auto md:mt-5">
          {!isAuthed ? (
            // ============== GUEST VIEW ==============
            <div className="space-y-4 text-sm">
              <p className="text-[13px] text-[var(--text-muted)]">
                Pentru a accesa profilul, rezervările și mesajele ai nevoie de
                un cont.
              </p>
              <OverlayButton
                href="/auth"
                label="Autentificare / Creează cont"
                accent
                onClick={handleClose}
              />
              <OverlayButton
                href="/provider"
                label="Înscrie-te ca provider"
                onClick={handleClose}
              />

              <div className="mt-4 grid gap-2 text-[12px] text-[var(--text-muted)] md:grid-cols-2">
                {LINKS.map((l) => (
                  <OverlayItem
                    key={l.href}
                    href={l.href}
                    label={l.label}
                    onClick={handleClose}
                  />
                ))}
              </div>
            </div>
          ) : (
            // ============== LOGGED-IN VIEW ==============
            <>
              <nav className="space-y-1.5 text-sm md:grid md:grid-cols-2 md:gap-1.5 md:space-y-0">
                <OverlayItem
                  href="/"
                  icon={<Home className="h-4 w-4" />}
                  label="Acasă"
                  onClick={handleClose}
                />
                <OverlayItem
                  href="/search"
                  icon={<Search className="h-4 w-4" />}
                  label="Căutare"
                  onClick={handleClose}
                />
                <OverlayItem
                  href="/bookings"
                  icon={<CalendarCheck className="h-4 w-4" />}
                  label="Bookings"
                  onClick={handleClose}
                />
                <OverlayItem
                  href="/events"
                  icon={<Ticket className="h-4 w-4" />}
                  label="Evenimente & bilete"
                  onClick={handleClose}
                />
                <OverlayItem
                  href="/venues"
                  icon={<Building2 className="h-4 w-4" />}
                  label="Săli"
                  onClick={handleClose}
                />
                <OverlayItem
                  href="/activitati"
                  icon={<Sparkles className="h-4 w-4" />}
                  label="Activități"
                  onClick={handleClose}
                />
                <OverlayItem
                  href={chatHref}
                  icon={<MessageCircle className="h-4 w-4" />}
                  label="Mesaje & chat"
                  onClick={handleClose}
                />
              </nav>

              <div className="border-t border-[var(--border-subtle)] pt-3 text-sm md:pt-4">
                <div className="space-y-1.5">
                  <OverlayItem
                    href="/profile"
                    icon={<User2 className="h-4 w-4" />}
                    label="Profilul meu"
                    onClick={handleClose}
                  />
                  <OverlayItem
                    href={
                      isProvider ? "/settings/provider" : "/settings/account"
                    }
                    icon={<Settings className="h-4 w-4" />}
                    label="Setări cont"
                    onClick={handleClose}
                  />
                  <OverlayItem
                    href="/billing"
                    icon={<CreditCard className="h-4 w-4" />}
                    label="Plăți (în curând)"
                    onClick={handleClose}
                    subtle
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      handleClose();
                      await onLogout();
                    }}
                    className="mt-2 flex w-full items-center justify-between rounded-2xl border border-[#802438]/70 bg-[#802438]/18 px-3 py-2 text-[13px] font-medium text-[var(--text-main)] shadow-[0_14px_40px_rgba(0,0,0,0.9)]"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Log out
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== helpers ===== */

type IconButtonProps = {
  href: string;
  label: string;
  children: React.ReactNode;
};

function IconButton({ href, label, children }: IconButtonProps) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.95)] text-[var(--text-main)] shadow-[0_12px_32px_rgba(0,0,0,0.85)] hover:border-[var(--border-accent)]"
    >
      {children}
    </a>
  );
}

function AvatarCircle({
  name,
  avatarUrl,
  size = 40,
  fallback,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  fallback?: string;
}) {
  const initials =
    name
      ?.split(" ")
      .map((x) => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || fallback?.slice(0, 2).toUpperCase() || "BA";

  if (avatarUrl) {
    return (
      <div
        className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-black/40 shadow-[0_12px_32px_rgba(0,0,0,0.9)]"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="grid place-items-center rounded-2xl border border-[var(--border-subtle)] bg-[rgba(3,17,13,0.96)] text-xs font-semibold text-[var(--text-main)] shadow-[0_12px_32px_rgba(0,0,0,0.9)]"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

type OverlayItemProps = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  accent?: boolean;
  subtle?: boolean;
};

function OverlayItem({
  href,
  label,
  icon,
  onClick,
  accent,
  subtle,
}: OverlayItemProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between rounded-2xl px-3 py-2.5 text-[13px]",
        "transition-colors duration-200",
        accent
          ? "bg-[radial-gradient(circle_at_0%_0%,rgba(217,176,112,0.20),transparent_55%),radial-gradient(circle_at_120%_140%,rgba(10,48,38,1),rgba(3,17,13,1))] text-[var(--accent)] ring-1 ring-[var(--border-accent)]"
          : subtle
          ? "bg-white/[.03] text-[var(--text-muted)] ring-1 ring-[var(--border-subtle)]"
          : "bg-[radial-gradient(circle_at_0%_0%,rgba(217,176,112,0.12),transparent_55%),radial-gradient(circle_at_120%_140%,rgba(10,48,38,0.96),rgba(3,17,13,0.98))] text-[var(--text-main)] ring-1 ring-[var(--border-subtle)] hover:bg-[radial-gradient(circle_at_0%_0%,rgba(217,176,112,0.20),transparent_55%),radial-gradient(circle_at_120%_140%,rgba(6,32,26,1),rgba(3,17,13,1))]"
      )}
    >
      <span className="flex items-center gap-2">
        {icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-black/50 text-[var(--text-muted)]">
            {icon}
          </span>
        )}
        <span>{label}</span>
      </span>
      {!subtle && (
        <span className="h-[4px] w-[18px] rounded-full bg-white/10 group-hover:bg-[var(--accent)]" />
      )}
    </a>
  );
}

type OverlayButtonProps = {
  href: string;
  label: string;
  onClick?: () => void;
  accent?: boolean;
};

function OverlayButton({ href, label, onClick, accent }: OverlayButtonProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "block rounded-2xl px-3 py-2 text-center text-[13px] font-medium transition-all duration-150",
        accent
          ? "bg-[var(--accent)] text-[#1b1207] shadow-[0_16px_40px_rgba(0,0,0,0.95)] hover:translate-y-[1px]"
          : "bg-white/[.05] text-[var(--text-main)] ring-1 ring-[var(--border-subtle)] hover:bg-white/[.08]"
      )}
    >
      {label}
    </a>
  );
}

function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}
