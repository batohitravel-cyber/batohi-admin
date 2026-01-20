-- Add ticket_pricing column if it doesn't exist
ALTER TABLE public.places 
ADD COLUMN IF NOT EXISTS ticket_pricing jsonb;

-- Optionally comment out the old column if you want to keep data but stop using it
-- COMMENT ON COLUMN public.places.ticket_price IS 'Deprecated: use ticket_pricing jsonb instead';
