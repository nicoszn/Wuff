import { create } from 'zustand';
import { User, Plan, Investment, Transaction, ChatMessage, DepositAddress, Language } from '../types';
import {
  mockUsers,
  mockPlans,
  mockInvestments,
  mockTransactions,
  mockChatMessages,
  mockDepositAddresses,
  defaultLanguages,
} from '../mock/data';

interface AppState {
  // Auth
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  signup: (firstName: string, lastName: string, email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;

  // Plans
  plans: Plan[];
  addPlan: (plan: Plan) => void;
  updatePlan: (id: string, data: Partial<Plan>) => void;
  deletePlan: (id: string) => void;

  // Investments
  investments: Investment[];
  addInvestment: (inv: Investment) => void;
  updateInvestment: (id: string, data: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  markChatRead: (senderId: string, receiverId: string) => void;

  // Deposit Addresses
  depositAddresses: DepositAddress[];
  addDepositAddress: (addr: DepositAddress) => void;
  updateDepositAddress: (id: string, data: Partial<DepositAddress>) => void;
  deleteDepositAddress: (id: string) => void;

  // Languages
  languages: Language[];
  addLanguage: (lang: Language) => void;
  updateLanguage: (code: string, data: Partial<Language>) => void;
  updateLanguageTranslations: (code: string, translations: Record<string, string>) => void;
  deleteLanguage: (code: string) => void;

  // User management (admin)
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addUser: (user: User) => void;
}

const loadData = <T>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(`portbuff-${key}`);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const saveData = (key: string, data: unknown) => {
  localStorage.setItem(`portbuff-${key}`, JSON.stringify(data));
};

export const useStore = create<AppState>((set, get) => ({
  // Auth
  currentUser: loadData<User | null>('currentUser', null),
  users: loadData<User[]>('users', mockUsers),

  login: (email: string, password: string) => {
    const { users } = get();
    const user = users.find(
      (u) => u.email === email && u.password === password && u.status === 'active'
    );
    if (user) {
      set({ currentUser: user });
      saveData('currentUser', user);
      return true;
    }
    return false;
  },

  signup: (firstName: string, lastName: string, email: string, password: string) => {
    const { users } = get();
    if (users.find((u) => u.email === email)) return false;
    const newUser: User = {
      id: `user-${Date.now()}`,
      firstName,
      lastName,
      email,
      password,
      role: 'user',
      balance: 0,
      totalInvested: 0,
      totalEarned: 0,
      currentProfit: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const updated = [...users, newUser];
    set({ users: updated, currentUser: newUser });
    saveData('users', updated);
    saveData('currentUser', newUser);
    return true;
  },

  logout: () => {
    set({ currentUser: null });
    localStorage.removeItem('portbuff-currentUser');
  },

  updateProfile: (data) => {
    const { currentUser, users } = get();
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updated : u));
    set({ currentUser: updated, users: updatedUsers });
    saveData('currentUser', updated);
    saveData('users', updatedUsers);
  },

  // Plans
  plans: loadData<Plan[]>('plans', mockPlans),
  addPlan: (plan) => {
    const updated = [...get().plans, plan];
    set({ plans: updated });
    saveData('plans', updated);
  },
  updatePlan: (id, data) => {
    const updated = get().plans.map((p) => (p.id === id ? { ...p, ...data } : p));
    set({ plans: updated });
    saveData('plans', updated);
  },
  deletePlan: (id) => {
    const updated = get().plans.filter((p) => p.id !== id);
    set({ plans: updated });
    saveData('plans', updated);
  },

  // Investments
  investments: loadData<Investment[]>('investments', mockInvestments),
  addInvestment: (inv) => {
    const updated = [...get().investments, inv];
    set({ investments: updated });
    saveData('investments', updated);
  },
  updateInvestment: (id, data) => {
    const updated = get().investments.map((i) => (i.id === id ? { ...i, ...data } : i));
    set({ investments: updated });
    saveData('investments', updated);
  },
  deleteInvestment: (id) => {
    const updated = get().investments.filter((i) => i.id !== id);
    set({ investments: updated });
    saveData('investments', updated);
  },

  // Transactions
  transactions: loadData<Transaction[]>('transactions', mockTransactions),
  addTransaction: (tx) => {
    const updated = [...get().transactions, tx];
    set({ transactions: updated });
    saveData('transactions', updated);
  },
  updateTransaction: (id, data) => {
    const updated = get().transactions.map((t) => (t.id === id ? { ...t, ...data } : t));
    set({ transactions: updated });
    saveData('transactions', updated);
  },

  // Chat
  chatMessages: loadData<ChatMessage[]>('chatMessages', mockChatMessages),
  addChatMessage: (msg) => {
    const updated = [...get().chatMessages, msg];
    set({ chatMessages: updated });
    saveData('chatMessages', updated);
  },
  markChatRead: (senderId, receiverId) => {
    const updated = get().chatMessages.map((m) =>
      m.senderId === senderId && m.receiverId === receiverId ? { ...m, read: true } : m
    );
    set({ chatMessages: updated });
    saveData('chatMessages', updated);
  },

  // Deposit Addresses
  depositAddresses: loadData<DepositAddress[]>('depositAddresses', mockDepositAddresses),
  addDepositAddress: (addr) => {
    const updated = [...get().depositAddresses, addr];
    set({ depositAddresses: updated });
    saveData('depositAddresses', updated);
  },
  updateDepositAddress: (id, data) => {
    const updated = get().depositAddresses.map((a) => (a.id === id ? { ...a, ...data } : a));
    set({ depositAddresses: updated });
    saveData('depositAddresses', updated);
  },
  deleteDepositAddress: (id) => {
    const updated = get().depositAddresses.filter((a) => a.id !== id);
    set({ depositAddresses: updated });
    saveData('depositAddresses', updated);
  },

  // Languages
  languages: loadData<Language[]>('languages', defaultLanguages),
  addLanguage: (lang) => {
    const updated = [...get().languages, lang];
    set({ languages: updated });
    saveData('languages', updated);
  },
  updateLanguage: (code, data) => {
    const updated = get().languages.map((l) => (l.code === code ? { ...l, ...data } : l));
    set({ languages: updated });
    saveData('languages', updated);
  },
  updateLanguageTranslations: (code, translations) => {
    const updated = get().languages.map((l) =>
      l.code === code ? { ...l, translations } : l
    );
    set({ languages: updated });
    saveData('languages', updated);
  },
  deleteLanguage: (code) => {
    if (code === 'en-US') return; // Can't delete default language
    const updated = get().languages.filter((l) => l.code !== code);
    set({ languages: updated });
    saveData('languages', updated);
  },

  // User management
  updateUser: (id, data) => {
    const updated = get().users.map((u) => (u.id === id ? { ...u, ...data } : u));
    set({ users: updated });
    saveData('users', updated);
    const { currentUser } = get();
    if (currentUser && currentUser.id === id) {
      const updatedUser = { ...currentUser, ...data };
      set({ currentUser: updatedUser });
      saveData('currentUser', updatedUser);
    }
  },
  deleteUser: (id) => {
    const updated = get().users.filter((u) => u.id !== id);
    set({ users: updated });
    saveData('users', updated);
  },
  addUser: (user) => {
    const updated = [...get().users, user];
    set({ users: updated });
    saveData('users', updated);
  },
}));
