# Supabase Setup for Preserve Marshes Counter

This guide will help you set up the Supabase backend for the "Preserve Marshes" feature.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Your Supabase project URL and anon key

## Database Setup

### 1. Create the Counter Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the marsh_counter table
CREATE TABLE marsh_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  count BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial row
INSERT INTO marsh_counter (id, count) VALUES (1, 0);

-- Add a constraint to ensure only one row
ALTER TABLE marsh_counter ADD CONSTRAINT single_row_check CHECK (id = 1);
```

### 2. Create the User Contributions Table

This table tracks individual user contributions:

```sql
-- Create the marsh_contributions table
CREATE TABLE marsh_contributions (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  contribution BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_marsh_contributions_username ON marsh_contributions(username);
CREATE INDEX idx_marsh_contributions_contribution ON marsh_contributions(contribution DESC);
```

### 3. Create the Increment Functions

These functions ensure atomic increments on the server side:

```sql
-- Create function to increment global counter
CREATE OR REPLACE FUNCTION increment_marsh_counter()
RETURNS BIGINT AS $$
DECLARE
  new_count BIGINT;
BEGIN
  UPDATE marsh_counter 
  SET count = count + 1,
      updated_at = NOW()
  WHERE id = 1
  RETURNING count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment user contribution
CREATE OR REPLACE FUNCTION increment_user_contribution(p_username TEXT)
RETURNS BIGINT AS $$
DECLARE
  new_contribution BIGINT;
BEGIN
  INSERT INTO marsh_contributions (username, contribution)
  VALUES (p_username, 1)
  ON CONFLICT (username) 
  DO UPDATE SET 
    contribution = marsh_contributions.contribution + 1,
    updated_at = NOW()
  RETURNING contribution INTO new_contribution;
  
  RETURN new_contribution;
END;
$$ LANGUAGE plpgsql;
```

### 4. Enable Row Level Security and Set Policies

**IMPORTANT:** You need to set up RLS policies properly for the function to work:

```sql
-- Enable RLS
ALTER TABLE marsh_counter ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the counter
CREATE POLICY "Anyone can read counter" 
ON marsh_counter FOR SELECT 
TO public 
USING (true);

-- Allow anyone to update the counter (needed for the RPC function)
CREATE POLICY "Anyone can update counter" 
ON marsh_counter FOR UPDATE 
TO public 
USING (true)
WITH CHECK (true);

-- Enable RLS for contributions table
ALTER TABLE marsh_contributions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read contributions (for leaderboard)
CREATE POLICY "Anyone can read contributions" 
ON marsh_contributions FOR SELECT 
TO public 
USING (true);

-- Allow anyone to insert/update their own contribution
CREATE POLICY "Anyone can upsert contributions" 
ON marsh_contributions FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Anyone can update contributions" 
ON marsh_contributions FOR UPDATE 
TO public 
USING (true)
WITH CHECK (true);
```

**Alternative:** If you want the functions to bypass RLS entirely, recreate them with SECURITY DEFINER:

```sql
-- Drop the old functions
DROP FUNCTION IF EXISTS increment_marsh_counter();
DROP FUNCTION IF EXISTS increment_user_contribution(TEXT);

-- Create functions with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION increment_marsh_counter()
RETURNS BIGINT 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_count BIGINT;
BEGIN
  UPDATE marsh_counter 
  SET count = count + 1,
      updated_at = NOW()
  WHERE id = 1
  RETURNING count INTO new_count;
  
  RETURN new_count;
END;
$$;

CREATE OR REPLACE FUNCTION increment_user_contribution(p_username TEXT)
RETURNS BIGINT 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_contribution BIGINT;
BEGIN
  INSERT INTO marsh_contributions (username, contribution)
  VALUES (p_username, 1)
  ON CONFLICT (username) 
  DO UPDATE SET 
    contribution = marsh_contributions.contribution + 1,
    updated_at = NOW()
  RETURNING contribution INTO new_contribution;
  
  RETURN new_contribution;
END;
$$;
```

### 5. Enable Realtime (Optional)

If you want real-time counter updates across all clients:

1. Go to Database → Replication in your Supabase dashboard
2. Enable replication for the `marsh_counter` table
3. Optionally enable replication for `marsh_contributions` table for real-time leaderboard updates

## Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials:
   - `PUBLIC_SUPABASE_URL`: Found in Project Settings → API
   - `PUBLIC_SUPABASE_ANON_KEY`: Found in Project Settings → API (public anon key)

Example:
```
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Testing

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `/iraq-marshes/preserve-marshes`

3. Click the "Contribute 1 Liter" button to test the counter

## Security Notes

- The anon key is safe to use in client-side code
- The increment function runs on the server side, preventing manipulation
- Consider adding rate limiting to prevent abuse (can be done with Supabase Edge Functions)
- For production, you may want to add additional security measures

## Troubleshooting

### Counter shows "Loading..." or "0"
- Check that your environment variables are set correctly
- Verify the table and function were created successfully in Supabase
- Check the browser console for error messages

### "Failed to contribute" error
- Verify the RPC function `increment_marsh_counter` exists
- Check Supabase logs for error details
- Ensure your anon key has permission to execute the function

### Real-time updates not working
- Verify that Replication is enabled for the `marsh_counter` table
- Check that your Supabase project has the Realtime feature enabled
