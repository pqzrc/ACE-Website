import { useState } from 'react';
import { Building2, Download } from 'lucide-react';
import ExportCSVModal from './ExportCSVModal';

interface Stats {
  overview: {
    totalRegistrations: number;
    verifiedUsers: number;
    totalTeams: number;
    completeTeams: number;
    incompleteTeams: number;
  };
  composanteDistribution: Array<{ composante: string; count: number }>;
}

interface AdminStatsProps {
  stats: Stats;
}

export default function AdminStats({ stats }: AdminStatsProps) {
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-bold text-white">Statistiques Globales</h2>
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-neon-rose hover:bg-neon-rose/90 text-white font-medium rounded-xl transition-all"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm mb-2">Total Inscriptions</p>
          <p className="text-3xl font-bold text-white">{stats.overview.totalRegistrations}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm mb-2">Emails Vérifiés</p>
          <p className="text-3xl font-bold text-sky-aqua">{stats.overview.verifiedUsers}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm mb-2">Total Équipes</p>
          <p className="text-3xl font-bold text-neon-rose">{stats.overview.totalTeams}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm mb-2">Équipes Complètes</p>
          <p className="text-3xl font-bold text-green-400">{stats.overview.completeTeams}</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h3 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-sky-aqua" />
          Répartition par composante
        </h3>
        <div className="space-y-2">
          {stats.composanteDistribution.map((item) => (
            <div key={item.composante} className="flex justify-between items-center p-3 bg-surface rounded-lg">
              <span className="text-gray-300">{item.composante}</span>
              <span className="font-bold text-white">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Export CSV Modal */}
      <ExportCSVModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}

