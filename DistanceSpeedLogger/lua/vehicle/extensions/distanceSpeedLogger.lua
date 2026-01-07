-- This Source Code Form is subject to the terms of the bCDDL, v. 1.1.
-- If a copy of the bCDDL was not distributed with this
-- file, You can obtain one at http://beamng.com/bCDDL-1.1.txt

local M = {}

-- 配置参数
local CONFIG = {
    MAX_DATA_POINTS = 1000,        -- 最大数据点数
    UPDATE_INTERVAL = 0.1,         -- 更新间隔(秒)
    MIN_SPEED_CHANGE = 0.1,        -- 记录的最小速度变化
    MIN_DISTANCE_CHANGE = 0.1,     -- 记录的最小距离变化(米)
    LOG_LEVEL = 1,                 -- 0=无日志, 1=错误, 2=警告, 3=信息
}

-- 状态变量
local dataPoints = {}              -- 存储数据点: {distance, speed, time}
local currentDistance = 0
local currentSpeed = 0
local lastRecordedSpeed = 0
local lastRecordedDistance = 0
local accumulatedTime = 0          -- 累计模拟时间，用于记录间隔
local isRecording = false
local resetRequested = false
local lastDataSendTime = 0
local DATA_SEND_INTERVAL = 0.2     -- 向UI发送数据的间隔(秒)
local extensionLoaded = false

-- [新增] 用于存储上一帧的坐标 (x, y)，避免跳变
local lastPos = nil

-- 优化：本地化常用函数和变量
local log = log
local math = math
local os = os
local table = table
local guihooks = guihooks
local extensions = extensions
local obj = obj                    -- [新增] 本地化车辆对象引用
local ipairs = ipairs

-- 条件日志函数
local function logMsg(level, context, message)
    if CONFIG.LOG_LEVEL >= level then
        log(level == 1 and "E" or level == 2 and "W" or "I", context, message)
    end
end

-- 发送数据到UI
local function sendDataToUI()
    local responseDataPoints = {}
    for i, v in ipairs(dataPoints) do
        responseDataPoints[i] = v
    end
    
    local data = {
        currentSpeed = currentSpeed,
        currentDistance = currentDistance,
        dataPoints = responseDataPoints,
        pointCount = #dataPoints,
        isRecording = isRecording
    }
    guihooks.trigger("distanceSpeedLoggerData", data)
end

-- 重置数据
local function reset()
    dataPoints = {}
    currentDistance = 0
    currentSpeed = 0
    lastRecordedSpeed = 0
    lastRecordedDistance = 0
    accumulatedTime = 0
    lastDataSendTime = 0
    isRecording = false
    resetRequested = false
    
    -- [新增] 重置上一帧坐标为 nil，确保重新开始计算
    lastPos = nil
    
    logMsg(3, 'distanceSpeedLogger', 'Data logger reset')
    
    -- 发送更新后的数据到UI
    if extensionLoaded then
        sendDataToUI()
    end
end

-- 每帧更新(在GFX线程运行) - 使用模拟时间dtSim
local function updateGFX(dtSim)
    -- 安全检查
    if not extensionLoaded or not obj then return end
    
    -- 检查重置请求
    if resetRequested then
        reset()
        return
    end
    
    -- 1. 获取当前车辆的世界坐标向量 (vec3) 和 速度向量 (vec3)
    local rawPos = obj:getPosition()
    local rawVel = obj:getVelocity()

    -- [计算速度 - GPS模式]
    -- 忽略高度(Z轴)，计算 X 和 Y 轴的速度合成
    -- 公式: sqrt(vx*vx + vy*vy)
    local speedMs = math.sqrt(rawVel.x * rawVel.x + rawVel.y * rawVel.y)
    currentSpeed = speedMs * 3.6 -- 转换为 km/h

    -- 初始化 lastPos (如果是第一帧运行)
    if not lastPos then
        lastPos = {x = rawPos.x, y = rawPos.y}
    end

    -- [计算距离与记录逻辑]
    if isRecording then
        accumulatedTime = accumulatedTime + dtSim
        
        -- 如果有上一帧的坐标，则计算与当前坐标的距离
        local dx = rawPos.x - lastPos.x
        local dy = rawPos.y - lastPos.y
        
        -- 勾股定理计算平面距离增量 (忽略 Z 轴)
        local distDelta = math.sqrt(dx*dx + dy*dy)
        currentDistance = currentDistance + distDelta

        -- 定期记录数据点 (保留原版的节流逻辑，避免性能问题)
        if accumulatedTime >= CONFIG.UPDATE_INTERVAL then
            local speedChanged = math.abs(currentSpeed - lastRecordedSpeed) >= CONFIG.MIN_SPEED_CHANGE
            local distanceChanged = math.abs(currentDistance - lastRecordedDistance) >= CONFIG.MIN_DISTANCE_CHANGE
            
            if speedChanged or distanceChanged then
                -- 插入数据，注意保持键名为 distance/speed/time 以兼容原有UI
                table.insert(dataPoints, {
                    distance = currentDistance,
                    speed = currentSpeed,
                    time = os.clock()  -- 使用绝对时间戳，导出时会自动计算相对时间
                })
                
                lastRecordedSpeed = currentSpeed
                lastRecordedDistance = currentDistance
                
                -- 限制数据点数量 (保持原版循环队列逻辑)
                if #dataPoints > CONFIG.MAX_DATA_POINTS then
                    table.remove(dataPoints, 1)
                end
            end
            
            -- 定期向UI发送数据 (避免每帧发送)
            if os.clock() - lastDataSendTime >= DATA_SEND_INTERVAL then
                sendDataToUI()
                lastDataSendTime = os.clock()
            end
            
            accumulatedTime = 0
        end
    end
    
    -- [更新上一帧坐标]
    -- 无论是否在录制，都更新上一帧坐标。
    -- 这样可以确保按下"开始录制"的瞬间，起始点是准确的，不会产生巨大的初始距离。
    lastPos.x = rawPos.x
    lastPos.y = rawPos.y
end

-- 导出数据为CSV格式
local function exportCSV()
    if #dataPoints == 0 then
        return nil
    end
    
    local csv = "Time(s),Distance(m),Speed(km/h)\n"
    
    -- 计算相对时间
    local startTime = dataPoints[1].time
    
    for i, point in ipairs(dataPoints) do
        local relativeTime = point.time - startTime
        csv = csv .. string.format("%.3f,%.2f,%.2f\n", 
            relativeTime, point.distance, point.speed)
    end
    
    return csv
end

-- 处理UI请求
local function onGuiMessage(message, data)
    logMsg(3, 'distanceSpeedLogger', 'Received GUI message: ' .. tostring(message))
    
    if message == "startRecording" then
        if isRecording then
            logMsg(2, 'distanceSpeedLogger', 'Already recording')
            return false
        end
        reset()
        isRecording = true
        lastDataSendTime = os.clock()
        logMsg(3, 'distanceSpeedLogger', 'Recording started')
        
        -- 立即发送初始数据
        sendDataToUI()
        
        return true
        
    elseif message == "stopRecording" then
        if not isRecording then
            logMsg(2, 'distanceSpeedLogger', 'Not recording')
            return false
        end
        isRecording = false
        logMsg(3, 'distanceSpeedLogger', 'Recording stopped')
        
        -- 发送最终数据
        sendDataToUI()
        
        return true
        
    elseif message == "reset" then
        resetRequested = true
        logMsg(3, 'distanceSpeedLogger', 'Reset requested')
        return true
        
    elseif message == "exportCSV" then
        local csvData = exportCSV()
        if csvData then
            guihooks.trigger("distanceSpeedLoggerExport", csvData)
            logMsg(3, 'distanceSpeedLogger', 'CSV export triggered')
            return true
        end
        return false
        
    elseif message == "getData" then
        sendDataToUI()
        logMsg(3, 'distanceSpeedLogger', 'Data sent to UI')
        return true
    else
        logMsg(2, 'distanceSpeedLogger', 'Unknown message: ' .. tostring(message))
        return false
    end
end

-- 扩展加载时调用
local function onExtensionLoaded()
    extensionLoaded = true
    reset()
    logMsg(3, 'distanceSpeedLogger', 'Extension loaded')
    return true
end

-- 玩家变更时调用
local function onPlayersChanged(anyPlayerSeated)
    if not anyPlayerSeated then
        extensions.unload("distanceSpeedLogger")
        extensionLoaded = false
    end
end

-- 公开接口
M.updateGFX = updateGFX
M.onExtensionLoaded = onExtensionLoaded
M.onPlayersChanged = onPlayersChanged
M.onGuiMessage = onGuiMessage
M.reset = reset
M.exportCSV = exportCSV

return M
