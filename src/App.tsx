import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import './i18n';

// ==================================================
// CONTEXT & PROVIDERS
// ==================================================
import { SettingsProvider, useSettings } from './context/SettingsContext';
import type { SectionKey } from './lib/settingsKeys';
import ThemeApplier from './components/ThemeApplier';
import FontLoader from './components/FontLoader';

// ==================================================
// GLOBAL CURSOR
// ==================================================
import { Cursor } from './components/Cursor'; // ✅ ADDED

// ==================================================
// PUBLIC COMPONENTS
// ==================================================
import Teaser from './components/Teaser';
import Header from './components/Header';
import LanguageToggle from './components/LanguageToggle';
import Hero from './components/Hero';
import Method from './components/Method';
import Founding from './components/Founding';
import PostFeed from './components/PostFeed';
import SocialFeed from './components/SocialFeed';
import NewsletterSignup from './components/NewsletterSignup';
import LeadForm from './components/LeadForm';
import PushOptIn from './components/PushOptIn';
import Footer from './components/Footer';
import NewPostBadge from './components/NewPostBadge';

// ==================================================
// ADMIN COMPONENTS
// ==================================================
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/Login';
import Dashboard from './admin/Dashboard';
import Leads from './admin/Leads';
import Posts from './admin/Posts';
import SocialPosts from './admin/SocialPosts';
import Settings from './admin/Settings';
import Categories from './admin/Categories';
import CommentsModeration from './admin/CommentsModeration';
import Analytics from './admin/Analytics';
import Newsletter from './admin/Newsletter';
import PushNotifications from './admin/PushNotifications';
import SocialAccounts from './admin/SocialAccounts';
import ForgotPassword from './admin/ForgotPassword';
import ResetPassword from './admin/ResetPassword';
import EmailManager from './admin/EmailManager';

// ==================================================
// SECTION WRAPPER
// ==================================================
function SectionWrapper({
  sectionKey,
  children,
}: {
  sectionKey: SectionKey;
  children: ReactNode;
}) {
  const { get, loading } = useSettings();
  if (loading) return null;
  const enabled = get(`section.${sectionKey}.enabled`) !== 'false';
  if (!enabled) return null;
  return <>{children}</>;
}

// ==================================================
// DYNAMIC APP (moved to /app)
// ==================================================
function DynamicApp() {
  const { loading } = useSettings();

  return (
    <div className="min-h-screen bg-parchment dark:bg-ink text-ink dark:text-parchment transition-colors duration-300">
      <Header />
      <LanguageToggle />

      <SectionWrapper sectionKey="hero"><Hero /></SectionWrapper>
      <SectionWrapper sectionKey="method"><Method /></SectionWrapper>
      <SectionWrapper sectionKey="founding"><Founding /></SectionWrapper>
      <SectionWrapper sectionKey="posts"><PostFeed /></SectionWrapper>
      <SectionWrapper sectionKey="social"><SocialFeed /></SectionWrapper>
      <SectionWrapper sectionKey="newsletter"><NewsletterSignup /></SectionWrapper>
      <SectionWrapper sectionKey="form"><LeadForm /></SectionWrapper>
      <SectionWrapper sectionKey="push"><PushOptIn /></SectionWrapper>
      
      <NewPostBadge />
      {!loading && <Footer />}
    </div>
  );
}

// ==================================================
// AUTH GUARD
// ==================================================
function RequireAuth({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('adminToken');
  return token ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

// ==================================================
// APP
// ==================================================
function App() {
  return (
    <SettingsProvider>
      <ThemeApplier />
      <FontLoader />
      
      {/* ✅ GLOBAL CURSOR MOUNTED HERE */}
      <Cursor />

      <BrowserRouter>
        <Routes>
          {/* TEASER IS THE HOME PAGE */}
          <Route path="/" element={<Teaser />} />

          {/* DYNAMIC SYSTEM MOVED TO /app */}
          <Route path="/app" element={<DynamicApp />} />

          {/* ADMIN */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="posts" element={<Posts />} />
            <Route path="comments" element={<CommentsModeration />} />
            <Route path="categories" element={<Categories />} />
            <Route path="social-posts" element={<SocialPosts />} />
            <Route path="social-accounts" element={<SocialAccounts />} />
            <Route path="newsletter" element={<Newsletter />} />
            <Route path="push" element={<PushNotifications />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="email-manager" element={<EmailManager />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;