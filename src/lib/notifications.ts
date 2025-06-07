import { supabase } from './supabase';

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  content: string;
  reference_id?: string;
  reference_type?: string;
  is_read: boolean;
  created_at: string;
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  content: string,
  referenceId?: string,
  referenceType?: string
): Promise<Notification> {
  const { data, error } = await supabase.rpc('create_notification', {
    p_user_id: userId,
    p_type: type,
    p_content: content,
    p_reference_id: referenceId,
    p_reference_type: referenceType
  });

  if (error) throw error;
  return data;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);

  if (error) throw error;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
} 