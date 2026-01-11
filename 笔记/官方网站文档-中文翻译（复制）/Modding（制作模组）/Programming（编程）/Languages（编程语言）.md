在为 BeamNG 编写模组（Mod）时，你可能会用到以下语言：

- Lua：是主要的编程语言，通常用于计算尽可能多的逻辑。例如，游戏玩法逻辑、各种车辆行为、部分物理计算等。
- Javascript/Html：用于在用户界面（UI）中显示信息。根据经验法则，我们建议仅将其用于 UI 显示目的，而将尽可能多的逻辑留给 Lua 计算。Lua 端随后将所有计算结果发送到 UI 端，而 Javascript/Html 仅负责显示它。这通常有助于使你的代码更健壮。

## BeamNG 术语

- [LUA 扩展 (Extensions)](https://documentation.beamng.com/modding/programming/extensions/)：这是 BeamNG 的模块系统。它具有序列化、事件等功能。
- [虚拟机 (Virtual Machines)](https://documentation.beamng.com/modding/programming/virtualmachines/)：BeamNG 并行运行多个独立的 Lua 系统以及多个 UI 实例，我们称之为 VM（虚拟机）。
- [虚拟机队列 (Virtual Machines Queues)](https://documentation.beamng.com/modding/programming/virtualmachines/#communication)：BeamNG 用于在虚拟机之间进行通信的主要系统。
- [虚拟机邮箱 (Virtual Machines Mailboxes)](https://documentation.beamng.com/modding/programming/virtualmachines/#communication) \`：BeamNG 用于在 VLUA 虚拟机之间进行通信的辅助系统。

## BeamNG 代码规范

#### 风格

- 文件夹命名示例：**ge/someFolderHere/lowerCamelCase/**
- 文件命名示例：**lowerCamelCase.lua**
- 缩进：**2 个空格（不要用 Tab）**
- 去除尾随空格 **开启 (ON)**
- 函数和变量名：**camelCase（小驼峰命名法）**
- “类”名：大驼峰命名法（PascalCase），例如：**MyCoolClass**

#### 源代码位置

请查看 [源代码位置](https://documentation.beamng.com/modding/programming/virtualmachines/#source-code-location) 以获取有关文件存放位置的信息。

## Lua 语言基础

虽然你应该自行学习如何编程以及如何使用 Lua 编程，但这里列出了该语言最基础的知识：

#### 基本术语

- `Table`（表）：Lua 中使用的基本且唯一的容器类型。根据你使用表的方式，表类似于数组（列表）或字典（映射）。
- `Array`（数组）：仅包含从 1 到无穷大的整数键的 Lua 表。可以使用 `#tbl` 正确计数。
- `Dictionary`（字典，`dict`）：包含各种类型键的 Lua 表。不能使用 `#tbl` 计数。
- `Module`（模块）：传统的 Lua `module` 已弃用。请勿使用。
- `Package`（包）：标准的 [Lua 包](https://www.lua.org/manual/5.3/manual.html#6.3)。可以使用，但如果可能，请使用扩展（Extensions）。参阅 *[这里](http://lua-users.org/wiki/ModulesTutorial)* 以及 *[这里](http://lua-users.org/wiki/TheEssenceOfLoadingCode)*。

#### 语法糖

为了方便起见，Lua 语言有时会提供不同的方式来实现行为相同的代码。例如：

- `myTable.ident` 等价于 `myTable['ident']`
- `myObject:name(args)` 是 `myObject.name(myObject, args)` 的语法糖
- `myFunction{fields}` 是 `myFunction({fields})` 的语法糖
- `myFunction'string'`（或 `myFunction"string"` 或 `myFunction[[string]]`）是 `myFunction('string')` 的语法糖
- `function t.a.b.c:foobar(params) body end` 是 `t.a.b.c.foobar = function(self, params) body end` 的语法糖

最后修改时间：2024 年 4 月 8 日

---
gemini-3-pro翻译