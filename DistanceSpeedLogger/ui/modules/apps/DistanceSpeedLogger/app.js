(function () {
    'use strict'

    angular.module('beamng.apps')
        .directive('distanceSpeedLogger', [function () {
            return {
                template: `
                    <div class="bngApp distance-speed-logger" style="width:100%; height:100%;" layout="column">
                        <!-- 控制面板 -->
                        <div layout="row" layout-align="space-between center" style="padding: 8px; background: rgba(0,0,0,0.2);">
                            <div layout="row" layout-align="start center">
                                <button class="btn-small" ng-click="startRecording()" ng-disabled="isRecording">
                                    <i class="material-icons" style="font-size:16px">play_arrow</i> Start
                                </button>
                                <button class="btn-small" ng-click="stopRecording()" ng-disabled="!isRecording">
                                    <i class="material-icons" style="font-size:16px">pause</i> Stop
                                </button>
                                <button class="btn-small" ng-click="resetData()">
                                    <i class="material-icons" style="font-size:16px">refresh</i> Reset
                                </button>
                                <button class="btn-small" ng-click="exportData()" ng-disabled="!dataPoints || dataPoints.length === 0">
                                    <i class="material-icons" style="font-size:16px">save</i> Export
                                </button>
                            </div>
                            
                            <div layout="row" layout-align="end center" style="color: white;">
                                <small style="margin-right: 10px;">Points: {{dataPoints ? dataPoints.length : 0}}</small>
                                <small>Status: <span ng-style="{color: isRecording ? '#4CAF50' : '#F44336'}">
                                    {{isRecording ? 'RECORDING' : 'STOPPED'}}
                                </span></small>
                            </div>
                        </div>
                        
                        <!-- 导出提示 -->
                        <div ng-if="exportMessage" layout="row" layout-align="center center" 
                             style="padding: 4px; background: rgba(76, 175, 80, 0.3); color: white; font-size: 12px;">
                            <i class="material-icons" style="font-size:14px; margin-right:5px">check_circle</i>
                            {{exportMessage}}
                        </div>
                        
                        <!-- 实时数据显示 -->
                        <div layout="row" layout-align="space-around center" 
                             style="padding: 5px; background: rgba(0,0,0,0.1); font-size: 12px;">
                            <div>
                                <span style="color: #FF9800;">Speed: </span>
                                <strong>{{currentSpeed | number:1}} km/h</strong>
                            </div>
                            <div>
                                <span style="color: #4CAF50;">Distance: </span>
                                <strong>{{currentDistance | number:1}} m</strong>
                            </div>
                            <div>
                                <span style="color: #2196F3;">Max Speed: </span>
                                <strong>{{maxSpeed | number:1}} km/h</strong>
                            </div>
                        </div>
                        
                        <!-- 图表容器 -->
                        <div style="flex: 1; position: relative; padding: 10px;">
                            <canvas id="distanceSpeedChart" style="width: 100%; height: 100%;"></canvas>
                            <!-- 图例 -->
                            <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); 
                                     padding: 5px 10px; border-radius: 3px; font-size: 11px;">
                                <div><span style="color: #FF9800;">●</span> Distance-Speed Curve</div>
                                <div><span style="color: #4CAF50;">●</span> Current Point</div>
                            </div>
                        </div>
                        
                        <!-- 底部信息栏 -->
                        <div layout="row" layout-align="space-between center" 
                             style="padding: 5px 10px; background: rgba(0,0,0,0.2); font-size: 11px; color: #aaa;">
                            <div>Distance (m) vs Speed (km/h)</div>
                            <div>X: Distance | Y: Speed</div>
                        </div>
                    </div>
                `,
                replace: true,
                restrict: 'EA',
                require: '^bngApp',
                link: function (scope, element, attrs, ctrl) {
                    // 初始化变量
                    scope.dataPoints = []
                    scope.currentSpeed = 0
                    scope.currentDistance = 0
                    scope.maxSpeed = 0
                    scope.isRecording = false
                    scope.exportMessage = ''
                    
                    // Canvas绘图相关变量
                    let canvas = null
                    let ctx = null
                    let animationFrameId = null
                    
                    // 图表配置 - 修正：x轴是距离，y轴是速度
                    const config = {
                        margin: { top: 20, right: 40, bottom: 40, left: 50 },
                        lineColor: '#FF9800',
                        currentPointColor: '#4CAF50',
                        axisColor: 'rgba(255,255,255,0.5)',
                        gridColor: 'rgba(255,255,255,0.1)',
                        textColor: '#aaa'
                    }
                    
                    // 安全地获取数据点数组
                    function getSafeDataPoints() {
                        if (!scope.dataPoints || !Array.isArray(scope.dataPoints)) {
                            return []
                        }
                        return scope.dataPoints
                    }
                    
                    // 初始化Canvas
                    function initCanvas() {
                        canvas = document.getElementById('distanceSpeedChart')
                        if (!canvas) {
                            console.error('Canvas element not found!')
                            return false
                        }
                        
                        ctx = canvas.getContext('2d')
                        
                        // 设置Canvas尺寸
                        canvas.width = canvas.offsetWidth || 500
                        canvas.height = canvas.offsetHeight || 300
                        
                        return true
                    }
                    
                    // 绘制图表
                    function drawChart() {
                        if (!ctx || !canvas) return
                        
                        // 清除画布
                        ctx.clearRect(0, 0, canvas.width, canvas.height)
                        
                        const safeDataPoints = getSafeDataPoints()
                        
                        // 如果没有数据点，只显示网格和坐标轴
                        if (safeDataPoints.length === 0) {
                            drawGridAndAxes()
                            return
                        }
                        
                        // 计算数据范围
                        const dataRange = calculateDataRange(safeDataPoints)
                        
                        // 绘制网格和坐标轴
                        drawGridAndAxes(dataRange)
                        
                        // 绘制曲线
                        drawCurve(safeDataPoints, dataRange)
                        
                        // 绘制当前点
                        if (scope.currentDistance > 0 && scope.currentSpeed > 0) {
                            drawCurrentPoint(dataRange)
                        }
                        
                        // 绘制数据点
                        drawDataPoints(safeDataPoints, dataRange)
                    }
                    
                    // 计算数据范围 - 修正：x轴是距离，y轴是速度
                    function calculateDataRange(dataPoints) {
                        if (!dataPoints || dataPoints.length === 0) {
                            return {
                                minX: 0,
                                maxX: 100,
                                minY: 0,
                                maxY: 100
                            }
                        }
                        
                        const distances = dataPoints.map(p => p.distance || 0)
                        const speeds = dataPoints.map(p => p.speed || 0)
                        
                        return {
                            minX: Math.max(0, Math.min(...distances) * 0.9),
                            maxX: Math.max(...distances) * 1.1 || 100,
                            minY: Math.max(0, Math.min(...speeds) * 0.9),
                            maxY: Math.max(...speeds) * 1.1 || 100
                        }
                    }
                    
                    // 绘制网格和坐标轴 - 修正：x轴标签是距离，y轴标签是速度
                    function drawGridAndAxes(dataRange) {
                        const width = canvas.width
                        const height = canvas.height
                        const margin = config.margin
                        
                        const plotWidth = width - margin.left - margin.right
                        const plotHeight = height - margin.top - margin.bottom
                        
                        // 绘制网格
                        ctx.strokeStyle = config.gridColor
                        ctx.lineWidth = 0.5
                        
                        // 垂直网格线
                        for (let i = 0; i <= 10; i++) {
                            const x = margin.left + (plotWidth * i / 10)
                            ctx.beginPath()
                            ctx.moveTo(x, margin.top)
                            ctx.lineTo(x, height - margin.bottom)
                            ctx.stroke()
                        }
                        
                        // 水平网格线
                        for (let i = 0; i <= 10; i++) {
                            const y = margin.top + (plotHeight * i / 10)
                            ctx.beginPath()
                            ctx.moveTo(margin.left, y)
                            ctx.lineTo(width - margin.right, y)
                            ctx.stroke()
                        }
                        
                        // 绘制坐标轴
                        ctx.strokeStyle = config.axisColor
                        ctx.lineWidth = 1
                        
                        // X轴
                        ctx.beginPath()
                        ctx.moveTo(margin.left, height - margin.bottom)
                        ctx.lineTo(width - margin.right, height - margin.bottom)
                        ctx.stroke()
                        
                        // Y轴
                        ctx.beginPath()
                        ctx.moveTo(margin.left, margin.top)
                        ctx.lineTo(margin.left, height - margin.bottom)
                        ctx.stroke()
                        
                        // 绘制刻度标签
                        ctx.fillStyle = config.textColor
                        ctx.font = '10px Arial'
                        ctx.textAlign = 'center'
                        
                        // X轴刻度（距离）
                        if (dataRange) {
                            for (let i = 0; i <= 5; i++) {
                                const value = dataRange.minX + ((dataRange.maxX - dataRange.minX) * i / 5)
                                const x = margin.left + (plotWidth * i / 5)
                                const y = height - margin.bottom + 15
                                
                                ctx.fillText(value.toFixed(0), x, y)
                            }
                            
                            // Y轴刻度（速度）
                            ctx.textAlign = 'right'
                            for (let i = 0; i <= 5; i++) {
                                const value = dataRange.minY + ((dataRange.maxY - dataRange.minY) * i / 5)
                                const y = height - margin.bottom - (plotHeight * i / 5)
                                
                                ctx.fillText(value.toFixed(0), margin.left - 5, y + 3)
                            }
                        }
                        
                        // 坐标轴标签 - 修正：x轴是距离，y轴是速度
                        ctx.textAlign = 'center'
                        ctx.fillStyle = '#fff'
                        ctx.font = '12px Arial'
                        
                        // X轴标签（距离）
                        ctx.fillText('Distance (m)', margin.left + plotWidth / 2, height - 10)
                        
                        // Y轴标签（速度）
                        ctx.save()
                        ctx.translate(15, margin.top + plotHeight / 2)
                        ctx.rotate(-Math.PI / 2)
                        ctx.fillText('Speed (km/h)', 0, 0)
                        ctx.restore()
                    }
                    
                    // 绘制曲线 - 修正：x轴是距离，y轴是速度
                    function drawCurve(dataPoints, dataRange) {
                        if (!dataPoints || dataPoints.length < 2) return
                        
                        const width = canvas.width
                        const height = canvas.height
                        const margin = config.margin
                        
                        const plotWidth = width - margin.left - margin.right
                        const plotHeight = height - margin.top - margin.bottom
                        
                        ctx.strokeStyle = config.lineColor
                        ctx.lineWidth = 2
                        ctx.beginPath()
                        
                        // 绘制曲线
                        dataPoints.forEach((point, index) => {
                            if (!point || point.distance == null || point.speed == null) return
                            
                            const x = margin.left + ((point.distance - dataRange.minX) / (dataRange.maxX - dataRange.minX)) * plotWidth
                            const y = height - margin.bottom - ((point.speed - dataRange.minY) / (dataRange.maxY - dataRange.minY)) * plotHeight
                            
                            if (index === 0) {
                                ctx.moveTo(x, y)
                            } else {
                                ctx.lineTo(x, y)
                            }
                        })
                        
                        ctx.stroke()
                        
                        // 填充曲线下方区域
                        ctx.fillStyle = 'rgba(255, 152, 0, 0.1)'
                        ctx.lineTo(width - margin.right, height - margin.bottom)
                        ctx.lineTo(margin.left, height - margin.bottom)
                        ctx.closePath()
                        ctx.fill()
                    }
                    
                    // 绘制数据点 - 修正：x轴是距离，y轴是速度
                    function drawDataPoints(dataPoints, dataRange) {
                        if (!dataPoints || dataPoints.length === 0) return
                        
                        const width = canvas.width
                        const height = canvas.height
                        const margin = config.margin
                        
                        const plotWidth = width - margin.left - margin.right
                        const plotHeight = height - margin.top - margin.bottom
                        
                        // 绘制每个数据点
                        ctx.fillStyle = config.lineColor
                        
                        dataPoints.forEach(point => {
                            if (!point || point.distance == null || point.speed == null) return
                            
                            const x = margin.left + ((point.distance - dataRange.minX) / (dataRange.maxX - dataRange.minX)) * plotWidth
                            const y = height - margin.bottom - ((point.speed - dataRange.minY) / (dataRange.maxY - dataRange.minY)) * plotHeight
                            
                            ctx.beginPath()
                            ctx.arc(x, y, 2, 0, Math.PI * 2)
                            ctx.fill()
                        })
                    }
                    
                    // 绘制当前点 - 修正：x轴是距离，y轴是速度
                    function drawCurrentPoint(dataRange) {
                        if (!scope.currentDistance || !scope.currentSpeed) return
                        
                        const width = canvas.width
                        const height = canvas.height
                        const margin = config.margin
                        
                        const plotWidth = width - margin.left - margin.right
                        const plotHeight = height - margin.top - margin.bottom
                        
                        const x = margin.left + ((scope.currentDistance - dataRange.minX) / (dataRange.maxX - dataRange.minX)) * plotWidth
                        const y = height - margin.bottom - ((scope.currentSpeed - dataRange.minY) / (dataRange.maxY - dataRange.minY)) * plotHeight
                        
                        // 绘制当前点
                        ctx.fillStyle = config.currentPointColor
                        ctx.beginPath()
                        ctx.arc(x, y, 6, 0, Math.PI * 2)
                        ctx.fill()
                        
                        // 添加光环效果
                        ctx.strokeStyle = config.currentPointColor
                        ctx.lineWidth = 2
                        ctx.beginPath()
                        ctx.arc(x, y, 8, 0, Math.PI * 2)
                        ctx.stroke()
                    }
                    
                    // 启动动画循环
                    function startAnimation() {
                        if (animationFrameId) return
                        
                        function animate() {
                            drawChart()
                            animationFrameId = requestAnimationFrame(animate)
                        }
                        
                        animate()
                    }
                    
                    // 停止动画循环
                    function stopAnimation() {
                        if (animationFrameId) {
                            cancelAnimationFrame(animationFrameId)
                            animationFrameId = null
                        }
                    }
                    
                    // 启动记录
                    scope.startRecording = function() {
                        console.log('Starting recording...')
                        bngApi.activeObjectLua('if distanceSpeedLogger then distanceSpeedLogger.onGuiMessage("startRecording") end')
                    }
                    
                    // 停止记录
                    scope.stopRecording = function() {
                        console.log('Stopping recording...')
                        bngApi.activeObjectLua('if distanceSpeedLogger then distanceSpeedLogger.onGuiMessage("stopRecording") end')
                    }
                    
                    // 重置数据
                    scope.resetData = function() {
                        console.log('Resetting data...')
                        bngApi.activeObjectLua('if distanceSpeedLogger then distanceSpeedLogger.onGuiMessage("reset") end')
                    }
                    
                    // 导出数据
                    scope.exportData = function() {
                        console.log('Exporting data...')
                        bngApi.activeObjectLua('if distanceSpeedLogger then distanceSpeedLogger.onGuiMessage("exportCSV") end')
                    }
                    
                    // 监听来自Lua的数据更新
                    scope.$on('distanceSpeedLoggerData', function(event, data) {
                        scope.$applyAsync(function() {
                            // 安全处理dataPoints，确保是数组
                            let dataPoints = []
                            if (data.dataPoints) {
                                if (Array.isArray(data.dataPoints)) {
                                    dataPoints = data.dataPoints
                                } else if (typeof data.dataPoints === 'object') {
                                    // 如果是对象，转换为数组
                                    dataPoints = Object.values(data.dataPoints)
                                }
                            }
                            
                            scope.dataPoints = dataPoints
                            scope.currentSpeed = data.currentSpeed || 0
                            scope.currentDistance = data.currentDistance || 0
                            scope.isRecording = data.isRecording || false
                            
                            // 更新最大速度
                            if (dataPoints.length > 0) {
                                const speeds = dataPoints.map(p => p.speed || 0)
                                scope.maxSpeed = Math.max(...speeds)
                            } else {
                                scope.maxSpeed = 0
                            }
                        })
                    })
                    
                    // 监听导出数据
                    scope.$on('distanceSpeedLoggerExport', function(event, csvData) {
                        // 创建Blob并下载
                        const blob = new Blob([csvData], { type: 'text/csv' })
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `distance_speed_log_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.csv`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        window.URL.revokeObjectURL(url)
                        
                        // 显示提示
                        console.log('CSV文件已导出到浏览器的下载文件夹')
                        scope.$applyAsync(function() {
                            scope.exportMessage = 'CSV文件已导出到浏览器的下载文件夹'
                            setTimeout(function() {
                                scope.$applyAsync(function() {
                                    scope.exportMessage = ''
                                })
                            }, 3000)
                        })
                    })
                    
                    // 监听车辆切换事件
                    scope.$on('VehicleFocusChanged', function (event, data) {
                        console.log('车辆已切换，重新加载扩展...')
                        
                        // 先卸载扩展
                        bngApi.activeObjectLua('extensions.unload("distanceSpeedLogger")')
                        
                        // 重置本地数据
                        scope.dataPoints = []
                        scope.currentSpeed = 0
                        scope.currentDistance = 0
                        scope.maxSpeed = 0
                        scope.isRecording = false
                        
                        // 延迟加载扩展
                        setTimeout(function() {
                            bngApi.activeObjectLua('extensions.load("distanceSpeedLogger")')
                            
                            // 请求初始数据
                            setTimeout(function() {
                                bngApi.activeObjectLua('if distanceSpeedLogger then distanceSpeedLogger.onGuiMessage("getData") end')
                            }, 500)
                        }, 500)
                    })
                    
                    // 元素准备就绪
                    element.ready(function() {
                        console.log('App element ready')
                        
                        // 初始化Canvas
                        if (initCanvas()) {
                            // 启动动画循环
                            startAnimation()
                            
                            // 延迟加载扩展
                            setTimeout(function() {
                                console.log('Loading Lua extension...')
                                bngApi.activeObjectLua('extensions.load("distanceSpeedLogger")')
                                
                                // 请求初始数据
                                setTimeout(function() {
                                    console.log('Requesting initial data...')
                                    bngApi.activeObjectLua('if distanceSpeedLogger then distanceSpeedLogger.onGuiMessage("getData") end')
                                }, 1000)
                            }, 500)
                        }
                    })
                    
                    // 监听应用大小变化
                    scope.$on('app:resized', function(event, data) {
                        if (canvas) {
                            canvas.width = data.width - 20
                            canvas.height = data.height - 120
                        }
                    })
                    
                    // 清理资源
                    scope.$on('$destroy', function() {
                        console.log('App destroyed')
                        stopAnimation()
                        bngApi.activeObjectLua('extensions.unload("distanceSpeedLogger")')
                    })
                }
            }
        }])
})()