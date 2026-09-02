import { useToast } from '../../hooks/useToast';
import { useCustomers } from '../../hooks/useCustomers';
import { CustomersTable } from '../customers/CustomersTable';
import { Loader } from '../common/Loader';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export function CustomersPage() {
  const { customers, isLoading, error, query, setQuery } = useCustomers();
  const { showToast } = useToast();

  return (
    <div className="panel">
      <div className="panel-head">
        <h3>
          <i className="fas fa-users" style={{ color: '#2563eb', marginRight: 8 }} /> All Customers
        </h3>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Input
            className="input-search"
            placeholder="Search customers..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToast('Add Customer form coming soon.')}
          >
            <i className="fas fa-plus" /> Add
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Loader label="Loading customers…" />
      ) : error ? (
        <p className="text-muted">{error}</p>
      ) : (
        <CustomersTable customers={customers} />
      )}
    </div>
  );
}
