'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trash2, UserPlus, Search, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Team {
    id: string;
    name: string;
    inviteCode: string;
    roomNumber: number | null;
    memberCount: number;
    isComplete: boolean;
    captain: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    } | null;
    members: Array<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    }>;
}

interface AdminTeamsManagementProps {
    teams: Team[];
    onRefresh: () => void;
}

export default function AdminTeamsManagement({ teams, onRefresh }: AdminTeamsManagementProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal states
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamCaptainEmail, setNewTeamCaptainEmail] = useState('');
    const [createWithoutCaptain, setCreateWithoutCaptain] = useState(false);

    const handleDeleteTeam = async (teamId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action est irréversible.')) return;

        try {
            await api.delete(`/admin/teams/${teamId}`);
            setSuccess('Équipe supprimée avec succès.');
            onRefresh();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la suppression de l\'équipe.');
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName || (!createWithoutCaptain && !newTeamCaptainEmail)) return;

        try {
            const payload: { name: string; captainEmail?: string } = {
                name: newTeamName
            };
            
            if (!createWithoutCaptain && newTeamCaptainEmail) {
                payload.captainEmail = newTeamCaptainEmail;
            }

            await api.post('/admin/teams/create', payload);
            setSuccess('Équipe créée avec succès.');
            setShowCreateTeamModal(false);
            setNewTeamName('');
            setNewTeamCaptainEmail('');
            setCreateWithoutCaptain(false);
            onRefresh();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la création de l\'équipe.');
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeamId || !newMemberEmail) return;

        try {
            await api.post('/admin/teams/add-member', {
                teamId: selectedTeamId,
                userEmail: newMemberEmail
            });
            setSuccess('Membre ajouté avec succès.');
            setShowAddMemberModal(false);
            setNewMemberEmail('');
            setSelectedTeamId(null);
            onRefresh();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'ajout du membre.');
        }
    };

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.captain && team.captain.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        team.inviteCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-6 h-6 text-purple-400" />
                    Gestion des Équipes
                </h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowCreateTeamModal(true)}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        Créer une équipe
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une équipe..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <p>{success}</p>
                </div>
            )}

            <div className="grid gap-4">
                {filteredTeams.map((team) => (
                    <motion.div
                        key={team.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-xl p-6"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    {team.name}
                                    {team.isComplete && (
                                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                                            Complet
                                        </span>
                                    )}
                                </h3>
                                <div className="text-sm text-slate-400 mt-1">
                                    Code: <span className="font-mono text-purple-400">{team.inviteCode}</span> •
                                    Salle: {team.roomNumber || 'Non assignée'}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedTeamId(team.id);
                                        setShowAddMemberModal(true);
                                    }}
                                    className="p-2 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                                    title="Ajouter un membre"
                                >
                                    <UserPlus className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteTeam(team.id)}
                                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                    title="Supprimer l'équipe"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-yellow-400">
                                <span className="font-bold">Capitaine:</span>
                                {team.captain ? (
                                    `${team.captain.firstName} ${team.captain.lastName} (${team.captain.email})`
                                ) : (
                                    <span className="text-slate-400 italic">Aucun capitaine assigné</span>
                                )}
                            </div>
                            {team.members.length > 0 && (
                                <div className="space-y-1">
                                    <div className="text-sm font-bold text-slate-300">Membres:</div>
                                    {team.members.map((member) => (
                                        <div key={member.id} className="text-sm text-slate-400 pl-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                            {member.firstName} {member.lastName} ({member.email})
                                        </div>
                                    ))}
                                </div>
                            )}
                            {team.members.length === 0 && (
                                <div className="text-sm text-slate-500 italic">Aucun membre supplémentaire</div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {filteredTeams.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        Aucune équipe trouvée
                    </div>
                )}
            </div>

            {/* Create Team Modal */}
            {showCreateTeamModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-4">Créer une équipe</h3>
                        <form onSubmit={handleCreateTeam}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Nom de l'équipe</label>
                                <input
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                    placeholder="Nom de l'équipe (3-50 caractères)"
                                    minLength={3}
                                    maxLength={50}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <input
                                        type="checkbox"
                                        id="createWithoutCaptain"
                                        checked={createWithoutCaptain}
                                        onChange={(e) => {
                                            setCreateWithoutCaptain(e.target.checked);
                                            if (e.target.checked) {
                                                setNewTeamCaptainEmail('');
                                            }
                                        }}
                                        className="w-4 h-4 text-purple-600 bg-slate-950 border-slate-700 rounded focus:ring-purple-500"
                                    />
                                    <label htmlFor="createWithoutCaptain" className="text-sm font-medium text-slate-300">
                                        Créer sans capitaine spécifique
                                    </label>
                                </div>
                                
                                {!createWithoutCaptain && (
                                    <>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Email du capitaine</label>
                                        <input
                                            type="email"
                                            value={newTeamCaptainEmail}
                                            onChange={(e) => setNewTeamCaptainEmail(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                            placeholder="email@example.com"
                                            required={!createWithoutCaptain}
                                        />
                                        <p className="text-xs text-slate-500 mt-2">
                                            L'utilisateur avec cet email deviendra le capitaine de l'équipe. Il ne doit pas déjà faire partie d'une équipe.
                                        </p>
                                    </>
                                )}
                                
                                {createWithoutCaptain && (
                                    <p className="text-xs text-slate-500 mt-2">
                                        L'équipe sera créée sans capitaine. Vous pourrez ajouter des membres plus tard.
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateTeamModal(false);
                                        setNewTeamName('');
                                        setNewTeamCaptainEmail('');
                                        setCreateWithoutCaptain(false);
                                    }}
                                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {showAddMemberModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-4">Ajouter un membre</h3>
                        <form onSubmit={handleAddMember}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email de l'utilisateur</label>
                                <input
                                    type="email"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                    placeholder="email@example.com"
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    Entrez l'email de l'utilisateur à ajouter. L'utilisateur ne doit pas avoir d'équipe.
                                </p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddMemberModal(false);
                                        setNewMemberEmail('');
                                        setSelectedTeamId(null);
                                    }}
                                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Ajouter
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
