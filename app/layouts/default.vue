<script setup lang="ts">
const route = useRoute()

const navItems = [
  { to: '/',               icon: homeIcon,          label: 'Dashboard' },
  { to: '/patients',       icon: usersIcon,         label: 'Patients' },
  { to: '/appointments',   icon: calendarIcon,      label: 'Appointments' },
  { to: '/visits',         icon: clipboardIcon,     label: 'Visits' },
  { to: '/medications',    icon: pillIcon,          label: 'Medications' },
  { to: '/investigations', icon: flaskIcon,         label: 'Investigations' },
  { to: '/payments',       icon: creditCardIcon,    label: 'Payments' },
  { to: '/components',     icon: gridIcon,          label: 'UI Components' },
  { to: '/settings',       icon: settingsIcon,      label: 'Settings' },
]

const sidebarOpen = ref(true)

// Icons (inline SVG strings)
const homeIcon       = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
const usersIcon      = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`
const calendarIcon   = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
const clipboardIcon  = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`
const pillIcon       = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.5 20H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v7.5"/><path d="M16 19h6"/><path d="M19 16v6"/></svg>`
const flaskIcon      = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 3h6v11l4 6H5l4-6z"/><path d="M9 3H5"/><path d="M19 3h-4"/></svg>`
const creditCardIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`
const gridIcon       = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`
const settingsIcon   = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`
const menuIcon       = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`
const bellIcon       = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<template>
  <div class="app-shell">
    <!-- ── Sidebar ── -->
    <aside class="sidebar" :class="sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'" aria-label="Main navigation">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-mark">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#28B9FF" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <Transition name="label-fade">
          <span v-if="sidebarOpen" class="logo-text">Dr. Dalia<br><span class="logo-sub">Clinic</span></span>
        </Transition>
      </div>

      <div class="sidebar-divider" />

      <!-- Nav -->
      <nav class="sidebar-nav" aria-label="App navigation">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item focus-ring"
          :class="isActive(item.to) ? 'nav-item-active' : ''"
          :aria-label="item.label"
        >
          <span class="nav-icon" v-html="item.icon" />
          <Transition name="label-fade">
            <span v-if="sidebarOpen" class="nav-label">{{ item.label }}</span>
          </Transition>
          <div v-if="isActive(item.to)" class="nav-active-bar" />
        </NuxtLink>
      </nav>

      <!-- Bottom -->
      <div class="sidebar-bottom">
        <div class="sidebar-divider" />
        <div class="sidebar-user">
          <AppAvatar name="Dr. Dalia" size="sm" />
          <Transition name="label-fade">
            <div v-if="sidebarOpen" class="user-info">
              <span class="user-name">Dr. Dalia</span>
              <span class="user-role">Administrator</span>
            </div>
          </Transition>
        </div>
      </div>
    </aside>

    <!-- ── Main ── -->
    <div class="main-area">
      <!-- Top Header -->
      <header class="top-header">
        <button class="header-menu-btn focus-ring" aria-label="Toggle sidebar" @click="sidebarOpen = !sidebarOpen" v-html="menuIcon" />
        <div class="header-spacer" />
        <button class="header-icon-btn focus-ring" aria-label="Notifications" v-html="bellIcon">
        </button>
        <AppAvatar name="Dr. Dalia" size="sm" />
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <slot />
      </main>
    </div>

    <!-- Toast Container (global) -->
    <AppToastContainer />
  </div>
</template>

<style scoped>
/* ── Shell ── */
.app-shell {
  display: flex;
  min-height: 100vh;
  background: #050B14;
  position: relative;
}

/* ── Sidebar ── */
.sidebar {
  display: flex;
  flex-direction: column;
  background: rgba(8, 19, 33, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-right: 1px solid rgba(100, 190, 255, 0.12);
  height: 100vh;
  position: sticky;
  top: 0;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 0 24px rgba(0,0,0,0.20);
}
.sidebar-open      { width: 224px; }
.sidebar-collapsed { width: 64px; }

/* ── Logo ── */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  flex-shrink: 0;
  min-height: 64px;
}
.logo-mark {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: rgba(40, 185, 255, 0.12);
  border: 1px solid rgba(40, 185, 255, 0.25);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 16px rgba(40,185,255,0.15);
}
.logo-text {
  font-size: 0.875rem;
  font-weight: 700;
  color: #F4F8FC;
  line-height: 1.25;
  white-space: nowrap;
}
.logo-sub { color: #28B9FF; font-weight: 600; font-size: 0.75rem; }

/* ── Divider ── */
.sidebar-divider { height: 1px; background: rgba(100,190,255,0.08); margin: 0 1rem; flex-shrink: 0; }

/* ── Nav ── */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 10px;
  text-decoration: none;
  color: #8FA3B8;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 150ms ease, color 150ms ease;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  flex-shrink: 0;
}
.nav-item:hover { background: rgba(100,190,255,0.06); color: #F4F8FC; }
.nav-item-active {
  background: rgba(40,185,255,0.10) !important;
  color: #28B9FF !important;
}
.nav-icon { display: flex; flex-shrink: 0; }
.nav-label { flex: 1; overflow: hidden; }
.nav-active-bar {
  position: absolute; left: 0; top: 20%; bottom: 20%;
  width: 3px; border-radius: 0 3px 3px 0;
  background: #28B9FF;
  box-shadow: 0 0 8px rgba(40,185,255,0.50);
}

/* ── Bottom user ── */
.sidebar-bottom { flex-shrink: 0; padding: 0.75rem 0.75rem 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
.sidebar-user { display: flex; align-items: center; gap: 0.75rem; overflow: hidden; }
.user-info { display: flex; flex-direction: column; gap: 0.05rem; overflow: hidden; }
.user-name { font-size: 0.8125rem; font-weight: 600; color: #F4F8FC; white-space: nowrap; }
.user-role { font-size: 0.7rem; color: #5D7187; white-space: nowrap; }

/* ── Main area ── */
.main-area { flex: 1; display: flex; flex-direction: column; min-width: 0; min-height: 100vh; }

/* ── Header ── */
.top-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.5rem;
  height: 64px;
  background: rgba(5, 11, 20, 0.80);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(100,190,255,0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}
.header-menu-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  border-radius: 8px; border: none;
  background: transparent; color: #8FA3B8;
  cursor: pointer; transition: background 150ms ease, color 150ms ease;
}
.header-menu-btn:hover { background: rgba(100,190,255,0.08); color: #F4F8FC; }
.header-spacer { flex: 1; }
.header-icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  border-radius: 8px; border: none;
  background: transparent; color: #8FA3B8;
  cursor: pointer; transition: background 150ms ease, color 150ms ease;
}
.header-icon-btn:hover { background: rgba(100,190,255,0.08); color: #F4F8FC; }

/* ── Page content ── */
.page-content {
  flex: 1;
  padding: 1.75rem clamp(1rem, 4vw, 2rem);
  overflow-x: hidden;
}

/* Sidebar label transition */
.label-fade-enter-active { transition: opacity 150ms ease, transform 150ms ease; transition-delay: 80ms; }
.label-fade-leave-active { transition: opacity 100ms ease, transform 100ms ease; }
.label-fade-enter-from   { opacity: 0; transform: translateX(-6px); }
.label-fade-leave-to     { opacity: 0; transform: translateX(-4px); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .sidebar { display: none; }
  .app-shell { flex-direction: column; }
  .page-content { padding: 1rem; }
}
</style>
