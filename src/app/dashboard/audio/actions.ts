'use server';

import { getAllAudioBase64 } from 'google-tts-api';
import { supabase } from '@/lib/supabaseClient';

export async function generateAndUploadAudio(
    text: string,
    language: string,
    placeName: string
) {
    try {
        const base64Results = await getAllAudioBase64(text, {
            lang: language,
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
        });

        const buffers = base64Results.map((base64) =>
            Buffer.from(base64.base64, 'base64')
        );
        const combinedBuffer = Buffer.concat(buffers);

        const fileName = `tts-${placeName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.mp3`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('audio-stories')
            .upload(fileName, combinedBuffer, {
                contentType: 'audio/mpeg',
                upsert: false,
            });

        if (uploadError) {
            console.error('Upload Error:', uploadError);
            throw new Error(`Failed to upload audio: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
            .from('audio-stories')
            .getPublicUrl(fileName);

        return { success: true, url: publicUrlData.publicUrl, fileName };
    } catch (error: any) {
        console.error('TTS Generation Error:', error);
        return { success: false, error: error.message };
    }
}

export async function saveAudioStoryToDB(storyData: any) {
    const { error } = await supabase
        .from('audio_stories')
        .insert([storyData]);

    if (error) {
        console.error("DB Error:", error);
        throw new Error(error.message);
    }
    return { success: true };
}

export async function updateAudioStoryInDB(id: string, storyData: any) {
    const { error } = await supabase
        .from('audio_stories')
        .update(storyData)
        .eq('id', id);

    if (error) {
        console.error("DB Update Error:", error);
        throw new Error(error.message);
    }
    return { success: true };
}
