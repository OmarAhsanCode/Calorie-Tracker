import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import FileLogo from '../images/file.svg'

// Header: Sticky, translucent navigation bar to keep branding & auth actions always accessible.
const Header = ({ onOpenAuthModal }) => {
  const { isDarkMode, toggleTheme } = useTheme()
  const { user, signOut, isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/75 dark:bg-gray-900/70 border-b border-white/40 dark:border-gray-700/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-brand-green to-brand-orange p-[2px] shadow-md">
              <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center">
                <img src={FileLogo} alt="CaloFit Logo" className="w-7 h-7" />
              </div>
            </div>
            <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white">CaloFit</span>
            {/* Nav links removed per request; placeholder kept for potential future items */}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-full pl-2 pr-3 py-1 border border-gray-200 dark:border-gray-700 shadow-sm">
                  {user?.picture && (
                    <img
                      src={user.picture}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                    />
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-28 truncate">
                    {user?.given_name || user?.name}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="inline-flex items-center text-sm font-semibold px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center text-sm font-semibold px-5 py-2.5 rounded-full bg-brand-green text-white shadow-sm hover:brightness-105 active:scale-[.98] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green"
              >
                Sign In
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle color theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
