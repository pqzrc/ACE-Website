'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Download, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ExportField {
  key: string;
  label: string;
  description?: string;
}

interface ExportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_FIELDS: ExportField[] = [
  { key: 'firstName', label: 'Prénom', description: 'Prénom de l\'utilisateur' },
  { key: 'lastName', label: 'Nom', description: 'Nom de famille de l\'utilisateur' },
  { key: 'email', label: 'Email', description: 'Adresse email' },
  { key: 'phoneNumber', label: 'Téléphone', description: 'Numéro de téléphone' },
  { key: 'username', label: 'Nom d\'utilisateur', description: 'Nom d\'utilisateur unique' },
  { key: 'composante', label: 'Composante', description: 'Composante universitaire' },
  { key: 'specialty', label: 'Spécialité', description: 'Spécialité d\'études' },
  { key: 'emailVerified', label: 'Email vérifié', description: 'Statut de vérification email' },
  { key: 'teamName', label: 'Équipe', description: 'Nom de l\'équipe' },
  { key: 'teamRole', label: 'Rôle équipe', description: 'Capitaine ou membre' },
  { key: 'roomNumber', label: 'Salle', description: 'Numéro de salle assignée' },
  { key: 'roomName', label: 'Nom salle', description: 'Nom personnalisé de la salle' },
  { key: 'timeSlot', label: 'Créneau horaire', description: 'Créneau horaire assigné' },
  { key: 'currentScore', label: 'Points', description: 'Score actuel de l\'équipe' },
  { key: 'rank', label: 'Classement', description: 'Position au classement' },
  { key: 'registrationStatus', label: 'Statut inscription', description: 'Statut de l\'inscription' },
  { key: 'createdAt', label: 'Date inscription', description: 'Date de création du compte' },
];

export default function ExportCSVModal({ isOpen, onClose }: ExportCSVModalProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'firstName', 'lastName', 'email', 'teamName', 'roomNumber', 'timeSlot', 'currentScore'
  ]);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey)
        ? prev.filter(key => key !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleSelectAll = () => {
    setSelectedFields(AVAILABLE_FIELDS.map(field => field.key));
  };

  const handleSelectNone = () => {
    setSelectedFields([]);
  };

  const handleSelectDefault = () => {
    setSelectedFields(['firstName', 'lastName', 'email', 'teamName', 'roomNumber', 'timeSlot', 'currentScore']);
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      setError('Veuillez sélectionner au moins une colonne à exporter');
      return;
    }

    setExporting(true);
    setError('');

    try {
      const response = await api.post('/admin/export/csv', {
        fields: selectedFields
      }, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/csv, text/csv, */*'
        }
      });

      // Create blob with explicit CSV MIME type for Chrome compatibility
      const csvBlob = new Blob([response.data], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      const url = window.URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const now = new Date();
      const timestamp = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
      const filename = `inscriptions-ace-${timestamp}.csv`;
      
      // Force download attribute for Chrome
      link.setAttribute('download', filename);
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup with slight delay for Chrome
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erreur lors de l\'export CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Exporter CSV</h3>
            <p className="text-sm text-slate-400">Sélectionnez les colonnes à inclure dans l'export</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Tout sélectionner
            </button>
            <button
              onClick={handleSelectNone}
              className="px-3 py-1 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Tout désélectionner
            </button>
            <button
              onClick={handleSelectDefault}
              className="px-3 py-1 text-sm bg-neon-rose/20 hover:bg-neon-rose/30 text-neon-rose rounded-lg transition-colors"
            >
              Sélection par défaut
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          )}

          {/* Fields Selection */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300 mb-3">
              Colonnes disponibles ({selectedFields.length} sélectionnées)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_FIELDS.map((field) => (
                <label
                  key={field.key}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedFields.includes(field.key)
                      ? 'border-neon-rose bg-neon-rose/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field.key)}
                    onChange={() => handleFieldToggle(field.key)}
                    className="mt-0.5 h-4 w-4 text-neon-rose focus:ring-neon-rose border-slate-600 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">
                      {field.label}
                    </div>
                    {field.description && (
                      <div className="text-xs text-slate-400 mt-1">
                        {field.description}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 bg-slate-800/50 border-t border-slate-800">
          <div className="text-sm text-slate-400">
            {selectedFields.length} colonne{selectedFields.length !== 1 ? 's' : ''} sélectionnée{selectedFields.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || selectedFields.length === 0}
              className="bg-neon-rose hover:bg-neon-rose/80 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {exporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Export en cours...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Exporter CSV
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
