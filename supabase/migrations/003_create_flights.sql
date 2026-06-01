-- Trailmate 航班信息表
-- 用于存储航班基础信息，支持行程规划中的航班查询与推荐

-- 确保 uuid 扩展已启用
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS flights (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_no       VARCHAR(20) NOT NULL,
    dep_city        VARCHAR(50) NOT NULL,
    arr_city        VARCHAR(50) NOT NULL,
    dep_time        VARCHAR(10) NOT NULL,  -- e.g. '08:30'
    arr_time        VARCHAR(10) NOT NULL,
    dep_date        DATE,                   -- optional departure date
    airline         VARCHAR(100) NOT NULL,
    price           DECIMAL(10,2) NOT NULL,
    discount        DECIMAL(3,2) DEFAULT 1.0,
    remaining_seats INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flights_dep_city ON flights(dep_city);
CREATE INDEX IF NOT EXISTS idx_flights_arr_city ON flights(arr_city);
CREATE INDEX IF NOT EXISTS idx_flights_dep_date ON flights(dep_date);

COMMENT ON TABLE flights IS '航班信息表';
COMMENT ON COLUMN flights.flight_no IS '航班号';
COMMENT ON COLUMN flights.dep_city IS '出发城市';
COMMENT ON COLUMN flights.arr_city IS '到达城市';
COMMENT ON COLUMN flights.dep_time IS '出发时间 HH:MM';
COMMENT ON COLUMN flights.arr_time IS '到达时间 HH:MM';
COMMENT ON COLUMN flights.dep_date IS '出发日期';
COMMENT ON COLUMN flights.airline IS '航空公司';
COMMENT ON COLUMN flights.price IS '票价';
COMMENT ON COLUMN flights.discount IS '折扣率 0-1';
COMMENT ON COLUMN flights.remaining_seats IS '剩余座位数';
