作为一名程序员，你应该时刻留意代码对性能的影响。

这不仅仅是关于优化代码，更在于有意识地选择有利于性能的代码架构。

**重要提示**：即使代码在你的电脑上运行“*良好*”也不重要。你的代码最终可能会在性能迥异的计算机上运行，那里的性能模式可能与你的电脑不匹配。即使你是用一台慢速电脑开发的，它的慢速也不一定是一个好的参考标准：模组（Mod）的不同组合、硬件的不同组合、驱动程序、操作系统更新等，都可能导致比你的低配电脑更差的性能表现。

## 基础优化技巧

本文档假设你已经具备基本的优化知识。例如：

- 了解通常如何进行优化：**测量，然后调整，再次测量**以评估调整的有效性。
- 永远不要假设你知道代码会如何表现。一定要测量。根据需要进行多次测量以确保数据的有效性。专门花精力**确定你的测量结果是否可靠**，或者相反，它们是否被外部因素（热缓存与冷缓存、外部程序、散热降频等）错误地偏差了。
- 了解**基本优化技术**：大O表示法（Big O notation）的含义及其用法。什么是缓存系统，并了解其可能的权衡（例如内存与 CPU 的使用）。利用数据局部性（data locality）更有效地使用可用的 RAM 带宽。了解瓶颈何时在于 I/O（如存储或网络）以及如何最好地解决这些限制。等等。

如果你还不具备基本的优化知识，建议先花点时间学习一下。本文档的其余部分是专门针对 BeamNG 软件的一些优化技术集合，或者是其他地方较难找到信息的内容。

## LuaJIT 优化：BeamNG 技巧

作为 BeamNG Lua 生态系统的一部分，我们使用一些工具来进行测量。作为模组程序员，这些工具对你也很有帮助：

- `timeprobe()` 函数：测量 2 次连续运行之间的时间。
- `gcprobe()` 函数：测量 2 次连续运行之间垃圾回收（GC）工作量的增加（见下文 [避免垃圾回收](https://documentation.beamng.com/modding/programming/performance/#avoid-garbage-collection) 章节）。
- `lua/common/luaProfiler.lua` 类：允许你将代码分成多个部分，包括重复执行（如循环）内部的部分，并测量每个部分的 GC 负载和时间。
- `lua/common/luaProfiler.lua` 类：还允许检测性能峰值（卡顿），并显示导致卡顿的 GC 负载和时间测量值。
- [GELUA 端](https://documentation.beamng.com/modding/programming/virtualmachines/#introduction) 的 `getPlayerVehicle()`、`getAllVehicles()`、`vehiclesIterator()`、`activeVehiclesIterator()` 函数：以零 GC 开销检索车辆对象。优先使用这些函数，而不是 `be:getPlayerVehicle()` 和类似的调用，后者会降低帧率（因为它们需要一路检索数据到 C++ 层然后再返回 LUA，此外它们还会增加 GC 工作量）。

## LuaJIT 优化：通用技巧

除了那些 BeamNG 特有的技巧外，还有一些通用的 Lua 和 LuaJIT 优化你应该尝试遵循。

#### LuaJIT：循环

作为一般规则，`for i,n` 循环比 `ipairs()` 循环快，而后者又比 `pairs()` 循环快。

如果没有充分的理由选择较慢的变体，请始终选择较快的循环类型。如果你能简单地（重新）设计你的代码以使用数组，而不是任意键值对表，那么就可以使用 `ipairs()`，在其他条件相同的情况下，它将比 `pairs()` 快。

像往常一样，如果你不确定或没有太多做优化的经验，你可能需要通过测量改进来验证，而不是假设你的更改是没问题的。

#### LuaJIT：局部符号

定义函数或变量的位置会对性能产生影响。

访问嵌套在某些表结构深处的变量会很慢，例如：

```lua
-- 访问非常慢，避免这样做：

foo(myTable[4]["foobar"][myIndex][50])

bar(myTable[4]["foobar"][myIndex][50])

baz(myTable[4]["foobar"][myIndex][50])

-- 使用缓存进行更快的访问，这样做：

local myVar = myTable[4]["foobar"][myIndex][50]

foo(myVar)

bar(myVar)

baz(myVar)
```

同样，变量的作用域也会产生同样的性能影响。一旦你知道文件局部（file-local）符号存储在文件特定的 Lua 表中，这就说得通了。而全局符号包含在全局 Lua 变量表中。

每当你使用某个符号时，LuaJIT 解释器将从检查该局部表开始，然后是父表，直到到达全局符号表。每一次表访问都会消耗性能。所以从纯粹性能的角度来看，局部变量优于全局变量。

**例如**：这就是为什么 [BeamNG LUA 扩展 (Extensions)](https://documentation.beamng.com/modding/programming/extensions/) 系统会将你的扩展作为 `myMod_myExtension` 提供，而不是作为 `myMod.myExtension`（节省一次或多次表访问）。这也是为什么你会在几个官方 BeamNG 文件中发现 `local max = math.max`，因为它节省了一次表访问。等等。

收益可能并不巨大，而且对代码可维护性/可读性的任何影响始终是需要考虑的因素。有时拥有可读的代码比稍快的代码更好。在其他情况下，例如非常常用的库或函数，且很少修改的地方，性能可能会占据首位，为了帧率而牺牲代码的可维护性。

#### LuaJIT：参考资料

这里列出了各种链接，包含有关 LuaJIT 解释器如何工作的信息，以及大量的优化技巧：

- [https://raw.githubusercontent.com/MethodicalAcceleratorDesign/MADdocs/master/luajit/luajit-doc.pdf](https://raw.githubusercontent.com/MethodicalAcceleratorDesign/MADdocs/master/luajit/luajit-doc.pdf)
- [https://0xbigshaq.github.io/2022/08/22/lua-jit-intro/](https://0xbigshaq.github.io/2022/08/22/lua-jit-intro/)
- [https://nickcano.com/hooking-luajit/](https://nickcano.com/hooking-luajit/)
- [https://mrale.ph/talks/vmss16/#/](https://mrale.ph/talks/vmss16/#/)
- [https://gitspartv.github.io/LuaJIT-Benchmarks/](https://gitspartv.github.io/LuaJIT-Benchmarks/)
- [https://percona.community/blog/2020/04/29/the-anatomy-of-luajit-tables-and-whats-special-about-them/](https://percona.community/blog/2020/04/29/the-anatomy-of-luajit-tables-and-whats-special-about-them/)
- [https://kipp.ly/jits-impls/](https://kipp.ly/jits-impls/)
- [https://www.freelists.org/post/luajit/How-to-call-functions-from-a-static-library-in-Luajit,13](https://www.freelists.org/post/luajit/How-to-call-functions-from-a-static-library-in-Luajit,13)
- [https://www.freelists.org/post/luajit/Few-questions-about-LuaJIT-internals-on-64-bit,6](https://www.freelists.org/post/luajit/Few-questions-about-LuaJIT-internals-on-64-bit,6)
- [http://brrt-to-the-future.blogspot.com/2019/03/reverse-linear-scan-allocation-is.html](http://brrt-to-the-future.blogspot.com/2019/03/reverse-linear-scan-allocation-is.html)
- [https://piotrduperas.com/posts/nan-boxing](https://piotrduperas.com/posts/nan-boxing)
- [https://pwparchive.wordpress.com/2012/10/16/peeking-inside-luajit/](https://pwparchive.wordpress.com/2012/10/16/peeking-inside-luajit/)

## 加载时与运行时的性能

当遵循各种优化技术时，你可能会发现自己必须在让模组启动更快，与模组加载后帧率更高之间做出选择。

在选择这种平衡时，你应该使用常识。通常的选择是，如果能在之后获得更好的性能，就将复杂性转移到加载时间上。

*例如，如果在启动期间出现高 GC 负载（见下文 [避免垃圾回收](https://documentation.beamng.com/modding/programming/performance/#avoid-garbage-collection) 章节）是可以接受的，只要你能设法在模拟器运行时实现零 GC 负载。另一方面，如果某种优化使加载时间延长了 5 分钟，却只换来了 0.5% 的帧率提升，那么这可能不是一个值得的权衡。*

## 更新频率

在编写代码时，你需要考虑**代码运行的频率**。它应该每图形帧运行一次吗？也许每物理刻（physics tick）一次？每用户界面刷新一次？或者是 15Hz 的固定频率？等等。

**注意：要了解更多关于可用基础更新频率的信息，请查看 [虚拟机的更新频率](https://documentation.beamng.com/modding/programming/virtualmachines/#update-rate) 章节。**

虽然从开发者的角度来看，为代码选择高更新频率很容易，但这不仅会对帧率产生负面影响，还会导致更大的卡顿几率和帧率不稳定的情况。

这里的经验法则是**选择你能接受的最低频率**，同时对于你的特定应用来说仍然合理。

对于大多数“游戏玩法”目的（例如记录分数或其他类似的高级概念），跟随用户界面更新频率可能就足够了。或者，跟随图形更新频率。

只有在**极其罕见**的情况下，你才需要求助于物理更新频率。任何以物理更新频率运行的代码都需要极其小心地编写，以避免对运行最低硬件配置电脑的用户造成严重的帧率影响。你需要应用本文档中包含的所有知识，甚至更多。你还需要在物理更新中仅包含绝对最精简的代码，将所有非必要的代码移动到图形更新中。

你可能会注意到，我们的官方代码仅将物理频率作为最后的手段，即从数学角度来看其他方法都行不通时才使用。

你还会注意到，与许多游戏开发指南的建议不同，在 BeamNG，我们尽可能**避免固定频率计算**。我们理解固定频率更新可以让程序员的生活更轻松：为稳定的频率编写稳定的数学逻辑比为不断变化的频率编写要容易得多。然而，缺点是固定频率的工作负载不会根据可用的计算机资源进行扩展或缩减。固定频率意味着你需要接受次优的妥协，低端硬件将承受不必要的高计算成本，而高端硬件将不必要地丢失它可以计算的额外细节。考虑到这一点，以可变频率运行（如图形帧率或用户界面频率）意味着你可以在高端计算机上提供更高的保真度，同时也对低端计算机更加友好。

*注意：编写能够在极端频率变化下工作的数学逻辑很难：因此，报告的图形“更新频率”保证最低为 **20 Hz**。当计算机无法达到 20 FPS 时，模拟将根据需要减慢。这是一个保证，可以帮助你以安全的基准频率编写数学逻辑。*

当编写在可变更新频率下工作的代码时，你应该使用一个有用的工具，即 `Options`（选项） > `Display`（显示） > `Limit framerate`（限制帧率）滑块。你可以将其设置为 20 FPS，以在最坏情况（20 Hz 更新，如果你的代码挂钩到图形更新）下测试你的数学逻辑，你也可以禁用此限制器并配合 `Options` > `Graphics` > `Lowest`（最低画质）以尝试达到尽可能高的帧率。一个实现高帧率的好地方是使用 `Grid, Small, Pure` 地图，并且不使用任何交通车辆。

## 避免垃圾回收

如果你是具有垃圾回收功能语言（如 Lua 或 Javascript）的程序员，并且你不熟悉什么是垃圾回收器（**GC**），请在继续之前上网搜索相关信息并了解其基础知识。

GC 是一些高级语言提供的便捷功能，但在性能密集型环境（如实时模拟器）中使用时，可能会产生巨大的影响。GC 会对你隐藏 new/delete 操作，但作为交换，它会以两种方式造成损失：

- 较低的帧率：GC 必须运行才能完成其工作，这种垃圾清理工作负载将占用一些帧率。
- 可变帧率：GC 工作负载可能不会在时间上均匀分布，而是可能周期性地堆积。这可能导致**卡顿**（Stutter，帧率的负峰值），以及**橡皮筋效应**（Rubber banding，帧率一秒高，下一秒低，然后再高，等等），这将导致慢动作/快动作的不良效果。

为了减少 GC 负载，首先你需要能够测量它。在 Lua 的情况下，我们提供了一些功能：

- `gcprobe()` 函数：在一段代码之前/之后运行它，它会告诉你该代码产生了多少字节的垃圾。
- `lua/common/luaProfiler.lua` 分析器：不仅测量时间信息，还测量垃圾生成量。
- ctrl-shift-f > `Tools`（工具）菜单 > `Log gelua profile`（记录 gelua 分析）：这将记录每个 GELUA 扩展在最后一个图形帧期间生成了多少字节的垃圾（使用 ~ 查看日志）。

一旦你知道代码产生了多少 GC 负载，就需要找到减少它的方法。作为一般规则，这意味着避免创建（分配）新对象。

- 尝试在扩展钩子的多次连续调用中重用对象。例如，你可能希望拥有一个被重用的父级作用域 Lua 变量，而不是在每次函数调用时从头开始生成一个新对象。
- 使用减少 GC 负载的 API。例如，你可以使用零垃圾替代方案 `myVector:set(5,4,2)` 重新赋值 `myVector = vec3(5,4,2)`。同样适用于优先使用 `setAdd` 和我们提供的具有确切 GC 减少目的的类似 API。
- 使用完全消除 GC 负载的 API。例如，优先使用 X,Y,Z 元组（例如我们以 `....XYZ()` 结尾的函数）而不是 vec3。
- 等等。

对此没有固定的规则，许多优化是性能与代码可维护性/可读性之间的权衡。有时你可能想牺牲短期性能，使代码更易于使用（这反过来可能在长期内实现更高级别的优化，因为代码更易于理解）。

## 避免三角函数

使用角度工作通常会导致使用 `sin()`、`cos()`、`tan()` 及其所有变体函数。这些函数可能非常慢，应尽可能避免使用。

相反，考虑使用**点积**（dot product）、**叉积**（cross product）和其他基本向量运算。这些更简单的数学工具通常可以简化你的代码，完全消除显式使用“角度”的需要。

程序员非常熟悉角度，但不熟悉点/叉积的情况相对普遍。因此，传统三角函数的吸引力是可以理解的，但这并不意味着从性能编码的角度来看它是最佳方法。

三角函数通常用于将几何概念转换为角度，以便程序员随后可以在角度上进行操作；结果只是最终又将其全部转换回向量或四元数。因此，如果你学会直接使用向量，就可以跳过那些不必要的来回转换。这通常会导致更简单的代码，而且也更快。

## 避免欧拉角

通常，欧拉角（euler angles）被用作中间格式，然后最终被转换回四元数或矩阵（供核心引擎使用）。建议完全避免欧拉角，并使用四元数或矩阵。

这样做意味着你可以跳过将旋转转换为欧拉格式（然后再转出）的来回转换。这简化了你的代码，作为额外的奖励，也使其更快。

除了这种临时转换的性能成本外，它们还可能导致错误（例如由于不必要的操作而丢失数值精度），并导致代码的可维护性/可读性降低（例如，欧拉角有许多变体，你可能不确定每个函数接受哪种确切的欧拉格式）。

唯一可以接受欧拉角的例外是向最终用户显示，例如在关卡编辑器 UI 或类似的内容创建工具中：

- 如果你需要在 UI 中向美术人员/模组制作者显示角度，请始终使用四元数进行操作，并仅在数据管道的最后阶段，即需要在屏幕上渲染数值的确切时刻，才转换为欧拉角。
- 如果可以，将欧拉值显示为只读值，而不是可编辑的文本字段。考虑提供一个交互式 3D 小部件（Gizmo）来使用鼠标/键盘应用旋转（其内部不使用欧拉角，而是使用四元数），而不是提供一个用户可以输入的包含 3 个数字的文本字段。
- 如果你绝对、确实需要在你的编辑工具 UI 上显示一个带有欧拉角的读写文本字段，请在多次连续保存的场景下审查你的代码：在用户不编辑数值的情况下，欧拉角是否会慢慢偏离原始值？如果是这样，你需要审查你的代码管道以找出数值漂移的来源，并找到解决方案。

## 避免虚拟机之间的通信

[在虚拟机之间发送数据](https://documentation.beamng.com/modding/programming/virtualmachines/#communication) 会对性能产生负面影响，特别是以延迟、较低的帧率和不必要的帧率波动的形式。这三者的组合在当今通常被最终用户称为“卡顿/延迟（Lag）”（即使它不仅限于延迟）。

一些尽可能保持性能的建议：

- 如果可以，完全**避免虚拟机之间的通信**。
- 如果符合你的要求，**使用 [VLUA 邮箱 (mailboxes)](https://documentation.beamng.com/modding/programming/virtualmachines/#communication)**。
- 将通信频率**降低到最低限度**。每一图形帧发送数据真的很糟糕，如果可能的话，考虑每个事件发送一次预先计算的数据，或者每分钟发送一次，等等。

#### 虚拟机通信优化示例

假设你正在编写一个模组，用于评估你的烧胎（burnout）有多好。这将分析车轮空转模式，并在 UI 中显示分数。

在你最初的实现中，你使用 `obj:queueGameEngineLua()` 在每个图形帧将车轮空转信息从 VLUA 发送到 GELUA。一旦到了 GELUA，所有数据都被分析，你生成一个数值评分。然后，你使用 `guihook.trigger()` 在每一帧将此评分发送到 UI。

虽然这种方法行得通，但在性能方面非常糟糕，而且有很大的改进空间：

首先，不要在 GELUA 中计算烧胎评分。相反，在数据已经存在的 VLUA 中计算它。这避免了将所有物理信息从 VLUA 发送到 GELUA。

然后，考虑你是否只想在结束画面显示烧胎结果：

- 只在结束画面？那么你只需要在烧胎结束时，在虚拟机之间通信一次。
- 作为 UI 中的实时指示器？
	- 那么你可能只希望在指示器自上次以来发生变化**时**才更新此指示器（在虚拟机之间通信）。
	- 根据视觉指示器的不同，你可能希望进一步优化：
		- 是进度条吗？那么除此之外，你可能希望仅在 UI 更新帧 `onGuiUpdate()` 发送它，而不是在图形帧 `onUpdate()` 发送。
		- 是显示数值的文本标签吗？那么除此之外，你可能希望每秒仅更新此值一次（这样用户可以在文本再次更改之前真正看清它）。

最后修改时间：2025 年 6 月 17 日

---
gemini-3-pro翻译