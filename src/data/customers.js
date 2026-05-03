// Fake customer database. Backend will replace this later.
export const customers = [
  {
    id: 'C001',
    name: 'Sara Al-Otaibi',
    phone: '+966 50 123 4567',
    nationalId: '1098765432',
    email: 'sara@example.com',
    joinedDate: '2024-03-15',
  },
  {
    id: 'C002',
    name: 'Mohammed Al-Harbi',
    phone: '+966 55 987 6543',
    nationalId: '1087654321',
    email: 'mohammed@example.com',
    joinedDate: '2023-11-02',
  },
  {
    id: 'C003',
    name: 'Layla Al-Qahtani',
    phone: '+966 56 234 5678',
    nationalId: '1076543210',
    email: 'layla@example.com',
    joinedDate: '2025-01-20',
  },
  {
    id: 'C004',
    name: 'Abdulrahman Al-Dosari',
    phone: '+966 53 345 6789',
    nationalId: '1065432109',
    email: 'abdulrahman@example.com',
    joinedDate: '2024-07-08',
  },
  {
    id: 'C005',
    name: 'Noura Al-Shammari',
    phone: '+966 54 456 7890',
    nationalId: '1054321098',
    email: 'noura@example.com',
    joinedDate: '2025-04-12',
  },
]

// Helper: find a customer by id
export function findCustomer(id) {
  return customers.find((c) => c.id === id)
}
