'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Bell, Send, BarChart3, Radio, Info, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'event';
  audience: string;
  views: number;
  status: string;
  created_at: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'event'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState({
    active: 0,
    totalViews: 0,
    recent: 0
  });

  useEffect(() => {
    fetchNotifications();

    // Realtime subscription
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setNotifications((prev) => prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n)));
        } else if (payload.eventType === 'DELETE') {
          setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    // Recalculate analytics whenever notifications change
    const active = notifications.filter(n => n.status === 'active').length;
    const totalViews = notifications.reduce((acc, curr) => acc + (curr.views || 0), 0);
    // Recent: created in last 24h
    const recent = notifications.filter(n => {
      const date = new Date(n.created_at);
      const now = new Date();
      return (now.getTime() - date.getTime()) < 24 * 60 * 60 * 1000;
    }).length;

    setAnalytics({ active, totalViews, recent });
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('notifications').insert([
        {
          title,
          message,
          type,
          audience: 'all', // Default for now
          status: 'active'
        }
      ]);

      if (error) throw error;

      // Reset form
      setTitle('');
      setMessage('');
      setType('info');
      // No need to manually update state, subscription will handle it
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Failed to send notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'event': return <Calendar className="w-5 h-5 text-purple-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-600';
      case 'success': return 'bg-green-500/10 border-green-500/20 text-green-600';
      case 'event': return 'bg-purple-500/10 border-purple-500/20 text-purple-600';
      default: return 'bg-blue-500/10 border-blue-500/20 text-blue-600';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Notification Center
          </h1>
          <p className="text-gray-500 mt-2">Manage and monitor real-time platform alerts</p>
        </div>
        <div className="flex gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-green-600">Live System</span>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Alerts</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{analytics.active}</span>
            <span className="text-sm text-green-600 font-medium">+ Now</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Impressions</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{analytics.totalViews}</span>
            <span className="text-sm text-gray-400">views</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent (24h)</h3>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Radio className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{analytics.recent}</span>
            <span className="text-sm text-gray-400">broadcasts</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600" />
              Broadcast New
            </h2>

            <form onSubmit={handleCreateNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., System Maintenance"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Enter detailed notification content..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['info', 'warning', 'success', 'event'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalizetransition-all duration-200 border ${type === t
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Notification
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 px-2">
            <Radio className="w-5 h-5 text-indigo-600" />
            Live Feed
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-500">Connecting to realtime channel...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Notifications</h3>
              <p className="text-gray-500">Broadcast your first alert to see it appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${notification.type === 'warning' ? 'bg-amber-500' :
                    notification.type === 'success' ? 'bg-green-500' :
                      notification.type === 'event' ? 'bg-purple-500' :
                        'bg-blue-500'
                    }`} />

                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl shrink-0 ${getTypeColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate pr-2">
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                          <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                            <BarChart3 className="w-3 h-3" />
                            {notification.views} views
                          </span>
                          <span>
                            {new Date(notification.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide
                                            ${notification.status === 'active' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-600'}
                                        `}>
                          {notification.status}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">• {notification.audience} Audience</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
