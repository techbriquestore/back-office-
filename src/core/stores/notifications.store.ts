import { create } from 'zustand';
import type { AppNotification } from '../types';

interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: AppNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setNotifications: (notifications: AppNotification[]) => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (n) => {
    const notifications = [n, ...get().notifications].slice(0, 50);
    set({ notifications, unreadCount: notifications.filter((x) => !x.read).length });
  },

  markAsRead: (id) => {
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    set({ notifications, unreadCount: notifications.filter((x) => !x.read).length });
  },

  markAllAsRead: () => {
    const notifications = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications, unreadCount: 0 });
  },

  setNotifications: (notifications) => {
    set({ notifications, unreadCount: notifications.filter((x) => !x.read).length });
  },
}));
