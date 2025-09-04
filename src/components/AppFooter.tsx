'use client'

export default function AppFooter() {
  return (
    <footer className="mt-10 border-t border-gray-200/70 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span className="font-semibold text-gray-700">Family Weekend Planner</span>
          <span className="ml-2">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4">
          <a className="hover:text-gray-700" href="/api/health">ステータス</a>
          <a className="hover:text-gray-700" href="https://vercel.com" target="_blank" rel="noreferrer">Powered by Next.js</a>
        </div>
      </div>
    </footer>
  )
}

