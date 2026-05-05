-- J2ST Database Schema for Cloudflare D1

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, 
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  username TEXT PRIMARY KEY,
  display_name TEXT,
  bio TEXT,
  location TEXT,
  discord_id TEXT,
  appearance_json TEXT, -- Storage for colors, effects, etc.
  badges_json TEXT,     -- Array of badge IDs
  links_json TEXT,      -- Array of link objects
  music_title TEXT,
  avatar_url TEXT,
  background_url TEXT,
  music_url TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
