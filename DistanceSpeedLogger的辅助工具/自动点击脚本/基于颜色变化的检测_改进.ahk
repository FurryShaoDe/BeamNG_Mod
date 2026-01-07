#Requires AutoHotkey v2.0
#SingleInstance Force
CoordMode "Pixel", "Screen" ; 所有像素操作基于整个屏幕
CoordMode "Mouse", "Screen" ; 所有鼠标操作基于整个屏幕

; ==============================================================================
; 全局变量与 GUI 初始化
; ==============================================================================
global IsMonitoring := False
global ConfigFile := "color_clicker_config.ini"

; 全局点击计数器
global ClickCount1 := 0
global ClickCount2 := 0

; 创建 GUI
MainGui := Gui("+AlwaysOnTop", "颜色自动点击器 v5 - 带点击次数控制")
MainGui.SetFont("s9", "Microsoft YaHei")

; --- 第一部分：检测点1设置 ---
MainGui.Add("GroupBox", "x10 y10 w390 h160", "检测点 1 (条件1 → 动作1)") ; 高度增加
MainGui.Add("Text", "x25 y35", "检测坐标 X:")
EditCheckX1 := MainGui.Add("Edit", "x100 y32 w60 Number", "0")
MainGui.Add("Text", "x170 y35", "Y:")
EditCheckY1 := MainGui.Add("Edit", "x190 y32 w60 Number", "0")

MainGui.Add("Text", "x25 y65", "目标颜色 1:")
EditTargetColor1 := MainGui.Add("Edit", "x100 y62 w100", "0xFFFFFF")
; 颜色预览块1
ColorPreview1 := MainGui.Add("Progress", "x210 y62 w40 h25 cFFFFFF Background000000", 100)

MainGui.Add("Text", "x25 y95", "点击坐标 X:")
EditClickX1 := MainGui.Add("Edit", "x100 y92 w60 Number", "0")
MainGui.Add("Text", "x170 y95", "Y:")
EditClickY1 := MainGui.Add("Edit", "x190 y92 w60 Number", "0")

; 添加点击次数控制1
MainGui.Add("Text", "x25 y125", "最大点击次数:")
EditMaxClicks1 := MainGui.Add("Edit", "x110 y122 w50 Number", "0")
MainGui.Add("Text", "x165 y125", "0=无限")
MainGui.Add("Text", "x220 y125", "已点击:")
TextClicked1 := MainGui.Add("Text", "x270 y125 w40", "0")

MainGui.Add("Text", "x260 y35 w120 h25", "F1: 取检测点")
MainGui.Add("Text", "x260 y65 w120 h25", "Ctrl+F1: 取颜色")
MainGui.Add("Text", "x260 y95 w120 h25", "F2: 取点击点")

; --- 第二部分：检测点2设置 ---
MainGui.Add("GroupBox", "x10 y180 w390 h160", "检测点 2 (条件2 → 动作2)") ; 高度增加
MainGui.Add("Text", "x25 y205", "检测坐标 X:")
EditCheckX2 := MainGui.Add("Edit", "x100 y202 w60 Number", "0")
MainGui.Add("Text", "x170 y205", "Y:")
EditCheckY2 := MainGui.Add("Edit", "x190 y202 w60 Number", "0")

MainGui.Add("Text", "x25 y235", "目标颜色 2:")
EditTargetColor2 := MainGui.Add("Edit", "x100 y232 w100", "0xFFFFFF")
; 颜色预览块2
ColorPreview2 := MainGui.Add("Progress", "x210 y232 w40 h25 cFFFFFF Background000000", 100)

MainGui.Add("Text", "x25 y265", "点击坐标 X:")
EditClickX2 := MainGui.Add("Edit", "x100 y262 w60 Number", "0")
MainGui.Add("Text", "x170 y265", "Y:")
EditClickY2 := MainGui.Add("Edit", "x190 y262 w60 Number", "0")

; 添加点击次数控制2
MainGui.Add("Text", "x25 y295", "最大点击次数:")
EditMaxClicks2 := MainGui.Add("Edit", "x110 y292 w50 Number", "0")
MainGui.Add("Text", "x165 y295", "0=无限")
MainGui.Add("Text", "x220 y295", "已点击:")
TextClicked2 := MainGui.Add("Text", "x270 y295 w40", "0")

MainGui.Add("Text", "x260 y205 w120 h25", "F3: 取检测点")
MainGui.Add("Text", "x260 y235 w120 h25", "Ctrl+F3: 取颜色")
MainGui.Add("Text", "x260 y265 w120 h25", "F4: 取点击点")

; --- 第三部分：控制设置 ---
MainGui.Add("GroupBox", "x10 y350 w390 h110", "控制设置") ; 高度增加
MainGui.Add("Text", "x25 y375", "检测间隔(ms): ")
EditInterval := MainGui.Add("Edit", "x110 y372 w60 Number", "10")
MainGui.Add("UpDown", "Range1-1000", 10)

ChkEnable1 := MainGui.Add("CheckBox", "x200 y375 w80", "启用点1")
ChkEnable2 := MainGui.Add("CheckBox", "x290 y375 w80", "启用点2")
ChkEnable1.Value := 1
ChkEnable2.Value := 1

; 重置次数按钮
BtnReset1 := MainGui.Add("Button", "x25 y405 w80 h25", "重置次数1")
BtnReset1.OnEvent("Click", ResetCount1)

BtnReset2 := MainGui.Add("Button", "x120 y405 w80 h25", "重置次数2")
BtnReset2.OnEvent("Click", ResetCount2)

; 重置所有次数按钮
BtnResetAll := MainGui.Add("Button", "x220 y405 w100 h25", "重置所有次数")
BtnResetAll.OnEvent("Click", ResetAllCounts)

; --- 第四部分：控制按钮 ---
BtnStart := MainGui.Add("Button", "x10 y470 w90 h35", "开始 (F8)")
BtnStart.OnEvent("Click", ToggleMonitor)

BtnSave := MainGui.Add("Button", "x110 y470 w90 h35", "保存配置")
BtnSave.OnEvent("Click", SaveConfig)

BtnLoad := MainGui.Add("Button", "x210 y470 w90 h35", "加载配置")
BtnLoad.OnEvent("Click", LoadConfig)

BtnExit := MainGui.Add("Button", "x310 y470 w90 h35", "退出脚本")
BtnExit.OnEvent("Click", (*) => ExitApp())

StatusText := MainGui.Add("StatusBar",, "就绪 - 请使用快捷键设置坐标和颜色")

; 快捷键说明
MainGui.Add("Text", "x10 y515 w390 cGray", "快捷键说明: F8=开始/停止 | F1/F2=点1取点 | F3/F4=点2取点 | Ctrl+S=保存 | Ctrl+L=加载")

MainGui.Show()

; 启动时自动加载配置
LoadConfig()

; ==============================================================================
; 核心逻辑函数
; ==============================================================================

; 定时器函数：用于检测颜色
CheckColorLoop() {
    global IsMonitoring, ChkEnable1, ChkEnable2, EditCheckX1, EditCheckY1, EditTargetColor1, EditClickX1, EditClickY1
    global EditCheckX2, EditCheckY2, EditTargetColor2, EditClickX2, EditClickY2, EditInterval, EditMaxClicks1, EditMaxClicks2
    global ClickCount1, ClickCount2, TextClicked1, TextClicked2, StatusText
    
    if (!IsMonitoring)
        return

    try {
        ; 检查点1
        if (ChkEnable1.Value) {
            targetX1 := EditCheckX1.Value
            targetY1 := EditCheckY1.Value
            targetColorStr1 := EditTargetColor1.Value
            clickX1 := EditClickX1.Value
            clickY1 := EditClickY1.Value
            maxClicks1 := EditMaxClicks1.Value
            
            ; 检查是否已达到最大点击次数
            if (maxClicks1 > 0 && ClickCount1 >= maxClicks1) {
                ; 达到最大次数，禁用该点
                ChkEnable1.Value := 0
                StatusText.SetText("点1已达到最大点击次数: " . ClickCount1)
                return
            }
            
            currentColor1 := PixelGetColor(targetX1, targetY1, "RGB")
            
            if (StrCompare(currentColor1, targetColorStr1) = 0) {
                Click clickX1, clickY1
                ClickCount1++  ; 增加点击计数
                TextClicked1.Text := ClickCount1  ; 更新显示
                Sleep 50 ; 短暂延迟，防止连续点击过快
                StatusText.SetText("点1触发点击! 已点击: " . ClickCount1 . "次")
                
                ; 检查是否达到最大次数
                if (maxClicks1 > 0 && ClickCount1 >= maxClicks1) {
                    ChkEnable1.Value := 0
                    StatusText.SetText("点1已达到最大点击次数: " . ClickCount1)
                }
            }
        }
        
        ; 检查点2
        if (ChkEnable2.Value) {
            targetX2 := EditCheckX2.Value
            targetY2 := EditCheckY2.Value
            targetColorStr2 := EditTargetColor2.Value
            clickX2 := EditClickX2.Value
            clickY2 := EditClickY2.Value
            maxClicks2 := EditMaxClicks2.Value
            
            ; 检查是否已达到最大点击次数
            if (maxClicks2 > 0 && ClickCount2 >= maxClicks2) {
                ; 达到最大次数，禁用该点
                ChkEnable2.Value := 0
                StatusText.SetText("点2已达到最大点击次数: " . ClickCount2)
                return
            }
            
            currentColor2 := PixelGetColor(targetX2, targetY2, "RGB")
            
            if (StrCompare(currentColor2, targetColorStr2) = 0) {
                Click clickX2, clickY2
                ClickCount2++  ; 增加点击计数
                TextClicked2.Text := ClickCount2  ; 更新显示
                Sleep 50 ; 短暂延迟，防止连续点击过快
                StatusText.SetText("点2触发点击! 已点击: " . ClickCount2 . "次")
                
                ; 检查是否达到最大次数
                if (maxClicks2 > 0 && ClickCount2 >= maxClicks2) {
                    ChkEnable2.Value := 0
                    StatusText.SetText("点2已达到最大点击次数: " . ClickCount2)
                }
            }
        }
    } catch as err {
        StatusText.SetText("错误: " . err.Message)
    }
}

; 切换监控状态
ToggleMonitor(*) {
    global IsMonitoring, ClickCount1, ClickCount2, BtnStart, StatusText, EditInterval
    IsMonitoring := !IsMonitoring
    
    if (IsMonitoring) {
        BtnStart.Text := "停止 (F8)"
        StatusText.SetText("正在监控中...")
        ; 开启定时器，使用用户设置的间隔
        SetTimer CheckColorLoop, EditInterval.Value
    } else {
        BtnStart.Text := "开始 (F8)"
        StatusText.SetText("已停止")
        SetTimer CheckColorLoop, 0 ; 关闭定时器
    }
}

; 更新颜色预览块的颜色
UpdatePreview(colorControl, colorStr) {
    try {
        cleanColor := StrReplace(colorStr, "0x", "")
        colorControl.Opt("c" . cleanColor)
    }
}

; 重置点1点击次数
ResetCount1(*) {
    global ClickCount1, TextClicked1, ChkEnable1, StatusText
    ClickCount1 := 0
    TextClicked1.Text := "0"
    ChkEnable1.Value := 1  ; 重新启用点1
    StatusText.SetText("点1点击次数已重置")
}

; 重置点2点击次数
ResetCount2(*) {
    global ClickCount2, TextClicked2, ChkEnable2, StatusText
    ClickCount2 := 0
    TextClicked2.Text := "0"
    ChkEnable2.Value := 1  ; 重新启用点2
    StatusText.SetText("点2点击次数已重置")
}

; 重置所有点击次数
ResetAllCounts(*) {
    global ClickCount1, ClickCount2, TextClicked1, TextClicked2, ChkEnable1, ChkEnable2, StatusText
    ClickCount1 := 0
    ClickCount2 := 0
    TextClicked1.Text := "0"
    TextClicked2.Text := "0"
    ChkEnable1.Value := 1  ; 重新启用所有点
    ChkEnable2.Value := 1
    StatusText.SetText("所有点击次数已重置")
}

; ==============================================================================
; 快捷键取点功能
; ==============================================================================

; F1: 取检测点1（坐标+颜色）
F1:: {
    global IsMonitoring, EditCheckX1, EditCheckY1, EditTargetColor1, ColorPreview1, StatusText
    if (IsMonitoring)
        return
        
    ToolTip "请移动鼠标到检测点1位置..."
    KeyWait "F1"  ; 等待释放F1
    Sleep 200  ; 短暂延迟，让用户有时间移动鼠标
    MouseGetPos &mouseX, &mouseY
    pColor := PixelGetColor(mouseX, mouseY, "RGB")
    
    EditCheckX1.Value := mouseX
    EditCheckY1.Value := mouseY
    EditTargetColor1.Value := pColor
    UpdatePreview(ColorPreview1, pColor)
    
    ToolTip  ; 清除提示
    StatusText.SetText("检测点1: 坐标(" . mouseX . "," . mouseY . ") 颜色: " . pColor)
}

; Ctrl+F1: 只取颜色1（不改变坐标）
^F1:: {
    global IsMonitoring, EditTargetColor1, ColorPreview1, StatusText
    if (IsMonitoring)
        return
        
    ToolTip "请移动鼠标到要取颜色的位置..."
    KeyWait "Ctrl"  ; 等待释放Ctrl
    Sleep 200
    MouseGetPos &mouseX, &mouseY
    pColor := PixelGetColor(mouseX, mouseY, "RGB")
    
    EditTargetColor1.Value := pColor
    UpdatePreview(ColorPreview1, pColor)
    
    ToolTip
    StatusText.SetText("颜色1已更新: " . pColor . " (坐标不变)")
}

; F2: 取点击点1
F2:: {
    global IsMonitoring, EditClickX1, EditClickY1, StatusText
    if (IsMonitoring)
        return
        
    ToolTip "请移动鼠标到点击点1位置..."
    KeyWait "F2"
    Sleep 200
    MouseGetPos &mouseX, &mouseY
    
    EditClickX1.Value := mouseX
    EditClickY1.Value := mouseY
    
    ToolTip
    StatusText.SetText("点击点1: (" . mouseX . "," . mouseY . ")")
}

; F3: 取检测点2（坐标+颜色）
F3:: {
    global IsMonitoring, EditCheckX2, EditCheckY2, EditTargetColor2, ColorPreview2, StatusText
    if (IsMonitoring)
        return
        
    ToolTip "请移动鼠标到检测点2位置..."
    KeyWait "F3"
    Sleep 200
    MouseGetPos &mouseX, &mouseY
    pColor := PixelGetColor(mouseX, mouseY, "RGB")
    
    EditCheckX2.Value := mouseX
    EditCheckY2.Value := mouseY
    EditTargetColor2.Value := pColor
    UpdatePreview(ColorPreview2, pColor)
    
    ToolTip
    StatusText.SetText("检测点2: 坐标(" . mouseX . "," . mouseY . ") 颜色: " . pColor)
}

; Ctrl+F3: 只取颜色2（不改变坐标）
^F3:: {
    global IsMonitoring, EditTargetColor2, ColorPreview2, StatusText
    if (IsMonitoring)
        return
        
    ToolTip "请移动鼠标到要取颜色的位置..."
    KeyWait "Ctrl"
    Sleep 200
    MouseGetPos &mouseX, &mouseY
    pColor := PixelGetColor(mouseX, mouseY, "RGB")
    
    EditTargetColor2.Value := pColor
    UpdatePreview(ColorPreview2, pColor)
    
    ToolTip
    StatusText.SetText("颜色2已更新: " . pColor . " (坐标不变)")
}

; F4: 取点击点2
F4:: {
    global IsMonitoring, EditClickX2, EditClickY2, StatusText
    if (IsMonitoring)
        return
        
    ToolTip "请移动鼠标到点击点2位置..."
    KeyWait "F4"
    Sleep 200
    MouseGetPos &mouseX, &mouseY
    
    EditClickX2.Value := mouseX
    EditClickY2.Value := mouseY
    
    ToolTip
    StatusText.SetText("点击点2: (" . mouseX . "," . mouseY . ")")
}

; ==============================================================================
; 配置文件功能
; ==============================================================================

SaveConfig(*) {
    global ConfigFile, EditCheckX1, EditCheckY1, EditTargetColor1, EditClickX1, EditClickY1, ChkEnable1
    global EditCheckX2, EditCheckY2, EditTargetColor2, EditClickX2, EditClickY2, ChkEnable2
    global EditInterval, EditMaxClicks1, EditMaxClicks2, StatusText
    
    try {
        ; 创建INI文件
        IniWrite(EditCheckX1.Value, ConfigFile, "Point1", "CheckX")
        IniWrite(EditCheckY1.Value, ConfigFile, "Point1", "CheckY")
        IniWrite(EditTargetColor1.Value, ConfigFile, "Point1", "TargetColor")
        IniWrite(EditClickX1.Value, ConfigFile, "Point1", "ClickX")
        IniWrite(EditClickY1.Value, ConfigFile, "Point1", "ClickY")
        IniWrite(ChkEnable1.Value, ConfigFile, "Point1", "Enabled")
        IniWrite(EditMaxClicks1.Value, ConfigFile, "Point1", "MaxClicks")
        
        IniWrite(EditCheckX2.Value, ConfigFile, "Point2", "CheckX")
        IniWrite(EditCheckY2.Value, ConfigFile, "Point2", "CheckY")
        IniWrite(EditTargetColor2.Value, ConfigFile, "Point2", "TargetColor")
        IniWrite(EditClickX2.Value, ConfigFile, "Point2", "ClickX")
        IniWrite(EditClickY2.Value, ConfigFile, "Point2", "ClickY")
        IniWrite(ChkEnable2.Value, ConfigFile, "Point2", "Enabled")
        IniWrite(EditMaxClicks2.Value, ConfigFile, "Point2", "MaxClicks")
        
        IniWrite(EditInterval.Value, ConfigFile, "Settings", "Interval")
        
        StatusText.SetText("配置已保存到: " . ConfigFile)
    } catch as err {
        StatusText.SetText("保存配置时出错: " . err.Message)
    }
}

LoadConfig(*) {
    global ConfigFile, EditCheckX1, EditCheckY1, EditTargetColor1, EditClickX1, EditClickY1, ChkEnable1
    global EditCheckX2, EditCheckY2, EditTargetColor2, EditClickX2, EditClickY2, ChkEnable2
    global EditInterval, EditMaxClicks1, EditMaxClicks2, StatusText, ColorPreview1, ColorPreview2
    
    try {
        ; 检查文件是否存在
        if (!FileExist(ConfigFile)) {
            StatusText.SetText("配置文件不存在，使用默认设置")
            return
        }
        
        ; 读取点1配置
        if (IniRead(ConfigFile, "Point1", "CheckX", "") != "") {
            EditCheckX1.Value := IniRead(ConfigFile, "Point1", "CheckX", "0")
            EditCheckY1.Value := IniRead(ConfigFile, "Point1", "CheckY", "0")
            EditTargetColor1.Value := IniRead(ConfigFile, "Point1", "TargetColor", "0xFFFFFF")
            EditClickX1.Value := IniRead(ConfigFile, "Point1", "ClickX", "0")
            EditClickY1.Value := IniRead(ConfigFile, "Point1", "ClickY", "0")
            ChkEnable1.Value := IniRead(ConfigFile, "Point1", "Enabled", "1")
            EditMaxClicks1.Value := IniRead(ConfigFile, "Point1", "MaxClicks", "0")
            
            UpdatePreview(ColorPreview1, EditTargetColor1.Value)
        }
        
        ; 读取点2配置
        if (IniRead(ConfigFile, "Point2", "CheckX", "") != "") {
            EditCheckX2.Value := IniRead(ConfigFile, "Point2", "CheckX", "0")
            EditCheckY2.Value := IniRead(ConfigFile, "Point2", "CheckY", "0")
            EditTargetColor2.Value := IniRead(ConfigFile, "Point2", "TargetColor", "0xFFFFFF")
            EditClickX2.Value := IniRead(ConfigFile, "Point2", "ClickX", "0")
            EditClickY2.Value := IniRead(ConfigFile, "Point2", "ClickY", "0")
            ChkEnable2.Value := IniRead(ConfigFile, "Point2", "Enabled", "1")
            EditMaxClicks2.Value := IniRead(ConfigFile, "Point2", "MaxClicks", "0")
            
            UpdatePreview(ColorPreview2, EditTargetColor2.Value)
        }
        
        ; 读取设置
        EditInterval.Value := IniRead(ConfigFile, "Settings", "Interval", "10")
        
        ; 重置点击计数器
        ResetAllCounts()
        
        StatusText.SetText("配置已从 " . ConfigFile . " 加载")
    } catch as err {
        StatusText.SetText("加载配置时出错: " . err.Message)
    }
}

; ==============================================================================
; 快捷键
; ==============================================================================

; F8 开启/停止监控
F8::ToggleMonitor()

; Ctrl+S 保存配置
^s::SaveConfig()

; Ctrl+L 加载配置
^l::LoadConfig()

; 当颜色编辑框内容改变时更新预览
EditTargetColor1.OnEvent("Change", (*) => UpdatePreview(ColorPreview1, EditTargetColor1.Value))
EditTargetColor2.OnEvent("Change", (*) => UpdatePreview(ColorPreview2, EditTargetColor2.Value))