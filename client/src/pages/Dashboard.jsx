import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-bg p-8">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-10 pb-6
                      border-b border-border">
        <div>
          <p className="font-mono text-xs text-gold tracking-widest
                        uppercase mb-1">
            Digital Signature System
          </p>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white text-sm font-medium">{user?.name}</p>
            <p className="font-mono text-xs text-gold uppercase">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="font-mono text-xs text-gray-500 hover:text-rose
                       uppercase tracking-wider transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Documents',  value: '0', color: 'text-gold' },
          { label: 'Signed',     value: '0', color: 'text-cyan' },
          { label: 'Verified',   value: '0', color: 'text-success' },
        ].map(stat => (
          <div key={stat.label}
               className="bg-surface border border-border rounded-lg p-6">
            <p className="font-mono text-xs text-gray-500 uppercase
                          tracking-wider mb-2">
              {stat.label}
            </p>
            <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: 'Manage Keys',
            desc:  'Generate your RSA-2048 key pair for signing documents',
            icon:  '🔑',
            path:  '/keys',
            color: 'border-gold/30 hover:border-gold',
          },
          {
            title: 'Create Document',
            desc:  'Create a new invoice or loan approval form',
            icon:  '📄',
            path:  '/documents/create',
            color: 'border-cyan/30 hover:border-cyan',
          },
          {
            title: 'Upload & Sign PDF',
            desc:  'Upload an existing PDF and sign it digitally',
            icon:  '✍️',
            path:  '/documents/upload',
            color: 'border-purple-500/30 hover:border-purple-500',
          },
          {
            title: 'My Documents',
            desc:  'View all your documents and their signature status',
            icon:  '📋',
            path:  '/documents',
            color: 'border-gold/30 hover:border-gold',
          },
          {
            title: 'Verify Document',
            desc:  'Verify the authenticity of a signed document',
            icon:  '✅',
            path:  '/verify',
            color: 'border-success/30 hover:border-success',
          },
          ...(user?.role === 'admin' ? [{
            title: 'Admin Panel',
            desc:  'Manage users, roles and audit logs',
            icon:  '⚙️',
            path:  '/admin',
            color: 'border-rose/30 hover:border-rose',
          }] : []),
        ].map(card => (
          <div
            key={card.title}
            onClick={() => navigate(card.path)}
            className={`bg-surface border ${card.color} rounded-lg p-6
                        cursor-pointer transition-all duration-200
                        hover:bg-panel`}
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <h3 className="text-white font-semibold mb-1">{card.title}</h3>
            <p className="text-gray-500 text-sm">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}