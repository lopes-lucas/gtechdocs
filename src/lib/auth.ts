import type { User, UserRole } from '@/app/types';

// Simulação de banco de dados de usuários (em produção, usar banco real)
const USERS_STORAGE_KEY = 'getchdocs_users';
const CURRENT_USER_KEY = 'getchdocs_current_user';

// Usuários padrão do sistema
const DEFAULT_USERS: User[] = [
  {
    id: '1',
    name: 'Admin Sistema',
    email: 'admin@getchdocs.com',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@empresa.com',
    role: 'user',
    createdAt: new Date('2024-01-15'),
  },
];

// Inicializa usuários padrão se não existirem
function initializeUsers() {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
  }
}

// Obtém todos os usuários
export function getAllUsers(): User[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  
  initializeUsers();
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) return DEFAULT_USERS;
  
  const users = JSON.parse(stored);
  return users.map((u: any) => ({
    ...u,
    createdAt: new Date(u.createdAt),
    lastLogin: u.lastLogin ? new Date(u.lastLogin) : undefined,
  }));
}

// Salva usuários
function saveUsers(users: User[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Login
export function login(email: string, password: string): User | null {
  const users = getAllUsers();
  const user = users.find(u => u.email === email);
  
  if (user) {
    // Atualiza último login
    user.lastLogin = new Date();
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    saveUsers(updatedUsers);
    
    // Salva usuário atual
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
    return user;
  }
  
  return null;
}

// Logout
export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Obtém usuário atual
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (!stored) return null;
  
  const user = JSON.parse(stored);
  return {
    ...user,
    createdAt: new Date(user.createdAt),
    lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
  };
}

// Verifica se usuário pode fazer upload
export function canUploadDocuments(user: User): boolean {
  return user.role === 'admin';
}

// Verifica se usuário pode gerenciar outros usuários
export function canManageUsers(user: User): boolean {
  return user.role === 'admin';
}

// Cria novo usuário
export function createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
  const users = getAllUsers();
  
  // Verifica se email já existe
  if (users.some(u => u.email === userData.email)) {
    throw new Error('Email já cadastrado no sistema');
  }
  
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    createdAt: new Date(),
  };
  
  saveUsers([...users, newUser]);
  return newUser;
}

// Atualiza usuário
export function updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User {
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Usuário não encontrado');
  }
  
  // Verifica se email já existe em outro usuário
  if (updates.email && users.some(u => u.email === updates.email && u.id !== userId)) {
    throw new Error('Email já cadastrado no sistema');
  }
  
  const updatedUser = { ...users[userIndex], ...updates };
  users[userIndex] = updatedUser;
  saveUsers(users);
  
  return updatedUser;
}

// Deleta usuário
export function deleteUser(userId: string): boolean {
  const users = getAllUsers();
  const filteredUsers = users.filter(u => u.id !== userId);
  
  if (filteredUsers.length === users.length) {
    return false; // Usuário não encontrado
  }
  
  saveUsers(filteredUsers);
  return true;
}
