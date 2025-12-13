'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Shield, CheckCircle, XCircle, Trash2, AlertTriangle } from 'lucide-react';
import { AdminUser } from '@/hooks/useAdminData';

interface AdminUsersManagementProps {
    users: AdminUser[];
    onDeleteUser?: (userId: string) => Promise<void>;
}

export default function AdminUsersManagement({ users, onDeleteUser }: AdminUsersManagementProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleDeleteClick = (userId: string) => {
        setConfirmDeleteId(userId);
    };

    const handleConfirmDelete = async (userId: string) => {
        if (!onDeleteUser) return;

        setDeletingUserId(userId);
        try {
            await onDeleteUser(userId);
        } finally {
            setDeletingUserId(null);
            setConfirmDeleteId(null);
        }
    };

    const handleCancelDelete = () => {
        setConfirmDeleteId(null);
    };

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phoneNumber && user.phoneNumber.includes(searchTerm)) ||
        (user.team && user.team.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-sky-aqua" />
                    Gestion des Utilisateurs
                </h2>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-sky-aqua"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950/50 text-slate-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Utilisateur</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Téléphone</th>
                                <th className="px-6 py-4">Équipe</th>
                                <th className="px-6 py-4">Vérifié</th>
                                <th className="px-6 py-4">Inscrit le</th>
                                {onDeleteUser && <th className="px-6 py-4">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredUsers.map((user) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-slate-800/30 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-white">
                                        {user.firstName} {user.lastName}
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4 font-mono text-slate-300">
                                        {user.phoneNumber || <span className="text-slate-600 italic">Non renseigné</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.team ? (
                                            <span className="text-purple-400 font-medium">{user.team.name}</span>
                                        ) : (
                                            <span className="text-slate-600 italic">Aucune équipe</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.emailVerified ? (
                                            <div className="flex items-center gap-1.5 text-green-400">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Oui</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-red-400">
                                                <XCircle className="w-4 h-4" />
                                                <span>Non</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                    </td>
                                    {onDeleteUser && (
                                        <td className="px-6 py-4">
                                            {confirmDeleteId === user.id ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleConfirmDelete(user.id)}
                                                        disabled={deletingUserId === user.id}
                                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {deletingUserId === user.id ? 'Suppression...' : 'Confirmer'}
                                                    </button>
                                                    <button
                                                        onClick={handleCancelDelete}
                                                        disabled={deletingUserId === user.id}
                                                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        Annuler
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleDeleteClick(user.id)}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Supprimer l'utilisateur"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        Aucun utilisateur trouvé
                    </div>
                )}
            </div>

            <div className="text-right text-xs text-slate-500">
                Total: {filteredUsers.length} utilisateur(s)
            </div>
        </div>
    );
}
