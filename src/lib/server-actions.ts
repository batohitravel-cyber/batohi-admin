'use server';

import { supabase } from '@/lib/supabaseClient';

export async function getBatohiAnalytics() {
    // Mock implementation or real DB fetch
    // Since tables might not exist, we return default/mock data or try to fetch
    try {
        // Example: count queries
        const { count: queryCount } = await supabase.from('ai_queries').select('*', { count: 'exact', head: true });

        return {
            totalQueries: queryCount || 124, // Mock or real
            accuracy: '94%', // Mock
            rating: '4.8/5' // Mock
        };
    } catch (error) {
        return {
            totalQueries: 0,
            accuracy: '0%',
            rating: '0/0'
        };
    }
}

export async function getTrendingQuestions() {
    // Mock trending
    return [
        { query: "History of Golghar", count: 45 },
        { query: "Best time to visit Bodh Gaya", count: 32 },
        { query: "Chhath Puja dates 2024", count: 28 },
    ];
}

export async function saveBatohiQuery(prompt: string, response: string) {
    try {
        await supabase.from('ai_queries').insert([
            { prompt, response }
        ]);
    } catch (e) {
        console.error("Failed to save query", e);
    }
}

export async function saveBatohiTrainingData(data: { question: string, answer: string }) {
    try {
        const { error } = await supabase.from('ai_training_data').insert([
            { ...data, status: 'pending_review' }
        ]);

        if (error) throw error;
        return { success: true, message: 'Saved successfully' };
    } catch (error: any) {
        console.error("Save training data error:", error);
        return { success: false, message: error.message || 'Unknown error' };
    }
}

export async function getSafetyStats() {
    try {
        const { count: openAlerts } = await supabase
            .from('safety_alerts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Open');

        const { count: inProgress } = await supabase
            .from('safety_alerts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'In Progress');

        const { count: activeHubs } = await supabase
            .from('emergency_contacts')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        return {
            openAlerts: openAlerts || 0,
            inProgress: inProgress || 0,
            activeHubs: activeHubs || 0,
            avgResponseTime: '2m 14s' // Mock for now requires complex query
        };
    } catch (e) {
        return { openAlerts: 0, inProgress: 0, activeHubs: 0, avgResponseTime: '--' };
    }
}

export async function getSafetyAlerts() {
    try {
        const { data: alerts, error } = await supabase
            .from('safety_alerts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!alerts || alerts.length === 0) return [];

        // Collect user IDs to fetch details
        const userIds = alerts.filter(a => a.user_id).map(a => a.user_id);

        let userMap: Record<string, any> = {};

        if (userIds.length > 0) {
            const { data: users } = await supabase
                .from('app_users')
                .select('id, full_name, email, avatar_url, phone_number')
                .in('id', userIds);

            if (users) {
                users.forEach(u => {
                    userMap[u.id] = u;
                });
            }
        }

        // Merge details
        return alerts.map(alert => ({
            ...alert,
            user_details: userMap[alert.user_id] || null
        }));

    } catch (e) {
        console.error("Fetch alerts failed", e);
        // Return active mock data if table empty or error
        return [
            { id: '1', user_name: 'Rahul K', phone: '9876543210', type: 'SOS', status: 'Open', created_at: new Date().toISOString(), address: 'Gandhi Maidan', user_details: null },
            { id: '2', user_name: 'Priya S', phone: '9123456789', type: 'Medical', status: 'In Progress', created_at: new Date(Date.now() - 3600000).toISOString(), address: 'Bodh Gaya', user_details: null }
        ];
    }
}

export async function updateAlertStatus(id: string, status: string, notes?: string) {
    try {
        const updates: any = { status };
        if (status === 'Resolved') {
            updates.resolved_at = new Date().toISOString();
        }
        if (notes) {
            updates.admin_notes = notes;
        }

        const { error } = await supabase
            .from('safety_alerts')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function getEmergencyContacts() {
    try {
        const { data, error } = await supabase
            .from('emergency_contacts')
            .select('*')
            .order('name');

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Fetch contacts failed", e);
        return [];
    }
}

export async function addEmergencyContact(contact: any) {
    try {
        const { error } = await supabase
            .from('emergency_contacts')
            .insert([contact]);

        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}

export async function deleteEmergencyContact(id: string) {
    try {
        const { error } = await supabase
            .from('emergency_contacts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}
