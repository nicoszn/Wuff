export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  balance: number;
  totalInvested: number;
  totalEarned: number;
  currentProfit: number;
  cryptoAddress?: string;
  cryptoNetwork?: string;
  cryptoName?: string;
  status: 'active' | 'blocked';
  createdAt: string;
  investmentId?: string;
}

export interface Plan {
  id: string;
  name: string;
  minCapital: number;
  maxCapital: number;
  dailyPercentage: number;
  days: number;
  description: string;
  color: string;
  icon: string;
}

export interface Investment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  dailyPercentage: number;
  days: number;
  startDate: string;
  endDate: string;
  estimatedProfit: number;
  currentProfit: number;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  cryptoName: string;
  cryptoNetwork: string;
  cryptoAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  adminNote?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ChatConversation {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface DepositAddress {
  id: string;
  name: string;
  address: string;
  network: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  translations: Record<string, string>;
}
