'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, CheckCircle, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { format } from 'date-fns';

type Alert = {
  id: number;
  place_id: number;
  type: string;
  message: string;
  severity: string;
  status: string;
  created_at: string;
  places?: { name: string };
};

type Place = {
  id: number;
  name: string;
};

export default function PlaceAlertsPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');
  const [alertType, setAlertType] = useState('Crowd');
  const [severity, setSeverity] = useState('Medium');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();

    // Subscribe to Alert Changes
    const channel = supabase
      .channel('realtime-alerts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'place_alerts' },
        (payload) => {
          console.log('Realtime alert change:', payload);
          fetchAlerts(); // Refresh list to get joined data correctly
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchPlaces(), fetchAlerts()]);
    setLoading(false);
  };

  const fetchPlaces = async () => {
    const { data } = await supabase.from('places').select('id, name').order('name');
    if (data) setPlaces(data);
  };

  const fetchAlerts = async () => {
    // Note: Join syntax depends on how Supabase client is typed/configured. 
    // Usually simple joins work if foreign keys exist. 
    // If not, we fetch raw and map manually. 
    // Ideally: .select('*, places(name)')
    const { data, error } = await supabase
      .from('place_alerts')
      .select('*, places(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching alerts:', error);
    } else {
      // @ts-ignore - Supabase types join inference can be tricky
      setAlerts(data || []);
    }
  };

  const handleCreateAlert = async () => {
    if (!selectedPlaceId || !message) return alert('Please select a place and enter a message.');

    setSubmitting(true);
    try {
      const { error } = await supabase.from('place_alerts').insert([
        {
          place_id: parseInt(selectedPlaceId),
          type: alertType,
          severity: severity,
          message: message,
          status: 'Active'
        }
      ]);

      if (error) throw error;

      // Reset form
      setMessage('');
      alert('Alert broadcasted successfully!');
    } catch (err: any) {
      alert('Error creating alert: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id: number) => {
    await supabase.from('place_alerts').update({ status: 'Resolved' }).eq('id', id);
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this alert record?')) return;
    await supabase.from('place_alerts').delete().eq('id', id);
  }

  const getSeverityColor = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'high': return 'bg-red-500 hover:bg-red-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-blue-500 hover:bg-blue-600';
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Real-time Place Alerts</h1>
      <p className="text-muted-foreground">
        Broadcast instant notifications about places to all users.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Alert Section */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Alert</CardTitle>
            <CardDescription>
              Select a place and set up its crowd, weather, or traffic alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="place-select">Select Place</Label>
              <Select value={selectedPlaceId} onValueChange={setSelectedPlaceId}>
                <SelectTrigger id="place-select">
                  <SelectValue placeholder="Choose a place..." />
                </SelectTrigger>
                <SelectContent>
                  {places.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type-select">Alert Type</Label>
                <Select value={alertType} onValueChange={setAlertType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Crowd">Crowd</SelectItem>
                    <SelectItem value="Weather">Weather</SelectItem>
                    <SelectItem value="Traffic">Traffic</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity-select">Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low (Info)</SelectItem>
                    <SelectItem value="Medium">Medium (Warning)</SelectItem>
                    <SelectItem value="High">High (Critical)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alert-message">Alert Message</Label>
              <Textarea
                id="alert-message"
                placeholder="e.g., 'Entry restricted due to heavy crowds. Please wait 30 mins.'"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleCreateAlert} disabled={submitting} className="w-full">
              {submitting ? 'Broadcasting...' : 'Broadcast Alert'}
            </Button>
          </CardContent>
        </Card>

        {/* Active Alerts List */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Live Alerts Feed</CardTitle>
            <CardDescription>Real-time list of all system alerts.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[600px] space-y-4">
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No active alerts.</div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-lg border flex flex-col gap-2 relative ${alert.status === 'Resolved' ? 'opacity-60 bg-muted' : 'bg-card'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{alert.type}</Badge>
                      <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                      <span className="text-xs text-muted-foreground ml-2">
                        {format(new Date(alert.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {alert.status === 'Active' && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" title="Resolve" onClick={() => handleResolve(alert.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" title="Delete" onClick={() => handleDelete(alert.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <h4 className="font-semibold text-sm">
                    {alert.places?.name || 'Unknown Place'}
                    {alert.status === 'Resolved' && <span className="ml-2 text-green-600 text-xs">(Resolved)</span>}
                  </h4>
                  <p className="text-sm">{alert.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
