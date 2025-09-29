export function buildQuery(filters: any) {
  // Simple query builder implementation
  return {
    where: filters,
    orderBy: 'createdAt',
    order: 'desc'
  };
}
