外部硬件和软件可以通过监听包含所需数据的 UDP 数据包，与 BeamNG.drive 和 BeamNG.tech 进行集成。

有多种 UDP 协议可用，如果您是硬件或软件制造商，您可以相对轻松地实现自己的协议（请参阅下方的“其他协议”部分）。

这些协议可以在 `Options`（选项） > `Other`（其他） > `Protocols`（协议） > `OutGauge UDP protocol`（OutGauge UDP 协议）中启用和配置。

## OutGauge UDP 协议

该协议共享有关车辆的非常基本的信息，例如速度、踏板、一些仪表盘指示灯等。

它使用与 *Live For Speed* 相同的格式，这意味着大多数在 LFS 中与 OutGauge 配合使用的数字显示器和第三方软件也可以在 BeamNG.drive 中工作。目前并非所有字段都已实现。UDP 数据包具有以下格式：

```C
// 标记为 \`N/A\` 的项目未实现。

typedef struct xxx {

    unsigned       time;            // 时间，以毫秒为单位（用于检查顺序） // N/A, 硬编码为 0

    char           car[4];          // 车辆名称 // N/A, 固定值为 "beam"

    unsigned short flags;           // 信息（见下方的 OG_x）

    char           gear;            // 倒挡:0, 空挡:1, 一挡:2...

    char           plid;            // 被观看玩家的唯一 ID（0 = 无） // N/A, 硬编码为 0

    float          speed;           // 米/秒

    float          rpm;             // 转速 (RPM)

    float          turbo;           // 涡轮压力 (BAR)

    float          engTemp;         // 引擎温度 (C)

    float          fuel;            // 燃料 (0 到 1)

    float          oilPressure;     // 机油压力 (BAR) // N/A, 硬编码为 0

    float          oilTemp;         // 机油温度 (C)

    unsigned       dashLights;      // 可用的仪表盘指示灯（见下方的 DL_x）

    unsigned       showLights;      // 当前开启的仪表盘指示灯

    float          throttle;        // 油门 (0 到 1)

    float          brake;           // 刹车 (0 到 1)

    float          clutch;          // 离合器 (0 到 1)

    char           display1[16];    // 通常是燃料 // N/A, 硬编码为 ""

    char           display2[16];    // 通常是设置 // N/A, 硬编码为 ""

    int            id;              // 可选 - 仅当指定了 OutGauge ID 时

} xxx;
```

```Lua
-- OG_x - 标志位

local OG_SHIFT =     1  -- 按键 // N/A

local OG_CTRL  =     2  -- 按键 // N/A

local OG_TURBO =  8192  -- 显示涡轮表

local OG_KM    = 16384  -- 如果未设置 - 用户首选英里 (MILES)

local OG_BAR   = 32768  -- 如果未设置 - 用户首选 PSI

-- DL_x - dashLights 和 showLights 的位

local DL_SHIFT        = 2 ^ 0    -- 换挡提示灯

local DL_FULLBEAM     = 2 ^ 1    -- 远光灯

local DL_HANDBRAKE    = 2 ^ 2    -- 手刹

local DL_PITSPEED     = 2 ^ 3    -- 维修区限速器 // N/A

local DL_TC           = 2 ^ 4    -- 牵引力控制 (TC) 激活或关闭

local DL_SIGNAL_L     = 2 ^ 5    -- 左转向灯

local DL_SIGNAL_R     = 2 ^ 6    -- 右转向灯

local DL_SIGNAL_ANY   = 2 ^ 7    -- 共享转向灯 // N/A

local DL_OILWARN      = 2 ^ 8    -- 机油压力警告

local DL_BATTERY      = 2 ^ 9    -- 电池警告

local DL_ABS          = 2 ^ 10   -- ABS 激活或关闭

local DL_SPARE        = 2 ^ 11   -- N/A
```

## MotionSim UDP 协议

这是一个简单的协议，可用于引导运动平台。仅共享最基本的信息 - 对于更高级的用途，请查看下方的“其他协议”。

```C
typedef struct xxx  {

    char format[4]; // 允许验证数据包是否为预期格式，固定值为 "BNG1"

    float posX, posY, posZ; // 车辆的世界坐标位置

    float velX, velY, velZ; // 车辆的速度

    float accX, accY, accZ; // 车辆的加速度，不包含重力

    float upX,  upY,  upZ;  // 相对于车辆指向“上方”的向量分量

    float rollPos, pitchPos, yawPos; // 车辆的横滚角、俯仰角和偏航角

    float rollVel, pitchVel, yawVel; // 车辆横滚、俯仰和偏航的角速度

    float rollAcc, pitchAcc, yawAcc; // 车辆横滚、俯仰和偏航的角加速度

} xxx;
```

## 其他协议

### 我是最终用户，想要使用其他协议

请遵循您的硬件/运动模拟平台/数字仪表盘等的产品手册。

### 我是制造商，想实现自己的协议

**仅限程序员/制造商**：如果您需要帮助将硬件或软件与 BeamNG 集成，可以通过电子邮件联系我们。

如果您是来自硬件或软件制造商的程序员，您可能希望访问比上述默认协议提供的更多信息。

- 在 v0.32 之前，您被迫覆盖官方核心文件之一（例如覆盖 `outgauge.lua` 或 `motionSim.lua`）。
- 从 v0.32 开始，该区域已进行改进，您可以将自己的附加文件放置在 `lua/vehicle/protocols/` 中。

下面我们描述 v0.32 中引入的新协议系统：

#### 选择唯一的协议名称

第一步是为您的协议确定一个名称。请选择一个尽可能**唯一**的名称 - 这里的目标是避免与其他协议发生冲突。如果您的协议名称与其他协议相同，那么它可能会被其他协议覆盖。

一个安全的建议是选择一个包含协议**作者**（可以是公司、组织、个人等）以及协议本身独特的**唯一名称**的协议名称。

例如：“`MyCoolCompanyInc_ProtoDashboard`”。

**注意**：BeamNG 软件**可以同时运行任意数量的协议**。

因此，如果您构建了几个需要不同协议的产品，这是完全可行的：您只需要为每个产品选择不同的协议名称，这样用户就不会用一个协议的文件覆盖另一个协议的文件。

#### 编写协议程序

在开发您的协议期间，您可以遵循以下步骤：

- 1 打开 **[用户文件夹 (User folder)](../Support（支持）/Userfolder（用户文件夹）.md)**。
- 2 在用户文件夹内，创建一个名为 `USER_FOLDER/mods/unpacked/my_protocol_name/lua/vehicle/protocols/` 的文件夹（将 `my_protocol_name` 替换为您在上一节中确定的**唯一名称**）。
- 3 在该文件夹内，为您的自定义协议创建一个 `.LUA` 文件。例如，`USER_FOLDER/mods/unpacked/my_protocol_name/lua/vehicle/protocols/my_protocol_name.lua`（将 `my_protocol_name` 替换为您在上一节中确定的**唯一名称**）。
	- *您可能希望使用我们的官方协议文件作为参考 - 它们位于 `PROGRAM_INSTALL_FOLDER/lua/vehicle/protocols/*.lua`，并根据宽松的开源 bCDDL 许可证分发。您可以自由复制-粘贴-修改我们的协议，并根据 bCDDL（或任何兼容许可证）重新分发结果。*
- 4 您的自定义协议将通过使用 Ctrl + R 重新加载车辆来运行。
	- *您可以通过保存 `.LUA` 文件并再次按 Ctrl + R 来测试进一步的更改。*
- 5 当您达到满意的状态并想要分发时：
	- 确保关闭所有代码编辑器、任何打开的文件资源管理器窗口等 - 以避免文件被其他进程锁定。
	- 转到 `ESC menu`（ESC 菜单） > `Mods`（模组） > `Mods Manager`（模组管理器） > my\_protocol\_name > `PACK`（打包）。
	- *这将压缩您的 `mods/unpacked/my_protocol_name/` 协议文件夹，将其转换为位于 `mods/my_protocol_name.zip` 的 ZIP 文件。*

生成的 ZIP 文件可以自由分发给最终用户（见下文）。

将来，当您需要修改协议以添加新功能、修复错误等时：

- 1 转到 `ESC menu` > `Mods` > `Mods Manager` > my\_protocol\_name > `UNPACK`（解包）。
	- *这将把您的 `mods/my_protocol_name.zip` ZIP 文件解压回 `/mods/unpacked/my_protocol_name/`*
- 2 现在您可以自由编辑 lua 代码，像往常一样使用 Ctrl + R 进行测试等。

#### 协议识别

由于多个协议可能同时运行，且经常使用完全相同的 UDP 端口，您需要确保您的硬件/软件忽略其他协议的数据包，仅使用**您自己的**协议数据包。

有很多方法可以实现这一点，但常见的一种是使用某种**唯一标记**。

*例如，MotionSim 协议包含 4 个初始字符，硬编码值为 `"BNG1"`。这意味着任何与 MotionSim 协议兼容的硬件/软件都可以监听所有 UDP 数据包，并丢弃那些前 4 个字符不是 `"BNG1"` 的数据包。例如，如果它们发现 `"18x7"`，那么这很可能是来自未知协议的数据，其格式与 MotionSim 客户端所能理解的不同。*

对于您自己的协议，您可以使用任何您喜欢的解决方案。例如，您可以决定使用 10 个字符而不是 4 个。或者您可以决定使用 6 个字符，后跟 4 个对应于语义版本号的整数（以交叉检查打包器格式与数据包解析器的兼容性）。或者您可以使用任何您喜欢的自定义解决方案。

这里的唯一目标是确保您的代码可以识别它兼容哪些 UDP 数据包；同时防止您的 UDP 数据包被误认为是来自其他协议的数据包。

#### 分发您的协议

为了方便最终用户，我们建议您直接作为模组文件分发您的文件（使用我们特殊的 `.ZIP` 文件布局）。

要了解如何创建 ZIP 文件，请查看上面的 `编写协议程序` 部分。

您可以通过多种方式将此 ZIP 文件分发给最终用户：

- **推荐**：[上传到官方 BeamNG 模组仓库](https://www.beamng.com/resources/add)。用户可以在内置的 `Mods` 菜单中轻松搜索您的协议，并一键安装。更多信息请点击 [这里](https://www.beamng.com/threads/uploading-mods-to-the-repository.16555)。
- 替代方案：您可以自行分发 `.ZIP` 文件（例如，使用您自己的网络服务器，或包含在您的软件包中等）：
	- 如果您想自动安装，您的软件需要定位 **[用户文件夹 (User folder)](../Support（支持）/Userfolder（用户文件夹）.md)**，并将 .ZIP 文件按原样复制到 `USER_FOLDER/mods/` 中。**不要**解压 ZIP 文件，只需将 ZIP 文件复制到该文件夹中即可。例如 `USER_FOLDER/mods/my_protocol_name.zip`。
	- 如果您希望最终用户手动执行安装，您需要在产品手册中包含以下链接：`https://go.beamng.com/installing-mods-manually`。提供链接的好处是：a) 该链接保证在未来继续有效，b) 如果我们在未来更改 ZIP 安装程序，该页面将始终包含最新说明。

最后修改时间：2025 年 1 月 24 日

---
gemini-3-pro翻译