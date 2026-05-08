-- Trailmate 工作流任务状态表
-- 用于记录每个工作流的执行状态，支持任务追踪、失败恢复、性能监控

CREATE TABLE IF NOT EXISTS workflow_tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 关联信息
    request_id      UUID NOT NULL,
    workflow_type   VARCHAR(50) NOT NULL DEFAULT 'itinerary_generation',

    -- 状态信息
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    current_step    VARCHAR(50) NOT NULL DEFAULT 'init',

    -- 错误信息
    error_msg       TEXT,
    error_step      VARCHAR(50),

    -- 执行记录（JSONB存储详细日志）
    execution_log   JSONB DEFAULT '[]'::jsonb,

    -- 时间戳
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,

    -- 性能指标
    duration_ms     INTEGER
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_request_id ON workflow_tasks(request_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_status ON workflow_tasks(status);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_current_step ON workflow_tasks(current_step);
CREATE INDEX IF NOT EXISTS idx_workflow_tasks_created_at ON workflow_tasks(created_at DESC);

-- 注释
COMMENT ON TABLE workflow_tasks IS '工作流任务状态表，记录每个工作流的执行状态';
COMMENT ON COLUMN workflow_tasks.execution_log IS '执行日志数组，记录每个步骤的开始/结束时间';
COMMENT ON COLUMN workflow_tasks.request_id IS '关联的请求ID';
COMMENT ON COLUMN workflow_tasks.workflow_type IS '工作流类型，如 itinerary_generation';
COMMENT ON COLUMN workflow_tasks.status IS '任务状态：pending/running/completed/failed';
COMMENT ON COLUMN workflow_tasks.current_step IS '当前执行步骤';
COMMENT ON COLUMN workflow_tasks.error_msg IS '错误信息';
COMMENT ON COLUMN workflow_tasks.error_step IS '发生错误的步骤';
COMMENT ON COLUMN workflow_tasks.duration_ms IS '执行耗时(毫秒)';
