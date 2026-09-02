import { useEffect, useMemo, useState } from 'react';
import { customersService } from '../services/customers.service';
import type { Customer } from '../types/customer';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    customersService
      .getCustomers()
      .then((data) => {
        if (isMounted) setCustomers(data);
      })
      .catch(() => {
        if (isMounted) setError('Unable to load customers right now.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);


  const filteredCustomers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.company, customer.email, customer.owner, ...customer.tags]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  }, [customers, query]);

  return { customers: filteredCustomers, isLoading, error, query, setQuery };
}
