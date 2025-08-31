// Footer: Reduced visual weight to keep focus on core app actions while retaining essential legal links.
const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-green to-brand-orange p-[2px] shadow">
            <div className="w-full h-full rounded-md bg-white flex items-center justify-center text-sm font-bold text-gray-800">
              CF
            </div>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300">© {year} CaloFit</span>
        </div>
        <nav className="flex items-center gap-6 text-xs font-medium text-gray-500 dark:text-gray-400">
          <a href="#privacy" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Privacy</a>
          <a href="#terms" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Terms</a>
          <a href="#contact" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Contact</a>
        </nav>
      </div>
    </footer>
  )
}

export default Footer