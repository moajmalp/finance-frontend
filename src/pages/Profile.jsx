import React, { useState, useRef } from 'react'
import { User, Mail, Shield, Bell, Globe, Camera, ChevronRight, Check, Key, LogOut, Lock, UserCog, Phone, MapPin, Edit2, Save, X, FileText } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import ConfirmationModal from '../components/ui/ConfirmationModal'
import { cn } from '../lib/utils'

const FormItem = ({ label, icon: Icon, children, fullWidth }) => (
    <div className={cn("space-y-3", fullWidth ? "col-span-1 md:col-span-2" : "")}>
        <div className="flex items-center gap-2">
            <Icon size={14} className="text-primary" />
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">{label}</label>
        </div>
        {children}
    </div>
)

const Profile = () => {
    const { user, logout, updateUserCredentials, updateUserProfile } = useAuth()
    const fileInputRef = React.useRef(null)
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false)
    const [showSecurityModal, setShowSecurityModal] = React.useState(false)
    const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false)
    const [securityForm, setSecurityForm] = React.useState({ username: '', password: '', confirmPassword: '' })
    const [error, setError] = React.useState('')

    // Basic Info State
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [profileForm, setProfileForm] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        bio: user?.bio || ''
    })

    // Update form when user data changes
    React.useEffect(() => {
        if (user) {
            setProfileForm({
                full_name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || '',
                location: user.location || '',
                bio: user.bio || ''
            })
        }
    }, [user])

    const handleProfileUpdate = async () => {
        const success = await updateUserProfile(profileForm)
        if (success) setIsEditingProfile(false)
    }
    const handleSecurityUpdate = (e) => {
        e.preventDefault()
        if (securityForm.password !== securityForm.confirmPassword) {
            setError('Passwords do not match')
            return
        }
        if (securityForm.username.length < 3 || securityForm.password.length < 6) {
            setError('Username (min 3) or Password (min 6) too short')
            return
        }
        setIsConfirmModalOpen(true)
    }

    const confirmSecurityUpdate = async () => {
        const success = await updateUserCredentials(securityForm.username, securityForm.password)
        if (success) {
            setShowSecurityModal(false)
            setIsConfirmModalOpen(false)
            setSecurityForm({ username: '', password: '', confirmPassword: '' })
            setError('')
        }
    }

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                updateUserProfile({ profileImage: reader.result })
            }
            reader.readAsDataURL(file)
        }
    }

    const sections = [
        {
            title: 'Security',
            icon: Shield,
            items: [
                { label: 'Two-Factor Authentication', status: 'Enabled', type: 'toggle' },
                { label: 'Login History', status: 'Last login 2h ago', type: 'link' },
                {
                    label: 'Security Access',
                    status: 'Update Credentials',
                    type: 'action',
                    onClick: () => setShowSecurityModal(true),
                    icon: UserCog
                },
            ]
        },
        {
            title: 'Preferences',
            icon: Globe,
            items: [
                { label: 'Currency', status: 'INR (₹)', type: 'select' },
                { label: 'Language', status: 'English (US)', type: 'select' },
                { label: 'Default View', status: 'Dashboard', type: 'select' },
            ]
        },
        {
            title: 'Notifications',
            icon: Bell,
            items: [
                { label: 'Push Notifications', status: 'Active', type: 'toggle' },
                { label: 'Email Reports', status: 'Weekly', type: 'select' },
                { label: 'Budget Alerts', status: 'Instant', type: 'toggle' },
            ]
        }
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-10 max-w-4xl mx-auto">
            <header className="flex flex-col gap-1">
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Identity & Security</h2>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Manage your vault access and system identity</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Profile & Notifications */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-8 flex flex-col items-center text-center gap-8 border-none shadow-premium h-fit rounded-[3rem] glass">
                        <div className="relative group">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                            <div className="h-40 w-40 rounded-[3rem] bg-primary flex items-center justify-center text-white text-5xl font-black shadow-glow transition-transform group-active:scale-95 duration-500 overflow-hidden relative">
                                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 p-4 bg-card border border-border rounded-[1.5rem] shadow-xl text-primary hover:scale-110 active:scale-90 transition-all z-10"
                            >
                                <Camera size={20} />
                            </button>
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight">{user?.full_name || user?.username || 'Power User'}</h3>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Authorized Access</p>
                            </div>
                        </div>

                        <div className="w-full space-y-3 pt-6 border-t border-border">
                            <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground bg-card-muted/50 p-4 rounded-2xl border border-transparent">
                                <Mail size={16} className="text-primary" />
                                <span className="truncate">{user?.email || 'No email set'}</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest gap-2 border-border/50 bg-card/50 active:scale-95 transition-all"
                            onClick={() => setShowLogoutConfirm(true)}
                        >
                            <LogOut size={16} />
                            Terminate Session
                        </Button>
                    </Card>

                    {/* Notifications section moved here */}
                    {sections.filter(s => s.title === 'Notifications').map((section, idx) => (
                        <Card key={idx} className="p-0 overflow-hidden border-none shadow-premium glass">
                            <div className="p-6 border-b border-border bg-card-muted/30 flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-background text-primary shadow-sm">
                                    <section.icon size={18} />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-foreground">{section.title}</h4>
                            </div>
                            <div className="divide-y divide-border/50">
                                {section.items.map((item, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "p-6 flex items-center justify-between hover:bg-card-muted/50 transition-colors group",
                                            item.type === 'action' && "cursor-pointer"
                                        )}
                                        onClick={item.onClick}
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.icon && <item.icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />}
                                            <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black text-primary uppercase tracking-tighter">{item.status}</span>
                                            {item.type === 'toggle' ? (
                                                <div className="h-6 w-11 rounded-full bg-primary/20 p-1 relative">
                                                    <div className="h-4 w-4 rounded-full bg-primary shadow-sm" />
                                                </div>
                                            ) : (
                                                <ChevronRight size={14} className="text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Right Column - Remaining Settings Sections */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information Card */}
                    <Card className="p-0 overflow-hidden border-none shadow-premium glass">
                        <div className="p-6 border-b border-border bg-card-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-background text-primary shadow-sm">
                                    <User size={18} />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Basic Information</h4>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => isEditingProfile ? handleProfileUpdate() : setIsEditingProfile(true)}
                                className={cn(
                                    "h-8 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 transition-all",
                                    isEditingProfile
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
                                        : "bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {isEditingProfile ? (
                                    <>
                                        <Save size={14} />
                                        Save Changes
                                    </>
                                ) : (
                                    <>
                                        <Edit2 size={14} />
                                        Edit Details
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormItem label="Full Name" icon={User}>
                                    {isEditingProfile ? (
                                        <Input
                                            value={profileForm.full_name}
                                            onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                            className="h-10 bg-background/50 border-white/5 focus:border-primary/50"
                                            placeholder="Your Name"
                                        />
                                    ) : (
                                        <p className="font-bold text-foreground text-sm">{user?.full_name || 'Not set'}</p>
                                    )}
                                </FormItem>

                                <FormItem label="Email Address" icon={Mail}>
                                    {isEditingProfile ? (
                                        <Input
                                            value={profileForm.email}
                                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                            className="h-10 bg-background/50 border-white/5 focus:border-primary/50"
                                            placeholder="email@example.com"
                                        />
                                    ) : (
                                        <p className="font-bold text-foreground text-sm">{user?.email || 'Not set'}</p>
                                    )}
                                </FormItem>

                                <FormItem label="Phone Number" icon={Phone}>
                                    {isEditingProfile ? (
                                        <Input
                                            value={profileForm.phone}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                            className="h-10 bg-background/50 border-white/5 focus:border-primary/50"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    ) : (
                                        <p className="font-bold text-foreground text-sm">{user?.phone || 'Not set'}</p>
                                    )}
                                </FormItem>

                                <FormItem label="Location" icon={MapPin}>
                                    {isEditingProfile ? (
                                        <Input
                                            value={profileForm.location}
                                            onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                                            className="h-10 bg-background/50 border-white/5 focus:border-primary/50"
                                            placeholder="City, Country"
                                        />
                                    ) : (
                                        <p className="font-bold text-foreground text-sm">{user?.location || 'Not set'}</p>
                                    )}
                                </FormItem>
                            </div>

                            <FormItem label="Bio / Notes" icon={FileText} fullWidth>
                                {isEditingProfile ? (
                                    <textarea
                                        value={profileForm.bio}
                                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                        className="w-full min-h-[80px] rounded-xl bg-background/50 border border-white/5 p-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                                        placeholder="Add a short bio..."
                                    />
                                ) : (
                                    <p className="font-medium text-muted-foreground text-sm leading-relaxed">
                                        {user?.bio || 'No bio added yet.'}
                                    </p>
                                )}
                            </FormItem>
                        </div>
                    </Card>
                    {sections.filter(s => s.title !== 'Notifications').map((section, idx) => (
                        <Card key={idx} className="p-0 overflow-hidden border-none shadow-premium glass">
                            <div className="p-6 border-b border-border bg-card-muted/30 flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-background text-primary shadow-sm">
                                    <section.icon size={18} />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-foreground">{section.title}</h4>
                            </div>
                            <div className="divide-y divide-border/50">
                                {section.items.map((item, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "p-6 flex items-center justify-between hover:bg-card-muted/50 transition-colors group",
                                            item.type === 'action' && "cursor-pointer"
                                        )}
                                        onClick={item.onClick}
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.icon && <item.icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />}
                                            <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black text-primary uppercase tracking-tighter">{item.status}</span>
                                            {item.type === 'link' || item.type === 'action' ? (
                                                <ChevronRight size={14} className="text-muted-foreground" />
                                            ) : item.type === 'toggle' ? (
                                                <div className="h-6 w-11 rounded-full bg-primary/20 p-1 relative">
                                                    <div className="h-4 w-4 rounded-full bg-primary shadow-sm" />
                                                </div>
                                            ) : (
                                                <ChevronRight size={14} className="text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Full Width Banner (12 grid) */}
                <div className="lg:col-span-3">
                    <Card className="p-8 border-none shadow-glow !bg-primary text-white relative overflow-hidden group rounded-[2.5rem]">
                        <div className="absolute -right-8 -bottom-8 opacity-20 rotate-12 transition-transform group-hover:scale-110 duration-500 text-white">
                            <Shield size={160} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                                Security Shield Active
                                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            </h3>
                            <p className="text-sm font-medium text-white/80 leading-relaxed max-w-2xl">
                                Your account is being monitored for suspicious activity. Encrypted backups was completed at 04:00 AM Today.
                            </p>
                            <Button className="bg-white text-primary hover:bg-white/90 font-black h-11 px-6 rounded-xl text-[10px] uppercase tracking-widest border-none shadow-lg">
                                Download Audit Log
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Security Update Modal */}
            <Modal isOpen={showSecurityModal} onClose={() => setShowSecurityModal(false)}>
                <div className="p-2">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <UserCog size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground tracking-tight">Security Access</h3>
                            <p className="text-sm text-muted-foreground font-medium">Update username and access code</p>
                        </div>
                    </div>

                    <form onSubmit={handleSecurityUpdate} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                label="New Username"
                                placeholder="Enter system identity"
                                value={securityForm.username}
                                onChange={(e) => setSecurityForm({ ...securityForm, username: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="New Access Code"
                                    type="password"
                                    placeholder="••••••••"
                                    value={securityForm.password}
                                    onChange={(e) => setSecurityForm({ ...securityForm, password: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Confirm Code"
                                    type="password"
                                    placeholder="••••••••"
                                    value={securityForm.confirmPassword}
                                    onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button variant="outline" type="button" onClick={() => setShowSecurityModal(false)} className="flex-1 h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 h-14 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl">
                                Update Security
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Logout Confirmation */}
            <ConfirmationModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={logout}
                title="End Secure Session?"
                message="Are you sure you want to log out? You will need your access key to enter the vault again."
                confirmText="Log Out"
                type="primary"
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmSecurityUpdate}
                title="Verify Access Change"
                message="Are you sure you want to update your security credentials? You will need to use your new password for future sessions."
                confirmText="Update Credentials"
                type="primary"
            />
        </div>
    )
}

export default Profile
