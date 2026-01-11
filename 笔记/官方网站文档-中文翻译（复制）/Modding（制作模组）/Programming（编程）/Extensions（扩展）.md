### 描述

Lua BeamNG 扩展（Extensions）是一种简单且可扩展的功能扩展方式。BeamNG 扩展允许将多个代码片段结合在一起，而无需修改任何官方文件（修改官方文件可能会在每次官方更新后产生问题，并且会导致你的模组无法进入 [官方 BeamNG 模组仓库](https://www.beamng.com/resources)）。

例如：你可以编写一个模组，当玩家使用慢动作系统时做出反应，而无需编辑官方的慢动作源文件来插入对你模组的显式调用。

这是通过“钩子（hook）”功能实现的，扩展可以订阅各种事件，也可以自行触发事件。

### 代码展示

一个 BeamNG Lua 扩展本质上是一个返回表（table）的 Lua 文件。例如：

```lua
local M = {}

  M.myData = 10

  M.myFunction = function() print("hello world") end

  return M
```

一旦你的模组被打包成 zip 文件，扩展文件应放置在以下位置之一：

```lua
(someMod.zip) /lua/common/extensions/
  (someMod.zip) /lua/ge/extensions/
  (someMod.zip) /lua/vehicle/extensions/
```

你的选择将决定 BeamNG 扩展可以在哪个 [Lua 虚拟机](https://documentation.beamng.com/modding/programming/virtualmachines/) 中使用。有关更多背景信息，请参阅 [源代码位置](https://documentation.beamng.com/modding/programming/virtualmachines/#source-code-location)。

### 使用扩展

你创建的扩展只有在你编写显式代码加载它时才会被加载。例如：

```lua
extensions.load("myMod_myExtension")        -- 加载 extensions/myMod/myExtension.lua
```

一旦 BeamNG 扩展被加载，你就可以访问它的表：

```lua
myMod_myExtension.myFunction()

  myMod_myExtension.myData = 20
```

你也可以在当前 Lua 虚拟机中加载的所有扩展中运行同一个函数：

```lua
extensions.hook("myCustomEvent")        -- 这将调用 myMod_myExtension.myCustomEvent()，并在所有其他已加载的扩展中调用 myCustomEvent()
```

当你不再需要某个扩展时，必须将其卸载：

```lua
extensions.unload(...)
```

保持不必要的扩展处于加载状态会浪费计算机资源并降低帧率，因此请避免这样做。

注 1：存在一种形式为 `extensions.myMod_myExtension.foo()` 的语法。请避免使用这种语法，因为 a) 与 `myMod_myExtension.foo()` 相比，它会降低帧率，并且…… b) 如果扩展尚未加载，它会自动加载该扩展。作为一般规则，你不应该需要自动加载扩展，而应该显式地进行加载。

注 2：你的扩展可以显式定义它依赖于哪些其他扩展。通过以下方式完成：

```lua
M.dependencies = { "foo_bar", "baz_qux", ...}
```

这将告诉 BeamNG 扩展系统为你加载/卸载这些依赖项。它还会组织钩子函数的调用，使它们按照适当的顺序遵循依赖树。换句话说，钩子将首先在依赖项中运行，然后在你自己的扩展中运行，依此类推。

### 通用扩展函数/数据

除了你自己特定的“myFunction”、“myData”成员外，你的表中还可以包含更通用的成员。

例如：

```lua
M.onExtensionLoaded = function() ... end   -- 当扩展被加载时调用

  M.onUpdate = function() ... end            -- 每 GFX 帧（图形帧）调用一次

  M.onGuiUpdate = function() ... end         -- 每 UI 帧调用一次

  M.state = { foo=1, bar=2, ... }            -- 可用于在 Lua 虚拟机重载期间保存+加载扩展状态

  M.onSerialize = function() ... end         -- 可用于在 Lua 虚拟机重载期间使用自定义序列化函数保存+加载扩展状态

  M.dependencies = { "core_camera", ... }    -- 可用于自动加载其他扩展

  etc
```

没有关于这些特殊函数和变量的集中列表；源代码即文档(tm)。例如，你可以研究 lua/ge/main.lua、lua/common/extensions.lua 等文件中的代码。查看谁在调用扩展钩子，或者观察其他扩展是如何编写的等。

最后修改时间：2025 年 1 月 24 日

---
gemini-3-pro翻译