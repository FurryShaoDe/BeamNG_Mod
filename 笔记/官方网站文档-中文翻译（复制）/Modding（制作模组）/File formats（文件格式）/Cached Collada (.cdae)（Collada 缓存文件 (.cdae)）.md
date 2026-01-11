## 版本 31 / 0x001F

本文档描述了在 BeamNG 代码库中生成的 **v31** BeamNG *缓存 Collada* (`.cdae`) 形状文件格式。数据以 [MessagePack](https://msgpack.org/) 格式序列化，可能使用 [Zstandard](https://facebook.github.io/zstd/) 压缩。使用此信息来构建或调试你自己的文件读取工具。

### 为何使用二进制格式以实现速度和效率

`.cdae` 文件以二进制格式存储形状数据，原因如下：

1. **减小体积**：二进制数据比基于文本的格式开销更小，从而降低磁盘空间使用和下载时间。
2. **更快的解析**：工具和引擎可以更快地读取二进制形式的整数、浮点数和其他元素，而无需从文本中解析它们。
3. **简化工作流**：使用二进制时，数据布局（例如浮点数、整数、向量）更接近内存结构，最大程度地减少转换。
4. **一致的表示**：二进制确保格式没有歧义，使读/写操作更可靠。

这种一致且紧凑的方法最终在加载形状时提升性能，尤其是在大规模加载时。

---

### .cdae 文件内容概述 (v31)

v31 格式引入了一种更结构化的方法，具有独立的头部和主体，以及可选的压缩：

**v31 .cdae 文件内容的粗略伪代码表**

| 步骤 | 内容 | 说明 |
| --- | --- | --- |
| 1 | \*文件头\*（32 位整数，版本）。 | 检查 `version & 0xFF == 31` 以验证它是否为 v31。 |
| 2 | \*头部大小\*（32 位无符号整数）。 | 以下头部数据的大小（以字节为单位）。 |
| 3 | \*MsgPack 头部\*（包含元数据的字典） | 包含压缩标志、主体大小等信息。 |
| 4 | \*主体数据\*（可能已压缩） | 如果已压缩，请使用 Zstandard 解压缩。包含形状数据。 |

头部是一个 MsgPack 字典，包含有关文件的元数据，包括主体是否被压缩。主体包含实际的形状数据，同样采用 MsgPack 格式。

---

### 使用 cdae\_dump\_info.py

作为检查或调试 `.cdae` 文件的另一种方式，你可以使用 [cdae\_dump\_info.py](https://documentation.beamng.com/modding/file_formats/cdae/cdae_dump_info.py) 脚本。例如，在你的控制台/终端中运行以下命令：

python

复制

```
>python cdae_dump_info.py vehicles\pickup\pickup.cdae
```

### 文件结构：头部和主体

在文件的开头，格式开始于：

1. **32 位整数** `version`：

cpp

复制

```
version = (smVersion | (mExporterVersion << 16))
```

![](https://chatglm.cn/main/fn6/Pn5/Pl6vLn5+/f7+/m6/Pm6vPf3//l6fHk6vLl5/Hm6fHl6PHn6vLm6fHo6vTl6fPm5vHn5/Lk5/Lm6/Hn6/Pm6fPm6vEaICnm6fJna3TN0NnZ3OU0OULNz9lNUluAhI0nLTZzeIFARU5zd4CAhY6zt7+mqrNaX2iZnqdARk/AxM2zt8CZnaYyn2x3AAAAJXRSTlMAcIC/39+v75AQ7+8gQECfIBCPjxDPYIDPsJ+gb89wYGBwf8/PXr3f9QAAAWdJREFUOMuNldd2gzAQREXvBuLgEqcniGLAxOn5/w+LigGJJuZpfPYejSRWawA4eU+6ZkBoRLrsgUldPyOmk+q749gaDjSG3hpwROqmz63hhK74WAVOKrIY8A7OSFmQ20vfQIEkyrmqCHToNm+gUCTchQtk9RZ8/8zjOCM2K4sqTpqCjEBmh6cY64jtT45tCzoArDqujFswJVwHQg/Irc9IsUhw9Be21emXuSG99R+4WFP/jWyeMrvfgxc+uaSerM21Eei6K8HVP7qLAegAyINVjddMyVHyggnvgzG5x/Ri3xjQGIDHDkyYaHUZ+Mpczyy4B9IyUGY+4SyIxoHBtwQ5ddY/tYa6Z9v8oI1QnbE/E65u79FHYLikcQPc4qaY88mbCQ0RpwX0Gd6LwMfmYQvCzW5UKHNcxMyecDczeixunpkLcqketDHMloYjNziMLGeNTvHgwK1qb63pP4aVrO9sxGi6tOIr/4xNt/ViQm5CAAAAAElFTkSuQmCC)![](https://chatglm.cn/main/fn6/Pn5/Pl6vLn5+/f7+/m6/Pm6vPf3//l6fHk6vLl5/Hm6fHl6PHn6vLm6fHo6vTl6fPm5vHn5/Lk5/Lm6/Hn6/Pm6fPm6vHm6fIkVP9ti/rO1vPO1vTa4PM9Z/15lflVefs8Z/2FnvhJcPydsfdVefwxXv4wXv6Fnvlhgvt5lfq1w/XN1/TN1/NIcfyFn/mpu/bBzvTZ4PO1xPWFn/hJcP3Z6S91AAAAJXRSTlMAcIC/39+v75AQ7+8gQECfIBCPjxDPYIDPsJ+gb89wYGBwf8/PXr3f9QAAAW9JREFUOMuNledWwzAMhZ00uyulpIOywdnQQcve7/9QeBCPLOf+ujn6jiXbsgKApOGVZdoQ2oGlD0Gjjq8Rw2WMB/XYFFZUh57asEbGrMxNYYOO5LQ92KjAFcAz2KJeh7yl7DOokEa5gaEC+7TME6gUST6AHeSWFnx+zMIwJfbrsNuHURHQEShU+BRixdh+3mPLwD4AI869hwx8IRwH4RDozKckeBfh1FtsH/Jv4YQs5j9wcEP9G7JZLFS/BDfMrzG4pp6sLbUR4N0V4eiWVlEB+wDK4P73gGxCtpLtXnm0DIbkHJN/mwugXQFjDkZCaqMbeCscTyu4BFo3UBeusBVE44DtJue7Tsu7NlH3zIuPJCMXTO7mh3AbdoljBE66NK6PW9xRc2PyZia2ijN9+gzPVeBl8bAVyR0+KnptXCDMnsmiZfS40jxzOuSlujDrME+rjlx/VbOcWzvF/ZW0qjd3m38MI91aeIgxLW0kR/4AbZ+1p3zqBJgAAAAASUVORK5CYII=)

引用

```
其中 **\`smVersion\`** 对此格式设置为 \`31\`，**\`exporter_version\`** 是高位中的独立 16 位值。
读取器应检查 \`(version & 0xFF) == 31\` 以确认它是否为 *v31* 形状。
```
2. **32 位无符号整数** `headerSize`：这表示后续的 MsgPack 头部数据的大小。
3. **MsgPack 头部**：包含有关文件元数据的字典，例如：
	- `compression`：布尔值，指示主体是否使用 Zstandard 压缩
	- `bodysize`：主体数据的大小（以字节为单位）
	- 其他可能的元数据
4. **主体数据**：
	- 如果 `compression` 为 true，则主体使用 Zstandard 压缩，需要解压缩
	- 一旦解压缩（如果需要），主体包含 MsgPack 格式的实际形状数据

---

### MsgPack 主体数据概述

在读取并（如有必要）解压缩主体数据后，你可以按特定顺序解析 MsgPack 对象：

1. **形状信息**：
	- `mSmallestVisibleSize` (float)
	- `mSmallestVisibleDL` (int32)
	- `radius` (float)
	- `tubeRadius` (float)
	- `center` (Point3F - 3 个浮点数)
	- `bounds` (Box3F - 6 个浮点数)
2. **多个向量 (pack\_vector)**，每个存储为：
	- 用于向量长度的 32 位有符号整数
	- 用于元素大小（以字节为单位）的 32 位有符号整数
	- 长度为 `vector.size * elementSize` 的原始二进制块 (MsgPack “bin”)。  
		代码按顺序读取这些内容：
	- `nodes`
	- `objects`
	- `subShapeFirstNode`
	- `subShapeFirstObject`
	- `subShapeNumNodes`
	- `subShapeNumObjects`
	- `defaultRotations`
	- `defaultTranslations`
	- `nodeRotations`
	- `nodeTranslations`
	- `nodeUniformScales`
	- `nodeAlignedScales`
	- `nodeArbitraryScaleFactors`
	- `nodeArbitraryScaleRots`
	- `groundTranslations`
	- `groundRotations`
	- `objectStates`
	- `triggers`
	- `details`
3. **字符串数组**
	- 用于形状名称数量的 `uint32`。
	- 每个名称是一个 MsgPack 字符串。
4. **网格**
	- 一个 `uint32` “总网格数” 计数。
	- 每个网格包含：
		- `uint32 meshType`：
			- `0` → StandardMesh
			- `1` → SkinMesh
			- `2` → DecalMesh (已弃用)
			- `3` → SortedMesh
			- `4` → NullMesh
		- 对于非空网格：
			- `int32 numFrames`
			- `int32 numMatFrames`
			- `int32 parentMesh`
			- `Box3F mBounds` (6 个浮点数)
			- `Point3F mCenter` (3 个浮点数)
			- `float mRadius`  
				然后为以下内容调用额外的 `pack_vector`：
			- `verts`
			- `tverts`
			- `tverts2`
			- `colors`
			- `norms`
			- `encodedNorms`
			- `primitives`
			- `indices`
			- `tangents`  
				最后：
			- `int32 vertsPerFrame`
			- `uint32 meshFlags`
		- **对于 SkinMesh 类型（类型 1），会读取额外数据：**
			- 首先，确定它是否为父网格 (`parentMesh < 0`)
			- 对于父网格：
				- `skinMesh.initialVerts` 向量
				- `skinMesh.initialNorms` 向量
			- 对于所有 SkinMesh 类型：
				- `skinMesh.initialTransforms` 向量
			- 对于父网格：
				- `skinMesh.vertexIndex` 向量
				- `skinMesh.boneIndex` 向量
				- `skinMesh.weight` 向量
				- `skinMesh.nodeIndex` 向量
5. **序列**
	- 一个 `uint32 numSequences`。
	- 对于每个序列：
		- `int32 nameIndex`
		- `uint32 flags`
		- `int32 numKeyframes`
		- `float duration`
		- `int32 priority`
		- `int32 firstGroundFrame`
		- `int32 numGroundFrames`
		- `int32 baseRotation`
		- `int32 baseTranslation`
		- `int32 baseScale`
		- `int32 baseObjectState`
		- `int32 baseDecalState`
		- `int32 firstTrigger`
		- `int32 numTriggers`
		- `float toolBegin`
		- `TSIntegerSet rotationMatters`
		- `TSIntegerSet translationMatters`
		- `TSIntegerSet scaleMatters`
		- `TSIntegerSet visMatters`
		- `TSIntegerSet frameMatters`
		- `TSIntegerSet matFrameMatters`
6. **材质列表** (可选)
	- 一个 `uint32 materialCount`。
	- 对于每个材质：
		- `string name`
		- `uint32 flags`
		- `uint32 reflectanceMap`
		- `uint32 bumpMap`
		- `uint32 detailMap`
		- `float detailScale`
		- `float reflectionAmount`

这完成了数据。简要定义：

- `Point3F`：3 个浮点数 `[x, y, z]`。
- `Box3F`：最小和最大角点 => 共 6 个浮点数。
- `TSIntegerSet`：用于节点/元素标志的专用位集。

---

### 读取策略（伪代码）

1. **读取** 前 4 个字节（32 位整数）→ `version`。
	- 检查 `version & 0xFF == 31`。
	- 提取 `exporter_version = version >> 16`。
2. **读取** 接下来的 4 个字节（32 位无符号整数）→ `headerSize`。
3. **读取** `headerSize` 个字节并解析为 MsgPack → `header_info`。
	- 检查 `header_info['compression']` 是否为 true。
	- 记录 `bodysize` 值。
4. **读取** 剩余字节 → `body_data`。
	- 如果启用了压缩，请使用 Zstandard 解压缩。
5. **将** 解压缩后的主体传递给 MsgPack 解析器。
6. **读取** 形状信息：
	- `mSmallestVisibleSize` (float)
	- `mSmallestVisibleDL` (int32)
	- `radius` (float)
	- `tubeRadius` (float)
	- `center` (3 个浮点数)
	- `bounds` (6 个浮点数)
7. **读取** 多个向量，顺序完全如上所述。
8. **读取** 名称数组：计数 (uint32)，后跟该数量的字符串。
9. **读取** 网格：总计数 (uint32)，然后是每个网格的数据。
	- 对于 SkinMesh 类型，使用额外的向量以不同方式处理父网格和子网格。
10. **读取** 序列：计数 (uint32)，然后是每个序列的数据。
11. **读取** 材质列表（如果存在）：计数 (uint32)，然后是每个材质的数据。

最后修改：2025年3月28日

---
glm-4.7翻译