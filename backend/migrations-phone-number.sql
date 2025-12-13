-- Migration: Add phoneNumber to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "phoneNumber" VARCHAR(255);
