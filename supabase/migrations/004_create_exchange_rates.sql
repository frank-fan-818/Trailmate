-- Trailmate 汇率表
-- 用于存储各币种之间的实时/历史汇率数据

CREATE TABLE IF NOT EXISTS exchange_rates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency   VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate            DECIMAL(18,8) NOT NULL,
    rate_date       DATE NOT NULL,
    source          VARCHAR(50) DEFAULT 'manual',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(base_currency, target_currency, rate_date)
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_base ON exchange_rates(base_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates(base_currency, target_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(rate_date DESC);

COMMENT ON TABLE exchange_rates IS '汇率表，存储各币种之间的实时/历史汇率';
COMMENT ON COLUMN exchange_rates.base_currency IS '基准货币（ISO 4217三位代码）';
COMMENT ON COLUMN exchange_rates.target_currency IS '目标货币（ISO 4217三位代码）';
COMMENT ON COLUMN exchange_rates.rate IS '汇率值（1单位基准货币可兑换的目标货币数量）';
COMMENT ON COLUMN exchange_rates.rate_date IS '汇率日期';
COMMENT ON COLUMN exchange_rates.source IS '数据来源（如 manual, frankfurter, exchangerate-api 等）';
