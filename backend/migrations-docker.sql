-- Migration: Create time_slots table
CREATE TABLE IF NOT EXISTS time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_teams INTEGER NOT NULL DEFAULT 6,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Migration: Add time_slot_id to teams table
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS time_slot_id UUID,
ADD CONSTRAINT fk_teams_time_slot 
FOREIGN KEY (time_slot_id) 
REFERENCES time_slots(id) 
ON UPDATE CASCADE 
ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_teams_time_slot_id ON teams(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_is_active ON time_slots(is_active);
