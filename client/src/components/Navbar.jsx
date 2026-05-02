import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import GlassButton from './ui/GlassButton';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleNavbar = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeNavbar = () => setIsMobileMenuOpen(false);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const isActive = (path) => location.pathname === path ? 'text-nature-700 dark:text-nature-100 font-semibold bg-nature-200/50 dark:bg-nature-700/50 shadow-sm' : 'text-nature-600 dark:text-nature-300 hover:bg-nature-100/50 dark:hover:bg-nature-800/50 hover:text-nature-800 dark:hover:text-nature-100';

  return (
    <nav className="sticky top-4 z-40 mx-4 lg:mx-8 mb-8 transition-all duration-300">
      <div className="bg-white/70 dark:bg-nature-800/70 backdrop-blur-md border border-white/40 dark:border-nature-700/50 rounded-2xl shadow-floating px-6 py-3 flex items-center justify-between">
        
        {/* Logo and Brand */}
        <Link className="flex items-center gap-2 text-2xl font-bold text-nature-700 dark:text-nature-100 hover:opacity-80 transition-opacity" to="/" onClick={closeNavbar}>
          <svg className="w-8 h-8 text-nature-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.43 4 16.05 4 12C4 7.95 7.05 4.57 11 4.07V19.93ZM13 4.07C16.95 4.57 20 7.95 20 12C20 16.05 16.95 19.43 13 19.93V4.07Z"/>
          </svg>
          <span>FLORA</span>
        </Link>

        {/* Mobile menu button */}
        {user && (
          <button
            className="lg:hidden p-2 rounded-lg text-nature-600 hover:bg-nature-200/50 focus:outline-none focus:ring-2 focus:ring-nature-500"
            onClick={toggleNavbar}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        )}

        {/* Desktop Menu */}
        {user && (
          <div className="hidden lg:flex items-center space-x-2">
            {[
              { path: '/customers', label: 'customer' },
              { path: '/suppliers', label: 'supplier' },
              { path: '/products', label: 'product' },
              { path: '/entries', label: 'entry' },
              { path: '/report', label: 'report' },
              { path: '/stocks', label: 'stocks' },
              { path: '/debit-credit', label: 'debitCredit' },
              { path: '/settings', label: 'settings' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-xl transition-all duration-200 ${isActive(item.path)}`}
              >
                {t(item.label)}
              </Link>
            ))}

            {user.role === 'admin' && (
              <Link 
                to="/users" 
                className={`px-3 py-2 rounded-xl text-accent-orange font-medium hover:bg-orange-50/50 ${isActive('/users')}`}
              >
                {t('manage_users')}
              </Link>
            )}
          </div>
        )}

        {/* Right side controls */}
        {user && (
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex bg-nature-100/50 dark:bg-nature-900/50 p-1 rounded-xl backdrop-blur-sm border border-nature-200/50 dark:border-nature-700/50">
              <button
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${i18n.language === 'en' ? 'bg-white dark:bg-nature-600 shadow-sm text-nature-800 dark:text-nature-100' : 'text-nature-600 dark:text-nature-400 hover:text-nature-800'}`}
                onClick={() => changeLanguage('en')}
              >
                EN
              </button>
              <button
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${i18n.language === 'ta' ? 'bg-white dark:bg-nature-600 shadow-sm text-nature-800 dark:text-nature-100' : 'text-nature-600 dark:text-nature-400 hover:text-nature-800'}`}
                onClick={() => changeLanguage('ta')}
              >
                TA
              </button>
            </div>
            
            <GlassButton variant="primary" onClick={logout} className="text-sm px-4">
              {t('logout')}
            </GlassButton>
          </div>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {user && isMobileMenuOpen && (
        <div className="lg:hidden mt-2 absolute w-full z-50">
           <div className="bg-white/90 dark:bg-nature-800/90 backdrop-blur-xl border border-white/40 dark:border-nature-700/50 rounded-2xl shadow-floating-hover p-4 flex flex-col gap-2">
            {[
                { path: '/customers', label: 'customer' },
                { path: '/suppliers', label: 'supplier' },
                { path: '/products', label: 'product' },
                { path: '/entries', label: 'entry' },
                { path: '/report', label: 'report' },
                { path: '/stocks', label: 'stocks' },
                { path: '/debit-credit', label: 'debitCredit' },
                { path: '/settings', label: 'settings' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-3 rounded-xl transition-colors ${isActive(item.path)}`}
                onClick={closeNavbar}
              >
                {t(item.label)}
              </Link>
            ))}
            
            {user.role === 'admin' && (
              <Link 
                to="/users" 
                className={`px-4 py-3 rounded-xl text-accent-orange font-medium hover:bg-orange-50/50 ${isActive('/users')}`}
                onClick={closeNavbar}
              >
                {t('manage_users')}
              </Link>
            )}

            <div className="h-px bg-nature-200 dark:bg-nature-700 my-2"></div>
            
            <div className="flex justify-between items-center px-2">
               <div className="flex bg-nature-100/50 dark:bg-nature-900/50 p-1 rounded-xl">
                <button
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${i18n.language === 'en' ? 'bg-white shadow-sm text-nature-800' : 'text-nature-600'}`}
                  onClick={() => { changeLanguage('en'); closeNavbar(); }}
                >
                  EN
                </button>
                <button
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${i18n.language === 'ta' ? 'bg-white shadow-sm text-nature-800' : 'text-nature-600'}`}
                  onClick={() => { changeLanguage('ta'); closeNavbar(); }}
                >
                  TA
                </button>
              </div>
              
              <GlassButton variant="primary" onClick={() => { logout(); closeNavbar(); }} className="text-sm">
                {t('logout')}
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;