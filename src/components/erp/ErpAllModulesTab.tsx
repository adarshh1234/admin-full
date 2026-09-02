import { useState } from 'react';
import { ALL_MODULES } from '../../data/modulesData';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface ErpAllModulesTabProps {
  onNavigateModule: (id: number) => void;
}

const CATEGORIES = ['all', 'core', 'sales', 'people', 'tech', 'legal'] as const;

export function ErpAllModulesTab({ onNavigateModule }: ErpAllModulesTabProps) {
  const [moduleSearch, setModuleSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const filteredModules = ALL_MODULES.filter((m) => {
    const matchesCategory = moduleFilter === 'all' || m.category === moduleFilter;
    const matchesSearch =
      moduleSearch.trim() === '' ||
      m.name.toLowerCase().includes(moduleSearch.trim().toLowerCase()) ||
      m.category.toLowerCase().includes(moduleSearch.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div className="search-bar">
        <Input
          type="text"
          placeholder="Search modules..."
          value={moduleSearch}
          onChange={(e) => setModuleSearch(e.target.value)}
        />
        <div className="filter-btns">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              type="button"
              className={moduleFilter === cat ? 'active' : ''}
              onClick={() => setModuleFilter(cat)}
              style={{ textTransform: 'capitalize' }}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>


      <div className="modules-grid">
        {filteredModules.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: '#6b7a8f' }}>
            <i
              className="fas fa-inbox"
              style={{ fontSize: 28, display: 'block', marginBottom: 10, color: '#c0cad9' }}
            />
            No modules found.
          </div>
        ) : (
          filteredModules.map((m) => (
            <div key={m.id} className="module-card" onClick={() => onNavigateModule(m.id)}>
              <div className="icon">
                <i className={`fas ${m.icon}`} />
              </div>
              <div className="info">
                <div className="name">{m.name}</div>
                <div className="desc">{m.category}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
