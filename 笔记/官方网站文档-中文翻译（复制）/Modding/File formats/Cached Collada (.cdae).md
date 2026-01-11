## version 31 / 0x001F

This document describes the **v31** BeamNG *cached Collada* (`.cdae`) shape file format produced inside the BeamNG codebase. The data is serialized in [MessagePack](https://msgpack.org/) format, with possible [Zstandard](https://facebook.github.io/zstd/) compression. Use this information to build or debug your own tools for reading the file.

### Why Use a Binary Format for Speed and Efficiency

The `.cdae` file stores shape data in a binary format for several reasons:

1. **Reduced Size**: Binary data has less overhead than text-based formats, lowering disk space usage and download times.
2. **Faster Parsing**: Tools and the engine can more quickly read integers, floats, and other elements in binary form than by parsing them from text.
3. **Streamlined Workflow**: With binary, the data layout (e.g., floats, ints, vectors) maps more closely to memory structures, minimizing conversions.
4. **Consistent Representation**: Binary ensures there’s no ambiguity in formatting, making read/write operations more reliable.

This consistent and compact method ultimately boosts performance when loading shapes, especially at scale.

---

### Overview of the.cdae File Content (v31)

The v31 format introduces a more structured approach with a separate header and body, along with optional compression:

**Rough Pseudo-Code Table of the v31.cdae File Content**

| Step | Content | Notes |
| --- | --- | --- |
| 1 | *File header* (32-bit integer, version). | Check `version & 0xFF == 31` to verify it’s v31. |
| 2 | *Header size* (32-bit unsigned integer). | Size of the following header data in bytes. |
| 3 | *MsgPack header* (dictionary with metadata) | Contains info like compression flag, body size, etc. |
| 4 | *Body data* (possibly compressed) | If compressed, use Zstandard to decompress. Contains the shape data. |

The header is a MsgPack dictionary containing metadata about the file, including whether the body is compressed. The body contains the actual shape data, also in MsgPack format.

---

### Using cdae\_dump\_info.py

For an additional way to inspect or debug `.cdae` files, you can use the [cdae\_dump\_info.py](https://documentation.beamng.com/modding/file_formats/cdae/cdae_dump_info.py) script. For instance, run the following command in your console/terminal:

```
>python cdae_dump_info.py vehicles\pickup\pickup.cdae
```

### File Structure: Header and Body

At the **start** of the file, the format begins with:

1. **32-bit integer** `version`:
	```
	version = (smVersion | (mExporterVersion << 16))
	```
	where **`smVersion`** is set to `31` for this format and **`exporter_version`** is a separate 16-bit value in the upper bits.
	Readers should check `(version & 0xFF) == 31` to confirm it’s a *v31* shape.
2. **32-bit unsigned integer** `headerSize`: This indicates the size of the MsgPack header data that follows.
3. **MsgPack header**: A dictionary containing metadata about the file, such as:
	- `compression`: Boolean indicating if the body is compressed with Zstandard
	- `bodysize`: Size of the body data (in bytes)
	- Other potential metadata
4. **Body data**:
	- If `compression` is true, the body is compressed with Zstandard and needs to be decompressed
	- Once decompressed (if needed), the body contains the actual shape data in MsgPack format

---

### Overview of the MsgPack Body Data

After reading and (if necessary) decompressing the body data, you can parse the MsgPack objects in a specific order:

1. **Shape Information**:
	- `mSmallestVisibleSize` (float)
	- `mSmallestVisibleDL` (int32)
	- `radius` (float)
	- `tubeRadius` (float)
	- `center` (Point3F - 3 floats)
	- `bounds` (Box3F - 6 floats)
2. **Multiple Vectors (pack\_vector)**, each stored as:
	- A 32-bit signed integer for the vector length
	- A 32-bit signed integer for the element size in bytes
	- A raw binary block (MsgPack “bin”) of length `vector.size * elementSize`.
	The code reads these in order:
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
3. **Strings Array**
	- A `uint32` for the number of shape names.
	- Each name is a MsgPack string.
4. **Meshes**
	- A `uint32` “total meshes” count.
	- Each mesh contains:
		- `uint32 meshType`:
			- `0` → StandardMesh
			- `1` → SkinMesh
			- `2` → DecalMesh (deprecated)
			- `3` → SortedMesh
			- `4` → NullMesh
		- For non-null meshes:
			- `int32 numFrames`
			- `int32 numMatFrames`
			- `int32 parentMesh`
			- `Box3F mBounds` (6 floats)
			- `Point3F mCenter` (3 floats)
			- `float mRadius`
			Then additional `pack_vector` calls for:
			- `verts`
			- `tverts`
			- `tverts2`
			- `colors`
			- `norms`
			- `encodedNorms`
			- `primitives`
			- `indices`
			- `tangents`
			And finally:
			- `int32 vertsPerFrame`
			- `uint32 meshFlags`
		- **For SkinMesh types (type 1), additional data is read:**
			- First, determine if it’s a parent mesh (`parentMesh < 0`)
			- For parent meshes:
				- `skinMesh.initialVerts` vector
				- `skinMesh.initialNorms` vector
			- For all SkinMesh types:
				- `skinMesh.initialTransforms` vector
			- For parent meshes:
				- `skinMesh.vertexIndex` vector
				- `skinMesh.boneIndex` vector
				- `skinMesh.weight` vector
				- `skinMesh.nodeIndex` vector
5. **Sequences**
	- A `uint32 numSequences`.
	- For each sequence:
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
6. **Material List** (Optional)
	- A `uint32 materialCount`.
	- For each material:
		- `string name`
		- `uint32 flags`
		- `uint32 reflectanceMap`
		- `uint32 bumpMap`
		- `uint32 detailMap`
		- `float detailScale`
		- `float reflectionAmount`

This completes the data. Brief definitions:

- `Point3F`: 3 floats `[x, y, z]`.
- `Box3F`: min & max corners => 6 floats total.
- `TSIntegerSet`: specialized bitset for node/element flags.

---

### Reading Strategy (Pseudocode)

1. **Read** the first 4 bytes (32-bit integer) → `version`.
	- Check `version & 0xFF == 31`.
	- Extract `exporter_version = version >> 16`.
2. **Read** the next 4 bytes (32-bit unsigned integer) → `headerSize`.
3. **Read** `headerSize` bytes and parse as MsgPack → `header_info`.
	- Check if `header_info['compression']` is true.
	- Note the `bodysize` value.
4. **Read** the remaining bytes → `body_data`.
	- If compression is enabled, decompress with Zstandard.
5. **Pass** the decompressed body into a MsgPack parser.
6. **Read** shape information:
	- `mSmallestVisibleSize` (float)
	- `mSmallestVisibleDL` (int32)
	- `radius` (float)
	- `tubeRadius` (float)
	- `center` (3 floats)
	- `bounds` (6 floats)
7. **Read** multiple vectors in the exact order outlined above.
8. **Read** names array: count (uint32) followed by that many strings.
9. **Read** meshes: total count (uint32), then each mesh’s data.
	- For SkinMesh types, handle parent and child meshes differently with additional vectors.
10. **Read** sequences: count (uint32), then each sequence’s data.
11. **Read** materials list (if present): count (uint32), then each material’s data.

Last modified: March 28, 2025