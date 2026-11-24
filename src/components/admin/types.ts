export interface AdminPaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  blobName: string;
  note: string;
  amount?: string;
  promoCode?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface AdminUserRecord {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'student';
  isPaid: boolean;
  isBlocked?: boolean;
  createdAt?: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt?: string;
}

export interface AdminReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status?: 'new' | 'read';
  createdAt: string;
}

export interface AdminGeneralSettings {
  whatsappNumber?: string;
}

export interface AdminNoticeConfig {
  text: string;
  isActive: boolean;
  type: 'info' | 'warning' | 'success';
}

export interface AdminNotificationRecord {
  id: string;
  title: string;
  message: string;
  target: 'all' | 'paid';
  createdAt: string;
}
