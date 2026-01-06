-- Add unique constraint for upsert functionality
ALTER TABLE experience_availability
ADD CONSTRAINT experience_availability_experience_id_date_key UNIQUE (experience_id, date);
