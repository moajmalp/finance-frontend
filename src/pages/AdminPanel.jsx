import { useState, useEffect } from 'react'
import { Users, UserPlus, Shield, Activity, Search, Edit2, Trash2, Key, Check, X, ShieldAlert, UserCheck, Eye, EyeOff, UserX, AlertCircle, ChevronDown, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'
import { cn } from '../lib/utils'
import haptics from '../lib/haptics'

const AdminPanel = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddUser, setShowAddUser] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showEditUser, setShowEditUser] = useState(false)
    const [editUserData, setEditUserData] = useState(null)
    const [showDetailUser, setShowDetailUser] = useState(false)
    const [detailUserData, setDetailUserData] = useState(null)
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, type: 'danger' })
    const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
    const [securityAlertsCount, setSecurityAlertsCount] = useState(0)
    
    // New User State
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        full_name: '',
        email: '',
        role: 'USER'
    })

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const data = await api.adminFetchUsers()
            setUsers(data)
            
            // Also fetch security alerts count (Intruder detections)
            const logs = await api.fetchSecurityLogs()
            setSecurityAlertsCount(logs.length)
        } catch (error) {
            console.error("Failed to fetch users", error)
            toast.error("Access Denied or Server Error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleCreateUser = async (e) => {
        e.preventDefault()
        try {
            await api.adminCreateUser(newUser)
            toast.success('User created successfully')
            setShowAddUser(false)
            setNewUser({ username: '', password: '', full_name: '', email: '', role: 'USER' })
            fetchUsers()
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create user')
        }
    }

    const handleDeleteUser = async (userId, username) => {
        setConfirmModal({
            show: true,
            title: 'Purge Identity',
            message: `Are you sure you want to PERMANENTLY DELETE user "${username}"? This action cannot be undone.`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    await api.adminDeleteUser(userId)
                    toast.success('Identity purged successfully')
                    fetchUsers()
                } catch (error) {
                    toast.error('Failed to delete user')
                }
            }
        })
    }

    const handleToggleActive = async (user) => {
        setConfirmModal({
            show: true,
            title: user.is_active ? 'Deactivate Identity' : 'Reactivate Identity',
            message: `Are you sure you want to ${user.is_active ? 'deactivate' : 'reactivate'} user "${user.username}"?`,
            type: user.is_active ? 'warning' : 'success',
            onConfirm: async () => {
                try {
                    await api.adminUpdateUser(user.id, { is_active: !user.is_active })
                    toast.success(`Identity ${user.is_active ? 'deactivated' : 'reactivated'}`)
                    fetchUsers()
                } catch (error) {
                    toast.error('Failed to update status')
                }
            }
        })
    }

    const handleEditUser = async (e) => {
        e.preventDefault()
        try {
            await api.adminUpdateUser(editUserData.id, editUserData)
            toast.success('Identity updated successfully')
            setShowEditUser(false)
            fetchUsers()
        } catch (error) {
            toast.error('Failed to update user')
        }
    }

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const stats = [
        { label: 'Total Users', value: users.length, icon: Users, color: 'text-indigo-400' },
        { label: 'Super Admins', value: users.filter(u => u.role === 'SUPER_ADMIN').length, icon: Shield, color: 'text-amber-400' },
        { label: 'Active Users', value: users.filter(u => u.is_active).length, icon: UserCheck, color: 'text-emerald-400' },
        { label: 'Security Alerts', value: securityAlertsCount, icon: ShieldAlert, color: 'text-rose-400' },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <Shield className="text-primary h-8 w-8" />
                        Command Center
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium tracking-wide uppercase text-[10px]">Super Admin Management Console</p>
                </div>
                <button 
                    onClick={() => { haptics.medium(); setShowPassword(false); setShowAddUser(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                >
                    <UserPlus size={18} />
                    Provision New Identity
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="glass-card p-6 border-white/5 hover:border-primary/20 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-2xl font-black mt-1 text-white">{stat.value}</h3>
                            </div>
                            <div className={cn("p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform", stat.color)}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* User List Table */}
            <div className="glass-card overflow-hidden border-white/5">
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <Activity size={16} className="text-primary" />
                        Identity Registry
                    </h2>
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH IDENTITIES..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-bold tracking-widest focus:border-primary/50 focus:outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                <th className="px-6 py-4">Identity</th>
                                <th className="px-6 py-4">Clearance</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode='popLayout'>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground font-bold tracking-widest animate-pulse">
                                            ESTABLISHING SECURE CONNECTION...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground font-bold tracking-widest">
                                            NO MATCHING IDENTITIES FOUND
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((u) => (
                                    <motion.tr 
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        key={u.id} 
                                        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                        onClick={() => { haptics.medium(); setDetailUserData(u); setShowDetailUser(true); }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/20 flex items-center justify-center text-primary font-black shadow-inner">
                                                    {u.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-sm tracking-tight">{u.username}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{u.full_name || 'No Name Provided'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                u.role === 'SUPER_ADMIN' 
                                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]"
                                                    : "bg-primary/10 text-primary border-primary/20"
                                            )}>
                                                {u.role}
                                            </span>
                                            {!u.is_active && (
                                                <span className="ml-2 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                                    DEACTIVATED
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-[11px] font-bold text-muted-foreground tracking-tight">
                                            {u.email || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-[11px] font-bold text-muted-foreground tracking-tight">
                                            {new Date(u.joined_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => { haptics.light(); setDetailUserData(u); setShowDetailUser(true); }}
                                                    className="p-2 hover:bg-white/10 rounded-xl text-muted-foreground hover:text-white transition-all"
                                                    title="View Details"
                                                >
                                                    <Search size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => { haptics.light(); setEditUserData(u); setShowEditUser(true); }}
                                                    className="p-2 hover:bg-white/10 rounded-xl text-muted-foreground hover:text-white transition-all"
                                                    title="Edit Identity"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleToggleActive(u)}
                                                    className={cn(
                                                        "p-2 rounded-xl transition-all",
                                                        u.is_active ? "hover:bg-amber-500/10 text-muted-foreground hover:text-amber-500" : "hover:bg-emerald-500/10 text-emerald-500"
                                                    )}
                                                    title={u.is_active ? "Deactivate Identity" : "Reactivate Identity"}
                                                >
                                                    {u.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id, u.username)}
                                                    className="p-2 hover:bg-rose-500/10 rounded-xl text-muted-foreground hover:text-rose-500 transition-all"
                                                    title="Purge Identity"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            <AnimatePresence>
                {showAddUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddUser(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card w-full max-w-lg p-8 relative z-10 border-white/10 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                    <UserPlus className="text-primary" />
                                    PROVISION IDENTITY
                                </h2>
                                <button onClick={() => { setShowPassword(false); setShowAddUser(false); }} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                    <X size={20} className="text-muted-foreground" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateUser} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Username</label>
                                        <input
                                            required
                                            type="text"
                                            value={newUser.username}
                                            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:border-primary focus:outline-none transition-all"
                                            placeholder="Enter username..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                                        <div className="relative group">
                                            <input
                                                required
                                                type={showPassword ? "text" : "password"}
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm font-bold focus:border-primary focus:outline-none transition-all"
                                                placeholder="Set password..."
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { haptics.light(); setShowPassword(!showPassword); }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newUser.full_name}
                                        onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:border-primary focus:outline-none transition-all"
                                        placeholder="Full legal name..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:border-primary focus:outline-none transition-all"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div className="space-y-2 relative">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Access Level</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddRoleOpen(!isAddRoleOpen)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold flex items-center justify-between hover:bg-white/10 transition-all focus:border-primary"
                                        >
                                            <span className="flex items-center gap-2">
                                                {newUser.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'STANDARD USER'}
                                            </span>
                                            <ChevronDown size={16} className={cn("text-muted-foreground transition-transform", isAddRoleOpen && "rotate-180")} />
                                        </button>
                                        
                                        <AnimatePresence>
                                            {isAddRoleOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute bottom-full mb-2 left-0 right-0 bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[60] backdrop-blur-xl"
                                                >
                                                    {[
                                                        { id: 'USER', label: 'STANDARD USER', icon: Users, color: 'text-primary' },
                                                        { id: 'SUPER_ADMIN', label: 'SUPER ADMIN', icon: Shield, color: 'text-amber-400' }
                                                    ].map((role) => (
                                                        <button
                                                            key={role.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setNewUser({ ...newUser, role: role.id });
                                                                setIsAddRoleOpen(false);
                                                            }}
                                                            className="w-full px-4 py-4 text-left text-sm font-bold flex items-center justify-between hover:bg-white/5 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={newUser.role === role.id ? 'text-white' : 'text-muted-foreground'}>{role.label}</span>
                                                            </div>
                                                            {newUser.role === role.id && <Check size={16} className="text-primary" />}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!newUser.username || !newUser.password || !newUser.full_name || !newUser.email}
                                    className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98] mt-4 disabled:opacity-30 disabled:pointer-events-none disabled:scale-100"
                                >
                                    CONFIRM PROVISIONING
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Confirmation Modal */}
            <AnimatePresence>
                {confirmModal.show && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card w-full max-w-sm p-8 relative z-10 border-white/10 shadow-2xl text-center"
                        >
                            <div className={cn(
                                "h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center border-2",
                                confirmModal.type === 'danger' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : 
                                confirmModal.type === 'warning' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            )}>
                                {confirmModal.type === 'danger' ? <Trash2 size={40} /> : confirmModal.type === 'warning' ? <AlertCircle size={40} /> : <Check size={40} />}
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{confirmModal.title}</h3>
                            <p className="text-muted-foreground text-sm font-medium mb-8 leading-relaxed px-4">{confirmModal.message}</p>
                            
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => { confirmModal.onConfirm(); setConfirmModal({ ...confirmModal, show: false }); }}
                                    className={cn(
                                        "flex-1 px-6 py-4 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg",
                                        confirmModal.type === 'danger' ? "bg-rose-500 shadow-rose-500/20 hover:bg-rose-600" : 
                                        confirmModal.type === 'warning' ? "bg-amber-500 shadow-amber-500/20 hover:bg-amber-600" :
                                        "bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600"
                                    )}
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit User Modal */}
            <AnimatePresence>
                {showEditUser && editUserData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEditUser(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card w-full max-w-lg p-8 relative z-10 border-white/10 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                    <Edit2 className="text-primary" />
                                    RECONFIGURE IDENTITY
                                </h2>
                                <button onClick={() => setShowEditUser(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                    <X size={20} className="text-muted-foreground" />
                                </button>
                            </div>

                            <form onSubmit={handleEditUser} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Username (Immutable)</label>
                                        <input
                                            disabled
                                            type="text"
                                            value={editUserData.username}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold opacity-50 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password (Optional)</label>
                                        <div className="relative group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={editUserData.password || ''}
                                                onChange={(e) => setEditUserData({...editUserData, password: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm font-bold focus:border-primary focus:outline-none transition-all"
                                                placeholder="Leave empty to keep..."
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { haptics.light(); setShowPassword(!showPassword); }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={editUserData.full_name || ''}
                                        onChange={(e) => setEditUserData({...editUserData, full_name: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:border-primary focus:outline-none transition-all"
                                        placeholder="Full legal name..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={editUserData.email || ''}
                                        onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:border-primary focus:outline-none transition-all"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div className="space-y-2 relative">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Access Level</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditRoleOpen(!isEditRoleOpen)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold flex items-center justify-between hover:bg-white/10 transition-all focus:border-primary"
                                        >
                                            <span className="flex items-center gap-2">
                                                {editUserData.role === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'STANDARD USER'}
                                            </span>
                                            <ChevronDown size={16} className={cn("text-muted-foreground transition-transform", isEditRoleOpen && "rotate-180")} />
                                        </button>
                                        
                                        <AnimatePresence>
                                            {isEditRoleOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute bottom-full mb-2 left-0 right-0 bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[60] backdrop-blur-xl"
                                                >
                                                    {[
                                                        { id: 'USER', label: 'STANDARD USER', icon: Users, color: 'text-primary' },
                                                        { id: 'SUPER_ADMIN', label: 'SUPER ADMIN', icon: Shield, color: 'text-amber-400' }
                                                    ].map((role) => (
                                                        <button
                                                            key={role.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setEditUserData({ ...editUserData, role: role.id });
                                                                setIsEditRoleOpen(false);
                                                            }}
                                                            className="w-full px-4 py-4 text-left text-sm font-bold flex items-center justify-between hover:bg-white/5 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={editUserData.role === role.id ? 'text-white' : 'text-muted-foreground'}>{role.label}</span>
                                                            </div>
                                                            {editUserData.role === role.id && <Check size={16} className="text-primary" />}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={!editUserData.full_name || !editUserData.email}
                                        className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none disabled:scale-100"
                                    >
                                        APPLY CHANGES
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* User Detail Modal */}
            <AnimatePresence>
                {showDetailUser && detailUserData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDetailUser(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-card w-full max-w-xl p-0 relative z-10 border-white/10 shadow-2xl overflow-hidden"
                        >
                            {/* Profile Header */}
                            <div className="relative h-32 bg-gradient-to-r from-primary/30 via-indigo-500/20 to-primary/30">
                                <button 
                                    onClick={() => setShowDetailUser(false)} 
                                    className="absolute top-4 right-4 h-10 w-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-10"
                                >
                                    <X size={20} />
                                </button>
                                
                                <div className="absolute -bottom-10 left-8">
                                    <div className="h-24 w-24 rounded-3xl bg-slate-900 border-4 border-slate-900 shadow-2xl flex items-center justify-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-indigo-500/20" />
                                        <span className="text-4xl font-black text-primary relative z-10">
                                            {detailUserData.username.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 pt-14 space-y-8">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">{detailUserData.full_name || detailUserData.username}</h2>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">
                                            @{detailUserData.username} • {detailUserData.role}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                                        detailUserData.is_active ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                    )}>
                                        <div className={cn("h-2 w-2 rounded-full", detailUserData.is_active ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
                                        {detailUserData.is_active ? 'Identity Active' : 'Identity Locked'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                <Mail size={12} className="text-primary" /> Contact Endpoint
                                            </p>
                                            <p className="text-sm font-bold text-white">{detailUserData.email || 'Not Configured'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                <Key size={12} className="text-primary" /> Joined Protocol
                                            </p>
                                            <p className="text-sm font-bold text-white">{new Date(detailUserData.joined_date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                <Shield size={12} className="text-primary" /> Clearance Level
                                            </p>
                                            <p className="text-sm font-bold text-white">{detailUserData.role === 'SUPER_ADMIN' ? 'Level 5 (Super Admin)' : 'Level 1 (Standard)'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                <Activity size={12} className="text-primary" /> Last Session
                                            </p>
                                            <p className="text-sm font-bold text-white italic opacity-50">Unavailable in Current Build</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Biometric Identity</p>
                                        <p className="text-xs text-white/70 leading-relaxed font-medium">
                                            {detailUserData.bio || 'No cryptographic bio signature provided for this identity.'}
                                        </p>
                                    </div>
                                    <div className="h-px bg-white/5" />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Base of Operations</p>
                                            <p className="text-xs font-bold text-white mt-1">{detailUserData.location || 'Global/Remote'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sync Priority</p>
                                            <p className="text-xs font-bold text-primary mt-1">High Intensity</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => { setShowDetailUser(false); setEditUserData(detailUserData); setShowEditUser(true); }}
                                        className="flex-1 h-14 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-widest text-white transition-all"
                                    >
                                        Modify Identity
                                    </button>
                                    <button 
                                        onClick={() => { setShowDetailUser(false); handleToggleActive(detailUserData); }}
                                        className={cn(
                                            "flex-1 h-14 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                                            detailUserData.is_active ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/10" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/10"
                                        )}
                                    >
                                        {detailUserData.is_active ? 'Lock Access' : 'Unlock Access'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AdminPanel
