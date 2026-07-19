-- Phase 2 Updates for Accessories E-Commerce
-- Run this in the Supabase SQL Editor to add the new tables

-- 1. site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Initialize default site settings
INSERT INTO site_settings (key, value) VALUES 
('contact', '{"whatsapp": "917397189222"}'::jsonb),
('hero_banner', '{"title": "Style Your Tech Without Limits", "subtitle": "Discover the finest collection of cases, chargers, and audio gear."}'::jsonb),
('usp_strip', '["🚀 Free Shipping on Orders Over ₹499", "Premium Accessories", "Direct Prices"]'::jsonb),
('store_info', '{"name": "BubbleGum Accessories"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. product_variants
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  color TEXT,
  material TEXT,
  wattage TEXT,
  length TEXT,
  model TEXT,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT UNIQUE
);
