We try to be as mod-able as possible, so we’ve documented the file formats used in BeamNG

| Extension | Description |
| --- | --- |
| `.js` | [JavaScript (JS) Source Files](https://documentation.beamng.com/modding/file_formats/#js) |
| `.dds` | [DirectDraw Surface (DDS)](https://documentation.beamng.com/modding/file_formats/#dds) |
| `.png` | [Portable Network Graphics (PNG)](https://documentation.beamng.com/modding/file_formats/#png) |
| `.json` | [JSON Data Files](https://documentation.beamng.com/modding/file_formats/#json) |
| `.dae` | [Collada 3D Models](https://documentation.beamng.com/modding/file_formats/#dae) |
| `.cs` | [Torque3D Code](https://documentation.beamng.com/modding/file_formats/#cs) |
| `.ts` | [TypeScript Code](https://documentation.beamng.com/modding/file_formats/#ts) |
| `.jbeam` | [JBeam Format](https://documentation.beamng.com/modding/vehicle/intro_jbeam/) |
| `.map` | [Map Files](https://documentation.beamng.com/modding/file_formats/#map) |
| `.jpg` | [JPEG Image Files](https://documentation.beamng.com/modding/file_formats/#jpg) |
| `.svg` | [SVG Vector Graphics](https://documentation.beamng.com/modding/file_formats/#svg) |
| `.lua` | [Lua Scripts](https://documentation.beamng.com/modding/file_formats/#lua) |
| `.md` | [Markdown Documents](https://documentation.beamng.com/modding/file_formats/#md) |
| `.pc` | [Part Config Files](https://documentation.beamng.com/modding/file_formats/#pc) |
| `.ogg` | [Ogg Vorbis Audio](https://documentation.beamng.com/modding/file_formats/#ogg) |
| `.flow.json` | [Flow Files](https://documentation.beamng.com/modding/file_formats/#flow) |
| `.prefab` | [Prefab Files](https://documentation.beamng.com/modding/file_formats/#prefab) |
| `.css` | [Cascading Style Sheets (CSS)](https://documentation.beamng.com/modding/file_formats/#css) |
| `.flac` | [FLAC Audio Files](https://documentation.beamng.com/modding/file_formats/#flac) |
| `.link` | [Link Files](https://documentation.beamng.com/modding/file_formats/#link) |
| `.vue` | [Vue Single-File Components](https://documentation.beamng.com/modding/file_formats/#vue) |
| `.hlsl` | [High-Level Shading Language (HLSL)](https://documentation.beamng.com/modding/file_formats/#hlsl) |
| `.txt` | [Plain Text Files](https://documentation.beamng.com/modding/file_formats/#txt) |
| `.scss` | [SASS/SCSS Stylesheets](https://documentation.beamng.com/modding/file_formats/#scss) |
| `.html` | [HTML Documents](https://documentation.beamng.com/modding/file_formats/#html) |
| `.ttf` | [TrueType Fonts](https://documentation.beamng.com/modding/file_formats/#ttf) |
| `.pak` | [Pack/Archive Files](https://documentation.beamng.com/modding/file_formats/#pak) |
| `.yml` | [YAML Files](https://documentation.beamng.com/modding/file_formats/#yml) |
| `.dll` | [Windows Dynamic Libraries](https://documentation.beamng.com/modding/file_formats/#dll) |
| `.cdae` | [Cached Collada Shape](https://documentation.beamng.com/modding/file_formats/cdae/) |
| `.py` | [Python Scripts](https://documentation.beamng.com/modding/file_formats/#py) |
| `.otf` | [OpenType Fonts](https://documentation.beamng.com/modding/file_formats/#otf) |
| `.bank` | [Audio Bank Files](https://documentation.beamng.com/modding/file_formats/#bank) |
| `.exe` | [Windows Executables](https://documentation.beamng.com/modding/file_formats/#exe) |
| `.atlas` | [2D Sprite Atlases](https://documentation.beamng.com/modding/file_formats/#atlas) |
| `.log` | [Log Files](https://documentation.beamng.com/modding/file_formats/#log) |
| `.ter` | [Terrain Data](https://documentation.beamng.com/modding/file_formats/#ter) |
| `.h` | [C/C++ Header Files](https://documentation.beamng.com/modding/file_formats/#h) |
| `.fmu` | [Functional Mock-up Units](https://documentation.beamng.com/modding/file_formats/#fmu) |
| `.csv` | [Comma-Separated Values](https://documentation.beamng.com/modding/file_formats/#csv) |
| `.so` | [Linux Shared Objects](https://documentation.beamng.com/modding/file_formats/#so) |
| `.gltf` | [GL Transmission Format Models](https://documentation.beamng.com/modding/file_formats/#gltf) |
| `.lib` | [Static Libraries](https://documentation.beamng.com/modding/file_formats/#lib) |
| `.zip` | [Zip Archives](https://documentation.beamng.com/modding/file_formats/#zip) |
| `.bmp` | [Bitmap Images](https://documentation.beamng.com/modding/file_formats/#bmp) |
| `.pdf` | [PDF Documents](https://documentation.beamng.com/modding/file_formats/#pdf) |

### DirectDraw Surface (DDS)

DirectDraw Surface (DDS) is a container format for bitmap images, widely used for uncompressed or compressed textures in many games. BeamNG uses `.dds` for efficient texture streaming and rendering (e.g., normal maps, diffuse textures).

### Portable Network Graphics (PNG)

PNG (Portable Network Graphics) is a lossless raster format suitable for interface icons, overlays, and textures where detail and transparency are important. BeamNG often uses `.png` for UI elements or smaller texture assets.

### JavaScript (JS) Source Files

JavaScript (*.js*) scripts are used in various web-based or front-end contexts, such as the in-game UI built on web technologies. They may also appear in build tools, mods, or other workflow scripts.

### JSON Data Files

JSON (JavaScript Object Notation) is a lightweight text-based format used for structured data. BeamNG can use `.json` to store vehicle configurations, UI settings, performance metrics, or mod data.

### Collada 3D Models (.dae)

**Collada** (COLLAborative Design Activity) is an open standard XML-based file format for 3D assets, developed by the Khronos Group. Learn more at [Wikipedia: COLLADA](https://en.wikipedia.org/wiki/COLLADA).

In BeamNG, `.dae` files typically contain geometry, materials, and scene data. They can be processed into faster-loading `.cdae` (cached Collada) files for improved performance.

### Torque3D Code

This is an obsolete scripting format. Please do not use or modify these files. Use Lua instead.

### Lua Scripts

BeamNG uses Lua extensively for in-game scripting, logic, and scenario behavior. It’s the engine’s primary embedded scripting language for gameplay features and mod support.

### HTML Documents

HTML files form the basis of BeamNG’s in-game UI framework, which uses web technologies for menus and overlays. They may also appear in documentation or custom mod user interfaces.

### Ogg Vorbis Audio

Ogg Vorbis is a popular, open-source audio format used for background music, engine sounds, or ambient tracks. Its compression allows decent quality at smaller file sizes compared to uncompressed formats.

### WAV Audio Files

WAV is a standard uncompressed audio container, often used in editing or engine sound banks, given its high fidelity. BeamNG might store short effect clips or high-quality source recordings as `.wav`.

### Map Files

In the BeamNG context, `.map` files can refer to mission or level data, storing layout, entity placement, or environment configuration. They may also appear in mapping tools, holding various references for track or scenario design.

### JPEG Image Files

JPEG images (`.jpg` or `.jpeg`) use lossy compression to reduce file size, making them popular for textures, UI backgrounds, or documentation images. Compared to `.png`, they’re more efficient for large photos but lack lossless transparency support.

### SVG Vector Graphics

Scalable Vector Graphics (`.svg`) are XML-based vector images. They can scale without losing quality, making them ideal for icons, diagrams, or scalable UI elements. In BeamNG, `.svg` might be used in web-based UI or documentation.

### Markdown Documents

Markdown files (`.md`) are lightweight text documents that use a simple syntax for formatting (headings, lists, etc.). They may be used for README files, in-game tutorials, or developer documentation.

### Part Config Files

Part config files (`.pc`) define vehicle configurations and contain information such as paint colors, parts, and tuning parameters.

### Flow Files

Flowgraph files (`.flow.json`) contain dynamic node based scripts that define gameplay logic.

### Prefab Files

Prefab files (`.prefab`) bundle a group of assets together (vehicles, static objects, triggers, etc.) so that they can be loaded or unloaded at any time while a level is running. They can also be used as a template, allowing you to copy and paste a group of objects easily. Prefabs can be saved and loaded in two formats: `.prefab`, and `.prefab.json`. Currently, `.prefab` is recommended.

### Cascading Style Sheets (CSS)

Cascading Style Sheets (`.css`) define visual styles for HTML interfaces. BeamNG’s UI system, built on web technologies, may use `.css` to style menus, scenario overlays, or mod UIs.

### FLAC Audio Files

FLAC (Free Lossless Audio Codec) is a high-quality audio compression format without losing detail. Though `.ogg` is more common for in-game assets, `.flac` might store master or high-fidelity sound files.

### Vue Single-File Components

`.vue` single-file components are used in the Vue.js framework for web UIs. If BeamNG’s UI uses Vue, `.vue` files can contain HTML, CSS, and JS in one component file.

### High-Level Shading Language (HLSL)

High-Level Shading Language (`.hlsl`) is Microsoft’s shader language for Direct3D. Such files may appear if BeamNG uses custom shaders for improved graphical effects.

### Plain Text Files

`.txt` is a generic plain text format for logs, notes, or descriptors. BeamNG or mods might include simple textual data in `.txt` files.

### SASS/SCSS Stylesheets

SASS/SCSS (`.scss`) is a superset of CSS providing variables, nesting, and more. Compiled to standard `.css`, it may appear in advanced BeamNG UI styles or dev tools.

### TrueType Fonts

TrueType font files contain vector-based glyphs.`.ttf` is commonly used to display text in the game UI, ensuring consistent typeface usage in menus or overlays.

### Pack/Archive Files

Pack or archive files (`.pak`) bundle multiple resources into a single container. They can be used to compress and distribute game assets or mod content in a simpler package.

### YAML Files

YAML files (`.yml` or `.yaml`) are human-friendly, structured data formats. They can store configuration settings, environment variables, or other structured data in BeamNG.

### Windows Dynamic Libraries

Dynamically Linked Libraries (`.dll`) contain compiled code on Windows. They might be used for external native modules, plugins, or custom engine features in BeamNG.

### Python Scripts

`.py` files are Python scripts used for automation, data processing, or custom tooling. In a BeamNG workflow, they could generate data, manage builds, or provide mod management scripts.

### OpenType Fonts

OpenType Fonts (`.otf`) are similar to `.ttf` but can contain advanced typographic features. They’re used to display custom or additional fonts within the BeamNG UI or for modded texts.

### Audio Bank Files

Audio bank files (`.bank`) may store multiple sound assets or cues in a single container. They’re sometimes generated by audio middleware (like FMOD, Wwise) for use in the engine.

### Windows Executables

Windows executable files (`.exe`) can be tools, installers, or external programs related to BeamNG. Mods rarely distribute `.exe` directly but dev tools might appear in the repository.

### 2D Sprite Atlases

2D sprite atlas files (`.atlas`) define sub-images (sprites) within a single texture. They can improve performance by reducing texture switching in UI or 2D game elements.

### Log Files

Log files (`.log`) record diagnostic information, error messages, or execution traces. They help debug issues within BeamNG or monitor the game’s runtime behavior.

### Terrain Data

Terrain files (`.ter`) can store heightmaps, ground textures, and terrain definitions. In BeamNG, they might be used by the terrain system for large-scale maps or off-road environments.

### C/C++ Header Files

Header files (`.h`) declare C/C++ data structures, functions, or constants. They can appear in BeamNG’s native code or in external libraries that the game uses.

### Functional Mock-up Units

Functional Mock-up Units (`.fmu`) are containers for dynamic system models (e.g., from Modelica). They may be employed in advanced physics simulations or external toolchains integrated with BeamNG.

### Comma-Separated Values

Comma-Separated Values (`.csv`) is a text format storing table-like data. Data logs, performance metrics, or references can be handled easily in `.csv` with Excel or scripts.

### Linux Shared Objects

Shared objects (`.so`) are dynamic libraries on Linux/Unix. They can provide platform-specific code or engine modules, though Windows `.dll` is more common in BeamNG.

### GL Transmission Format Models

GL Transmission Format (`.gltf`) is a modern, JSON-based standard for 3D models, scenes, and animations. It can be used in workflows that require an open, efficient runtime format—though `.dae` is more common in BeamNG.

### Static Libraries

Static libraries (`.lib`) contain compiled code to be linked into executables. They can appear in native code projects that interface with the BeamNG engine or its tooling.

### Zip Archives

Zip archives (`.zip`) compress multiple files into one. They’re a common way to distribute mods, data, or packaged builds. BeamNG can load zipped mod archives from the “mods” folder.

### Bitmap Images

Bitmap images (`.bmp`) store uncompressed pixel data. They’re less bandwidth-efficient but can appear in older mod assets or specialized tooling.

### PDF Documents

Portable Document Format (`.pdf`) is used for documentation, manuals, or reference guides. Modders might include PDFs describing advanced setups or custom instructions.

Last modified: March 24, 2025