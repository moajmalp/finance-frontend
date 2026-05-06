import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Sparkles, RefreshCw } from 'lucide-react'

/**
 * VersionCheck Component
 * Periodically checks public/version.json for updates and prompts the user to refresh.
 */
const VersionCheck = () => {
    const [currentVersion, setCurrentVersion] = useState(null)

    useEffect(() => {
        // Load initial version on mount
        fetch('/version.json?t=' + Date.now())
            .then(res => {
                if (!res.ok) throw new Error('Version file not found')
                return res.json()
            })
            .then(data => {
                setCurrentVersion(data.version)
            })
            .catch(err => console.debug('[VersionCheck] Initial load failed:', err))

        // Check for updates every 15 minutes
        const interval = setInterval(() => {
            fetch('/version.json?t=' + Date.now())
                .then(res => res.json())
                .then(data => {
                    // If we have a current version and the new one is different, prompt the user
                    if (currentVersion && data.version !== currentVersion) {
                        showUpdateToast(data.message)
                        // Stop checking once we know an update is available to avoid multiple toasts
                        clearInterval(interval)
                    }
                })
                .catch(err => console.debug('[VersionCheck] Polling failed:', err))
        }, 15 * 60 * 1000)

        return () => clearInterval(interval)
    }, [currentVersion])

    const showUpdateToast = (message) => {
        toast((t) => (
            <div className="flex items-center gap-4 py-1">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Sparkles size={20} className="animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground">New Version Ready</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5 truncate">
                        {message || 'Security and performance enhancements.'}
                    </p>
                </div>
                <button
                    onClick={() => {
                        toast.dismiss(t.id)
                        // Force a hard refresh from the server
                        window.location.reload(true)
                    }}
                    className="h-10 px-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <RefreshCw size={12} />
                    Update
                </button>
            </div>
        ), {
            duration: Infinity,
            position: 'bottom-right',
            style: {
                background: 'var(--card)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--border)',
                borderRadius: '1.5rem',
                padding: '1rem',
                maxWidth: '420px',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
            }
        })
    }

    return null
}

export default VersionCheck
