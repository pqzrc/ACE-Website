-- Migration: Add password reset fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "resetPasswordToken" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "resetPasswordExpires" TIMESTAMP WITH TIME ZONE;
