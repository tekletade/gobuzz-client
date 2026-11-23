import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../components/Logo';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/leads', label: 'Leads', icon: '👥' },
  { path: '/admin/posts', label: 'Posts', icon: '📝' },
  { path: '/admin/social-posts', label: 'Social Media', icon: '📱' },
  { path: '/admin/settings', label: 'Content Settings', icon: '⚙️' },
  { path: '/admin/categories', label: 'Categories', icon: '📁' },
  { path: '/admin/comments', label: 'Comments', icon: '💬' },
  { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { path: '/admin/newsletter', label: 'Newsletter', icon: '✉️' },
  { path: '/admin/push', label: 'Push Notifications', icon: '🔔' },
  { path: '/admin/social-accounts', label: 'Social Accounts', icon: '🌐' },
   { path: '/admin/email-manager', label: 'Email Manager', icon: '✉️' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-parchment flex relative overflow-hidden">
      
      {/* BACKGROUND PULSE GRAPHIC (Like the Hero) */}
      <div className="fixed top-1/2 right-0 -translate-y-1/2 w-[80vw] h-[50vw] opacity-5 pointer-events-none text-[#86691c] translate-x-[20%] z-0">
        <svg viewBox="272.1 318.6 991.7 399.0" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <clipPath id="clip_LogoMark">
              <path transform="matrix(1,0,0,-1,0,1024)" d="M0 1024H1536V0H0Z"></path>
            </clipPath>
          </defs>
          <g clipPath="url(#clip_LogoMark)">
            <path
              transform="matrix(1,0,0,-1,1035.4328,537.85159)"
              d="M0 0C3.613-.755 3.892 .978 5.442 3.429 16.038 20.179 17.734 53.771 27.906 69.868 30.661 74.228 39.154 79.373 44.307 79.015 69.156 77.286 68.734 17.979 95.012 5.122 117.921-6.088 161.783-3.876 188.809-4.885 191.198-4.975 205.202-5.138 222.436-5.726 200.326-6.945 179.321-9.372 158.628-10.182 142.368-10.818 114.439-13.32 97.815-11.832 63.598-8.768 62.235 10.181 48.354 35.604 47.548 37.078 47.789 41.185 44.468 39.487 35.183 34.739 26.693-34.073 6.008-40.647-12.505-46.53-17.74-22.79-21.167-10.3-34.15 37.019-35.678 90.233-47.43 137.29-48.117 140.042-47.405 143.452-51.355 144.208L-93.409-136.77C-96.157-160.92-119.154-173.765-128.314-145.107L-160.059 25.669C-163.721 28.54-180.53-28.147-182.236-32.138-189.368-48.821-197.478-57.034-216.544-59.056-226.399-60.101-233.89-60.04-242.716-59.951-331.51-59.052-420.138-55.81-508.65-55.245-587.358-54.743-678.615-55.807-757.302-55.307-745.196-53.141-634.388-51.746-631.367-51.712-541.833-50.703-548.619-50.731-461.235-49.481-393.842-48.518-309.191-52.846-244.031-45.416-185.927-38.79-194.88 22.179-174.238 64.572-163.85 85.907-148.96 82.026-140.381 62.12-130.188 13.401-125.712-36.58-115.966-85.361-115.195-89.219-115.993-96.466-110.656-94.847-103.349-41.968-96.718 11.149-88.643 63.929-82.581 103.552-77.685 149.675-68.572 188.077-66.27 197.776-63.665 213.19-50.379 213.213-42.996 213.226-35.76 202.551-34.155 196.005Z"
              fill="currentColor"
            />
          </g>
        </svg>
      </div>

      {/* MOBILE TOP HEADER */}
      <div className="lg:hidden fixed top-0 w-full bg-[#1b1710] text-[#f5f1e6] h-16 px-4 flex justify-between items-center z-50 shadow-lg">
        <Link to="/admin" className="flex items-center">
          <Logo className="h-6 text-[#86691c]" />
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-2xl p-2">
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-screen w-72 bg-[#1b1710] text-[#f5f1e6] flex flex-col z-50 transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Desktop Logo */}
        <div className="hidden lg:flex flex-col p-8 border-b border-[#86691c]/20">
          <Link to="/admin" className="block hover:opacity-80 transition-opacity">
            <Logo className="h-8 text-[#86691c]" />
          </Link>
          <p className="text-[#8a7f6a] text-xs tracking-[0.2em] mt-3 uppercase font-medium">Admin Portal</p>
        </div>

        {/* Mobile Header inside Sidebar */}
        <div className="lg:hidden p-6 border-b border-[#86691c]/20 flex justify-between items-center">
          <span className="font-serif text-xl tracking-widest text-[#86691c]">MENU</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400">✕</button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-6 py-3.5 text-sm tracking-wider transition-all duration-200 ${
                  active
                    ? 'bg-[#86691c]/10 text-[#86691c] border-l-4 border-[#86691c] font-semibold'
                    : 'text-[#f5f1e6]/70 hover:bg-white/5 hover:text-[#f5f1e6] border-l-4 border-transparent'
                }`}
              >
                <span className="text-lg opacity-80">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-6 border-t border-[#86691c]/20 bg-black/20">
          <p className="text-[10px] text-[#8a7f6a] tracking-widest mb-1 uppercase font-semibold">Signed in as</p>
          <p className="text-[#f5f1e6] text-sm mb-4 truncate font-medium">
            {adminUser.email || 'admin@gobuzz.com'}
          </p>
          <button
            onClick={logout}
            className="w-full border border-[#86691c]/50 text-[#86691c] px-4 py-2 text-xs tracking-widest hover:bg-[#86691c] hover:text-white transition-colors rounded-sm uppercase font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT (z-10 to sit above the background pulse) */}
      <main className="flex-1 lg:ml-72 pt-16 lg:pt-0 min-h-screen relative z-10 transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
}