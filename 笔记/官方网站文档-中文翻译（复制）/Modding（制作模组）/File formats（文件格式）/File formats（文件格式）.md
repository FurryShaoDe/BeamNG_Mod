我们尽可能使其具有可扩展性，因此我们记录了 BeamNG 中使用的文件格式

| 扩展名          | 描述                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------- |
| `.js`        | [JavaScript (JS) 源文件](https://documentation.beamng.com/modding/file_formats/#js)              |
| `.dds`       | [DirectDraw Surface (DDS)](https://documentation.beamng.com/modding/file_formats/#dds)        |
| `.png`       | [Portable Network Graphics (PNG)](https://documentation.beamng.com/modding/file_formats/#png) |
| `.json`      | [JSON 数据文件](https://documentation.beamng.com/modding/file_formats/#json)                      |
| `.dae`       | [Collada 3D 模型](https://documentation.beamng.com/modding/file_formats/#dae)                   |
| `.cs`        | [Torque3D 代码](https://documentation.beamng.com/modding/file_formats/#cs)                      |
| `.ts`        | [TypeScript 代码](https://documentation.beamng.com/modding/file_formats/#ts)                    |
| `.jbeam`     | [JBeam 格式](https://documentation.beamng.com/modding/vehicle/intro_jbeam/)                     |
| `.map`       | [地图文件](https://documentation.beamng.com/modding/file_formats/#map)                            |
| `.jpg`       | [JPEG 图像文件](https://documentation.beamng.com/modding/file_formats/#jpg)                       |
| `.svg`       | [SVG 矢量图形](https://documentation.beamng.com/modding/file_formats/#svg)                        |
| `.lua`       | [Lua 脚本](https://documentation.beamng.com/modding/file_formats/#lua)                          |
| `.md`        | [Markdown 文档](https://documentation.beamng.com/modding/file_formats/#md)                      |
| `.pc`        | [部件配置文件](https://documentation.beamng.com/modding/file_formats/#pc)                           |
| `.ogg`       | [Ogg Vorbis 音频](https://documentation.beamng.com/modding/file_formats/#ogg)                   |
| `.flow.json` | [Flow 文件](https://documentation.beamng.com/modding/file_formats/#flow)                        |
| `.prefab`    | [预制件文件](https://documentation.beamng.com/modding/file_formats/#prefab)                        |
| `.css`       | [层叠样式表 (CSS)](https://documentation.beamng.com/modding/file_formats/#css)                     |
| `.flac`      | [FLAC 音频文件](https://documentation.beamng.com/modding/file_formats/#flac)                      |
| `.link`      | [链接文件](https://documentation.beamng.com/modding/file_formats/#link)                           |
| `.vue`       | [Vue 单文件组件](https://documentation.beamng.com/modding/file_formats/#vue)                       |
| `.hlsl`      | [高级着色语言 (HLSL)](https://documentation.beamng.com/modding/file_formats/#hlsl)                  |
| `.txt`       | [纯文本文件](https://documentation.beamng.com/modding/file_formats/#txt)                           |
| `.scss`      | [SASS/SCSS 样式表](https://documentation.beamng.com/modding/file_formats/#scss)                  |
| `.html`      | [HTML 文档](https://documentation.beamng.com/modding/file_formats/#html)                        |
| `.ttf`       | [TrueType 字体](https://documentation.beamng.com/modding/file_formats/#ttf)                     |
| `.pak`       | [打包/归档文件](https://documentation.beamng.com/modding/file_formats/#pak)                         |
| `.yml`       | [YAML 文件](https://documentation.beamng.com/modding/file_formats/#yml)                         |
| `.dll`       | [Windows 动态链接库](https://documentation.beamng.com/modding/file_formats/#dll)                   |
| `.cdae`      | [缓存的 Collada 形状](https://documentation.beamng.com/modding/file_formats/cdae/)                 |
| `.py`        | [Python 脚本](https://documentation.beamng.com/modding/file_formats/#py)                        |
| `.otf`       | [OpenType 字体](https://documentation.beamng.com/modding/file_formats/#otf)                     |
| `.bank`      | [音频库文件](https://documentation.beamng.com/modding/file_formats/#bank)                          |
| `.exe`       | [Windows 可执行文件](https://documentation.beamng.com/modding/file_formats/#exe)                   |
| `.atlas`     | [2D 精灵图集](https://documentation.beamng.com/modding/file_formats/#atlas)                       |
| `.log`       | [日志文件](https://documentation.beamng.com/modding/file_formats/#log)                            |
| `.ter`       | [地形数据](https://documentation.beamng.com/modding/file_formats/#ter)                            |
| `.h`         | [C/C++ 头文件](https://documentation.beamng.com/modding/file_formats/#h)                         |
| `.fmu`       | [功能模拟单元](https://documentation.beamng.com/modding/file_formats/#fmu)                          |
| `.csv`       | [逗号分隔值](https://documentation.beamng.com/modding/file_formats/#csv)                           |
| `.so`        | [Linux 共享对象](https://documentation.beamng.com/modding/file_formats/#so)                       |
| `.gltf`      | [GL 传输格式模型](https://documentation.beamng.com/modding/file_formats/#gltf)                      |
| `.lib`       | [静态库](https://documentation.beamng.com/modding/file_formats/#lib)                             |
| `.zip`       | [Zip 归档文件](https://documentation.beamng.com/modding/file_formats/#zip)                        |
| `.bmp`       | [位图图像](https://documentation.beamng.com/modding/file_formats/#bmp)                            |
| `.pdf`       | [PDF 文档](https://documentation.beamng.com/modding/file_formats/#pdf)                          |

### DirectDraw Surface (DDS)

DirectDraw Surface (DDS) 是一种用于位图图像的容器格式，在许多游戏中广泛用于未压缩或压缩的纹理。BeamNG 使用 `.dds` 来实现高效的纹理流式传输和渲染（例如法线贴图、漫反射纹理）。

### Portable Network Graphics (PNG)

PNG（Portable Network Graphics）是一种无损光栅格式，适用于界面图标、叠加层以及细节和透明度重要的纹理。BeamNG 经常使用 `.png` 作为 UI 元素或较小的纹理资源。

### JavaScript (JS) 源文件

JavaScript (\*.js\*) 脚本用于各种基于 Web 或前端的上下文中，例如基于 Web 技术构建的内置游戏 UI。它们也可能出现在构建工具、模组或其他工作流脚本中。

### JSON 数据文件

JSON（JavaScript Object Notation）是一种轻量级的基于文本的格式，用于结构化数据。BeamNG 可以使用 `.json` 来存储车辆配置、UI 设置、性能指标或模组数据。

### Collada 3D 模型 (.dae)

**Collada**（COLLAborative Design Activity）是一种基于 XML 的 3D 资源开放标准文件格式，由 Khronos Group 开发。在 [Wikipedia: COLLADA](https://en.wikipedia.org/wiki/COLLADA) 了解更多信息。

在 BeamNG 中，`.dae` 文件通常包含几何体、材质和场景数据。它们可以被处理为加载更快的 `.cdae`（缓存的 Collada）文件以提高性能。

### Torque3D 代码

这是一种过时的脚本格式。请不要使用或修改这些文件。改用 Lua。

### Lua 脚本

BeamNG 广泛使用 Lua 进行游戏内脚本、逻辑和场景行为。它是引擎用于游戏功能和模组支持的主要嵌入式脚本语言。

### HTML 文档

HTML 文件构成了 BeamNG 游戏内 UI 框架的基础，该框架使用 Web 技术构建菜单和叠加层。它们也可能出现在文档或自定义模组用户界面中。

### Ogg Vorbis 音频

Ogg Vorbis 是一种流行的开源音频格式，用于背景音乐、引擎声音或环境音轨。与未压缩格式相比，其压缩可以在较小的文件大小下提供不错的质量。

### WAV 音频文件

WAV 是标准的未压缩音频容器，通常用于编辑或引擎音效库，因为其保真度高。BeamNG 可能会将短音效片段或高质量源录音存储为 `.wav`。

### 地图文件

在 BeamNG 的上下文中，`.map` 文件可以指任务或关卡数据，存储布局、实体放置或环境配置。它们也可能出现在地图工具中，保存轨道或场景设计的各种引用。

### JPEG 图像文件

JPEG 图像（`.jpg` 或 `.jpeg`）使用有损压缩来减小文件大小，使其在纹理、UI 背景或文档图像中很受欢迎。与 `.png` 相比，它们对大型照片更高效，但缺乏无损透明度支持。

### SVG 矢量图形

可缩放矢量图形（`.svg`）是基于 XML 的矢量图像。它们可以在不损失质量的情况下缩放，使其成为图标、图表或可缩放 UI 元素的理想选择。在 BeamNG 中，`.svg` 可能用于基于 Web 的 UI 或文档。

### Markdown 文档

Markdown 文件（`.md`）是轻量级文本文档，使用简单的语法进行格式化（标题、列表等）。它们可用于 README 文件、游戏内教程或开发人员文档。

### 部件配置文件

部件配置文件（`.pc`）定义车辆配置，包含诸如车漆颜色、部件和调校参数等信息。

### Flow 文件

流程图文件（`.flow.json`）包含定义游戏逻辑的动态基于节点的脚本。

### 预制件文件

预制件文件（`.prefab`）将一组资源（车辆、静态对象、触发器等）捆绑在一起，以便在关卡运行时随时加载或卸载。它们也可以用作模板，使你能够轻松地复制和粘贴一组对象。预制件可以以两种格式保存和加载：`.prefab` 和 `.prefab.json`。目前建议使用 `.prefab`。

### 层叠样式表 (CSS)

层叠样式表（`.css`）定义 HTML 界面的视觉样式。BeamNG 的 UI 系统基于 Web 技术构建，可能使用 `.css` 来设置菜单、场景叠加层或模组 UI 的样式。

### FLAC 音频文件

FLAC（Free Lossless Audio Codec）是一种高质量音频压缩格式，不会丢失细节。虽然 `.ogg` 在游戏内资源中更常见，但 `.flac` 可能存储母版或高保真声音文件。

### Vue 单文件组件

`.vue` 单文件组件用于 Vue.js 框架的 Web UI。如果 BeamNG 的 UI 使用 Vue，`.vue` 文件可以在一个组件文件中包含 HTML、CSS 和 JS。

### 高级着色语言 (HLSL)

高级着色语言（`.hlsl`）是 Microsoft 为 Direct3D 开发的着色语言。如果 BeamNG 使用自定义着色器以改进图形效果，可能会出现此类文件。

### 纯文本文件

`.txt` 是一种通用的纯文本格式，用于日志、注释或描述符。BeamNG 或模组可能包括 `.txt` 文件中的简单文本数据。

### SASS/SCSS 样式表

SASS/SCSS（`.scss`）是 CSS 的超集，提供变量、嵌套等功能。编译为标准的 `.css` 后，它可能出现在高级 BeamNG UI 样式或开发工具中。

### TrueType 字体

TrueType 字体文件包含基于矢量的字形。`.ttf` 通常用于在游戏 UI 中显示文本，确保在菜单或叠加层中使用一致的字体。

### 打包/归档文件

打包或归档文件（`.pak`）将多个资源捆绑到一个容器中。它们可用于压缩和分发游戏资源或模组内容，以更简单的形式提供。

### YAML 文件

YAML 文件（`.yml` 或 `.yaml`）是友好的结构化数据格式。它们可以存储配置设置、环境变量或 BeamNG 中的其他结构化数据。

### Windows 动态链接库

动态链接库（`.dll`）包含 Windows 上的编译代码。它们可能用于 BeamNG 中的外部原生模块、插件或自定义引擎功能。

### Python 脚本

`.py` 文件是 Python 脚本，用于自动化、数据处理或自定义工具。在 BeamNG 工作流中，它们可以生成数据、管理构建或提供模组管理脚本。

### OpenType 字体

OpenType 字体（`.otf`）与 `.ttf` 类似，但可以包含高级排版功能。它们用于在 BeamNG UI 中显示自定义或附加字体，或用于模组文本。

### 音频库文件

音频库文件（`.bank`）可以在单个容器中存储多个声音资源或提示。它们有时由音频中间件（如 FMOD、Wwise）生成，供引擎使用。

### Windows 可执行文件

Windows 可执行文件（`.exe`）可以是与 BeamNG 相关的工具、安装程序或外部程序。模组很少直接分发 `.exe`，但开发工具可能出现在存储库中。

### 2D 精灵图集

2D 精灵图集文件（`.atlas`）定义单个纹理内的子图像（精灵）。它们可以通过减少 UI 或 2D 游戏元素中的纹理切换来提高性能。

### 日志文件

日志文件（`.log`）记录诊断信息、错误消息或执行跟踪。它们有助于调试 BeamNG 中的问题或监视游戏的运行时行为。

### 地形数据

地形文件（`.ter`）可以存储高度图、地面纹理和地形定义。在 BeamNG 中，它们可能被地形系统用于大型地图或越野环境。

### C/C++ 头文件

头文件（`.h`）声明 C/C++ 数据结构、函数或常量。它们可能出现在 BeamNG 的原生代码或游戏使用的外部库中。

### 功能模拟单元

功能模拟单元（`.fmu`）是动态系统模型（例如来自 Modelica）的容器。它们可能用于与 BeamNG 集成的高级物理仿真或外部工具链。

### 逗号分隔值

逗号分隔值（`.csv`）是一种存储类表格数据的文本格式。数据日志、性能指标或引用可以使用 Excel 或脚本轻松地在 `.csv` 中处理。

### Linux 共享对象

共享对象（`.so`）是 Linux/Unix 上的动态库。它们可以提供特定平台的代码或引擎模块，尽管在 BeamNG 中 Windows `.dll` 更常见。

### GL 传输格式模型

GL 传输格式（`.gltf`）是一种现代的基于 JSON 的 3D 模型、场景和动画标准。它可用于需要开放、高效运行时格式的工作流——尽管在 BeamNG 中 `.dae` 更常见。

### 静态库

静态库（`.lib`）包含要链接到可执行文件的编译代码。它们可能出现在与 BeamNG 引擎或其工具接口的原生代码项目中。

### Zip 归档文件

Zip 归档文件（`.zip`）将多个文件压缩为一个。它们是分发模组、数据或打包构建的常见方式。BeamNG 可以从 “mods” 文件夹加载压缩的模组归档文件。

### 位图图像

位图图像（`.bmp`）存储未压缩的像素数据。它们的带宽效率较低，但可能出现在较旧的模组资源或专用工具中。

### PDF 文档

便携式文档格式（`.pdf`）用于文档、手册或参考指南。模组制作者可能包括描述高级设置或自定义说明的 PDF。

最后修改：2025年3月24日

---
glm-4.7翻译