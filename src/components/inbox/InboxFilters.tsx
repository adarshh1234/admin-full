import type { InboxFilterOption } from '../../types/inbox';
import { Button } from '../common/Button';

interface InboxFiltersProps {
  filters: InboxFilterOption[];
  activeFilter: InboxFilterOption['id'];
  onSelect: (filterId: InboxFilterOption['id']) => void;
}

export function InboxFilters({ filters, activeFilter, onSelect }: InboxFiltersProps) {
  return (
    <div className="inbox-filters">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          className={`filter-btn${filter.id === activeFilter ? ' active' : ''}`}
          onClick={() => onSelect(filter.id)}
        >
          {filter.icon && <i className={filter.icon} />} {filter.label}
        </Button>
      ))}
    </div>
  );
}

