'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

export async function getHotels(page = 1, limit = 10, search = '') {
    try {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from('hotels')
            .select('*', { count: 'exact' })
            .range(from, to)
            .order('created_at', { ascending: false });

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        return {
            hotels: data,
            count,
            totalPages: count ? Math.ceil(count / limit) : 0,
            currentPage: page
        };
    } catch (error: any) {
        console.error('Fetch hotels error:', error);
        return { hotels: [], count: 0, totalPages: 0, currentPage: 1, error: error.message };
    }
}

export async function getHotelById(id: number) {
    try {
        const { data, error } = await supabase
            .from('hotels')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { hotel: data };
    } catch (error: any) {
        console.error('Fetch hotel by id error:', error);
        return { error: error.message };
    }
}

export async function createHotel(data: any) {
    try {
        // Remove id if it exists (it's auto-generated)
        const { id, ...hotelData } = data;

        const { data: newHotel, error } = await supabase
            .from('hotels')
            .insert([hotelData])
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/dashboard/hotels');
        return { success: true, hotel: newHotel };
    } catch (error: any) {
        console.error('Create hotel error:', error);
        return { success: false, message: error.message };
    }
}

export async function updateHotel(id: number, data: any) {
    try {
        const { error } = await supabase
            .from('hotels')
            .update(data)
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/dashboard/hotels');
        revalidatePath(`/dashboard/hotels/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error('Update hotel error:', error);
        return { success: false, message: error.message };
    }
}

export async function deleteHotel(id: number) {
    try {
        const { error } = await supabase
            .from('hotels')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/dashboard/hotels');
        return { success: true };
    } catch (error: any) {
        console.error('Delete hotel error:', error);
        return { success: false, message: error.message };
    }
}
