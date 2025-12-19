import { useMemo, useState } from 'react';
import type { ChatSession } from '../types/chat.type';

type SortConfig = {
  key: keyof ChatSession;
  direction: 'asc' | 'desc';
};

export function useChatFilters(sessions: ChatSession[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'last_activity',
    direction: 'desc',
  });

  const handleSort = (key: keyof ChatSession) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredAndSortedSessions = useMemo(() => {
    const filtered = sessions.filter(session => {
   const normalizedSearch = searchTerm.toLowerCase().trim();

const matchesSearch =
  normalizedSearch === '' ||
  session.customer_name?.toLowerCase().includes(normalizedSearch) ||
  session.phone?.toLowerCase().includes(normalizedSearch) ||
  session.email?.toLowerCase().includes(normalizedSearch) ||
  session.latest_ticket?.toLowerCase().includes(normalizedSearch) ||
  (!session.is_existing_customer &&
    'anonymous user'.includes(normalizedSearch));


      const matchesStatus =
        statusFilter === 'all' || session.status === statusFilter;

      const matchesCustomerType =
        customerTypeFilter === 'all' ||
        (customerTypeFilter === 'existing' && session.is_existing_customer) ||
        (customerTypeFilter === 'new' && !session.is_existing_customer);

      const matchesDepartment =
        departmentFilter === 'all' || session.department === departmentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCustomerType &&
        matchesDepartment
      );
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'last_activity' || sortConfig.key === 'created_at') {
        aValue = new Date(aValue as string).getTime() as any;
        bValue = new Date(bValue as string).getTime() as any;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [
    sessions,
    searchTerm,
    statusFilter,
    customerTypeFilter,
    departmentFilter,
    sortConfig,
  ]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    customerTypeFilter,
    setCustomerTypeFilter,
    departmentFilter,
    setDepartmentFilter,
    sortConfig,
    handleSort,
    filteredAndSortedSessions,
  };
}
