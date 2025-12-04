import { clsx } from 'clsx';

type TabId = 'team' | 'stats' | 'users' | 'teams' | 'rooms' | 'timeslots';

interface AdminTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  showTeamTab?: boolean;
}

export default function AdminTabs({ activeTab, onTabChange, showTeamTab = true }: AdminTabsProps) {
  const allTabs = [
    { id: 'team' as const, label: 'Mon Équipe' },
    { id: 'stats' as const, label: 'Statistiques' },
    { id: 'users' as const, label: 'Utilisateurs' },
    { id: 'teams' as const, label: 'Toutes les Équipes' },
    { id: 'rooms' as const, label: 'Gestion Salles' },
    { id: 'timeslots' as const, label: 'Créneaux Horaires' },
  ];

  const tabs = showTeamTab ? allTabs : allTabs.filter(tab => tab.id !== 'team');

  return (
    <div className="flex gap-2 border-b border-white/10 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={clsx(
            "px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0",
            activeTab === tab.id
              ? 'border-neon-rose text-neon-rose'
              : 'border-transparent text-gray-400 hover:text-white'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

