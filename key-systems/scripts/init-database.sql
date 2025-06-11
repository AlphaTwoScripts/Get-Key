-- Create keys table
CREATE TABLE IF NOT EXISTS keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(64) UNIQUE NOT NULL,
    ip_lock INET,
    hwid_lock VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    used_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked'))
);

-- Create usage_logs table
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id VARCHAR(64) NOT NULL,
    ip INET NOT NULL,
    hwid VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    FOREIGN KEY (key_id) REFERENCES keys(key)
);

-- Create pending_links table for monetized link tracking
CREATE TABLE IF NOT EXISTS pending_links (
    id VARCHAR(32) PRIMARY KEY,
    ip INET NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_keys_status ON keys(status);
CREATE INDEX IF NOT EXISTS idx_keys_created_at ON keys(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_timestamp ON usage_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_logs_key_id ON usage_logs(key_id);
CREATE INDEX IF NOT EXISTS idx_pending_links_created_at ON pending_links(created_at);

-- Insert sample data
INSERT INTO keys (key, ip_lock, created_at, used_count, status) VALUES
('KEY-SAMPLE1234567890ABCDEF1234567890', '192.168.1.100', NOW() - INTERVAL '2 days', 5, 'active'),
('KEY-SAMPLE0987654321FEDCBA0987654321', NULL, NOW() - INTERVAL '1 day', 12, 'active'),
('KEY-SAMPLEEXPIRED123456789012345678', NULL, NOW() - INTERVAL '5 days', 3, 'expired');

INSERT INTO usage_logs (key_id, ip, success) VALUES
('KEY-SAMPLE1234567890ABCDEF1234567890', '192.168.1.100', true),
('KEY-SAMPLE0987654321FEDCBA0987654321', '10.0.0.50', true),
('KEY-SAMPLEEXPIRED123456789012345678', '203.0.113.1', false);
