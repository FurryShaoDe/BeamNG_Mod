angular.module('beamng.apps')
.directive('sixtyToOneSixty', ['$log', function ($log) {
  return {
    template: `
      <div class="performance-ui">
          <style>
            .performance-ui {
                width: 100%;
                background-color: rgba(30, 30, 40, 0.9);
                color: #fff;
                padding: 15px;
                border-radius: 8px;
                font-family: 'Segoe UI', Arial, sans-serif;
                box-sizing: border-box;
                border: 1px solid #444;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #555;
            }
            
            .title {
                font-size: 1.2em;
                font-weight: bold;
                color: #4fc3f7;
            }
            
            .controls {
                display: flex;
                gap: 8px;
            }
            
            .control-btn {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid #666;
                color: #fff;
                padding: 4px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9em;
                transition: all 0.2s;
            }
            
            .control-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: #4fc3f7;
            }
            
            .status-indicator {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                font-size: 0.9em;
            }
            
            .status-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                margin-right: 8px;
                transition: background-color 0.3s;
            }
            
            .status-ready {
                background-color: #4CAF50;
                animation: pulse 2s infinite;
            }
            
            .status-measuring {
                background-color: #FF9800;
                animation: pulse 0.5s infinite;
            }
            
            .status-complete {
                background-color: #2196F3;
            }
            
            .main-timer {
                text-align: center;
                margin-bottom: 15px;
            }
            
            .timer-display {
                font-size: 3.2em;
                font-weight: 700;
                color: #FFD700;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
                font-family: 'Courier New', monospace;
                letter-spacing: 2px;
                margin-bottom: 5px;
            }
            
            .timer-label {
                font-size: 1em;
                color: #aaa;
                margin-bottom: 15px;
            }
            
            .results-container {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 6px;
                padding: 10px;
                margin-top: 10px;
            }
            
            .result-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .result-item:last-child {
                border-bottom: none;
            }
            
            .result-label {
                color: #ccc;
            }
            
            .result-value {
                font-weight: bold;
                color: #4fc3f7;
                font-size: 1.1em;
            }
            
            .speed-info {
                display: flex;
                justify-content: space-around;
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid #555;
            }
            
            .speed-box {
                text-align: center;
                flex: 1;
            }
            
            .speed-value {
                font-size: 1.4em;
                font-weight: bold;
                color: #FFD700;
            }
            
            .speed-label {
                font-size: 0.8em;
                color: #aaa;
            }
            
            .current-speed {
                color: #4CAF50;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.6; }
                100% { opacity: 1; }
            }
            
            .message {
                text-align: center;
                padding: 10px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                margin-top: 10px;
                font-size: 0.9em;
                color: #FFD700;
            }
          </style>
          
          <div class="header">
              <div class="title">60-160km/h 加速计时器</div>
              <div class="controls">
                  <button class="control-btn" id="resetBtn">重置</button>
                  <button class="control-btn" id="autoResetToggle">自动重置: ON</button>
              </div>
          </div>
          
          <div class="status-indicator">
              <div id="statusDot" class="status-dot status-ready"></div>
              <span id="statusText">准备就绪 - 加速到60km/h开始计时</span>
          </div>
          
          <div class="main-timer">
              <div class="timer-display" id="timerDisplay">0.000</div>
              <div class="timer-label">60-160km/h 加速时间</div>
          </div>
          
          <div class="speed-info">
              <div class="speed-box">
                  <div class="speed-value" id="currentSpeed">0</div>
                  <div class="speed-label">当前速度 (km/h)</div>
              </div>
              <div class="speed-box">
                  <div class="speed-value">60</div>
                  <div class="speed-label">起点速度</div>
              </div>
              <div class="speed-box">
                  <div class="speed-value">160</div>
                  <div class="speed-label">终点速度</div>
              </div>
          </div>
          
          <div id="messageArea" class="message" style="display: none;">
              测量完成！结果已记录
          </div>
          
          <div class="results-container" id="resultsContainer">
              <div class="result-item">
                  <span class="result-label">最快时间:</span>
                  <span class="result-value" id="bestTime">--.-- s</span>
              </div>
              <div class="result-item">
                  <span class="result-label">平均时间:</span>
                  <span class="result-value" id="avgTime">--.-- s</span>
              </div>
              <div class="result-item">
                  <span class="result-label">测量次数:</span>
                  <span class="result-value" id="attemptCount">0</span>
              </div>
          </div>
      </div>`,
    replace: true,
    restrict: 'EA',
    
    link: function (scope, element, attrs) {
      // 状态变量
      var isMeasuring = false;
      var isReady = true;
      var startTime = 0;
      var autoResetEnabled = true;
      var bestTime = null;
      var totalTime = 0;
      var attemptCount = 0;
      
      // DOM 元素引用
      var timerDisplay = document.getElementById('timerDisplay');
      var statusDot = document.getElementById('statusDot');
      var statusText = document.getElementById('statusText');
      var currentSpeedDisplay = document.getElementById('currentSpeed');
      var messageArea = document.getElementById('messageArea');
      var bestTimeDisplay = document.getElementById('bestTime');
      var avgTimeDisplay = document.getElementById('avgTime');
      var attemptCountDisplay = document.getElementById('attemptCount');
      
      // 状态更新函数
      function updateStatus(state, text) {
        statusDot.className = 'status-dot';
        
        switch(state) {
          case 'ready':
            statusDot.classList.add('status-ready');
            break;
          case 'measuring':
            statusDot.classList.add('status-measuring');
            break;
          case 'complete':
            statusDot.classList.add('status-complete');
            break;
        }
        
        statusText.textContent = text;
      }
      
      // 显示消息
      function showMessage(text, duration = 2000) {
        messageArea.textContent = text;
        messageArea.style.display = 'block';
        
        setTimeout(function() {
          messageArea.style.display = 'none';
        }, duration);
      }
      
      // 更新计时器显示
      function updateTimerDisplay(time) {
        timerDisplay.textContent = time.toFixed(3);
      }
      
      // 开始测量
      function startMeasurement() {
        if (isMeasuring) return;
        
        startTime = performance.now();
        isMeasuring = true;
        isReady = false;
        updateStatus('measuring', '测量中... 加速到160km/h');
        
        // 更新计时器
        requestAnimationFrame(updateTimer);
      }
      
      // 停止测量并记录结果
      function stopMeasurement() {
        if (!isMeasuring) return;
        
        var endTime = performance.now();
        var elapsedTime = (endTime - startTime) / 1000;
        
        // 记录结果
        attemptCount++;
        totalTime += elapsedTime;
        
        if (bestTime === null || elapsedTime < bestTime) {
          bestTime = elapsedTime;
          showMessage('新纪录！' + elapsedTime.toFixed(3) + '秒');
        } else {
          showMessage('测量完成: ' + elapsedTime.toFixed(3) + '秒');
        }
        
        // 更新显示
        updateStats();
        
        // 重置状态
        isMeasuring = false;
        updateStatus('complete', '测量完成！准备下一次');
        
        // 自动重置
        if (autoResetEnabled) {
          setTimeout(resetMeasurement, 3000);
        }
      }
      
      // 更新统计数据
      function updateStats() {
        bestTimeDisplay.textContent = bestTime !== null ? bestTime.toFixed(3) + ' s' : '--.-- s';
        avgTimeDisplay.textContent = attemptCount > 0 ? (totalTime / attemptCount).toFixed(3) + ' s' : '--.-- s';
        attemptCountDisplay.textContent = attemptCount;
      }
      
      // 重置测量
      function resetMeasurement() {
        isMeasuring = false;
        isReady = true;
        startTime = 0;
        updateTimerDisplay(0);
        updateStatus('ready', '准备就绪 - 加速到60km/h开始计时');
      }
      
      // 重置所有统计数据
      function resetAllStats() {
        resetMeasurement();
        bestTime = null;
        totalTime = 0;
        attemptCount = 0;
        updateStats();
        showMessage('所有统计数据已重置');
      }
      
      // 计时器更新循环
      function updateTimer() {
        if (!isMeasuring) return;
        
        var currentTime = performance.now();
        var elapsedTime = (currentTime - startTime) / 1000;
        
        updateTimerDisplay(elapsedTime);
        
        // 继续更新
        if (isMeasuring) {
          requestAnimationFrame(updateTimer);
        }
      }
      
      // 事件监听
      document.getElementById('resetBtn').addEventListener('click', resetAllStats);
      
      document.getElementById('autoResetToggle').addEventListener('click', function() {
        autoResetEnabled = !autoResetEnabled;
        this.textContent = '自动重置: ' + (autoResetEnabled ? 'ON' : 'OFF');
        showMessage('自动重置 ' + (autoResetEnabled ? '已启用' : '已禁用'));
      });
      
      // 初始化状态
      updateStatus('ready', '准备就绪 - 加速到60km/h开始计时');
      updateStats();
      
      // 监听游戏数据流
      scope.$on('streamsUpdate', function (event, streams) {
        if (!streams.electrics) return;
        
        var airspeed = streams.electrics.airspeed * 3.6; // 转换为km/h
        var throttle = streams.electrics.throttle_input;
        
        // 更新当前速度显示
        currentSpeedDisplay.textContent = Math.round(airspeed);
        
        // 状态机逻辑
        if (isReady && !isMeasuring) {
          // 准备状态：等待达到60km/h
          if (airspeed >= 60 && airspeed < 62) { // 使用60-62的范围避免多次触发
            startMeasurement();
          }
        } 
        else if (isMeasuring && !isReady) {
          // 测量状态：检查是否达到160km/h
          if (airspeed >= 160) {
            stopMeasurement();
          }
          // 如果速度低于55km/h（显著下降），取消测量
          else if (airspeed < 55) {
            isMeasuring = false;
            updateStatus('ready', '测量已取消 - 速度下降过多');
            updateTimerDisplay(0);
            showMessage('测量已取消：速度下降', 1500);
            
            if (autoResetEnabled) {
              setTimeout(function() {
                updateStatus('ready', '准备就绪 - 加速到60km/h开始计时');
              }, 1500);
            }
          }
        }
        else if (!isMeasuring && !isReady) {
          // 完成状态：等待速度下降以便重新准备
          if (airspeed < 50) {
            isReady = true;
            updateStatus('ready', '准备就绪 - 加速到60km/h开始计时');
          }
        }
      });
    }
  }
}]);