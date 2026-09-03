export interface TabDef {
  id: string;
  label: string;
  icon: string;
}

export const TAB_DEFS: TabDef[] = [
  { id: 'tab-daily', label: 'Daily Operations', icon: 'fa-calendar-day' },
  { id: 'tab-weekly', label: 'Weekly Summary', icon: 'fa-calendar-week' },
  { id: 'tab-monthly', label: 'Monthly & Quarterly', icon: 'fa-calendar-alt' },
  { id: 'tab-annual', label: 'Annual Overview', icon: 'fa-chart-line' },
  { id: 'tab-hr', label: 'HR & Staff', icon: 'fa-users' },
  { id: 'tab-crm', label: 'CRM & Sales', icon: 'fa-funnel-dollar' },
  { id: 'tab-accounts', label: 'Accounts & Finance', icon: 'fa-file-invoice-dollar' },
  { id: 'tab-marketing', label: 'Marketing & Leads', icon: 'fa-bullhorn' },
  { id: 'tab-expansion', label: 'Market Expansion', icon: 'fa-globe-americas' },
  { id: 'tab-ai', label: 'AI Suggestions', icon: 'fa-robot' },
];

interface TabsProps {
  active: string;
  onChange: (id: string) => void;
}

export default function MISTabs({ active, onChange }: TabsProps) {
  return (
    <div className="mis-tab-nav">
      {TAB_DEFS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`mis-tab-btn${active === t.id ? ' mis-tab-btn-active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          <i className={`fas ${t.icon}`} /> {t.label}
        </button>
      ))}
    </div>
  );
}
