### Description

Lua BeamNG extensions are an easy and scalable way to extend functionality. BeamNG extensions allow to mesh multiple pieces of code together, without needing to modify any official files (which would likely create issues after each official update, and would make your mod inadmissible in the [official BeamNG mod repository](https://www.beamng.com/resources)).

For example: you could write a mod that reacts when the slow-motion system is used by the player, without needing to edit the official slow-motion source files to insert explicit calls to your mod.

This is achieved using the “hook” functionality, where extensions can subscribe to various events, and can trigger events themselves too.

### Show me the code

A BeamNG Lua extension is essentially a Lua file that returns a table. For example:

```lua
local M = {}

  M.myData = 10

  M.myFunction = function() print("hello world") end

  return M
```

Once your mod is packed into a zip file, the extension files should land somewhere in:

```lua
(someMod.zip) /lua/common/extensions/
  (someMod.zip) /lua/ge/extensions/
  (someMod.zip) /lua/vehicle/extensions/
```

Your choice will dictate in which [Lua virtual machine](https://documentation.beamng.com/modding/programming/virtualmachines/) the BeamNG extension can be used. See [source code location](https://documentation.beamng.com/modding/programming/virtualmachines/#source-code-location) for additional context.

### Using an extension

An extension you create won’t be loaded until you write explicit code for it to be loaded. For example:

```lua
extensions.load("myMod_myExtension")       -- this loads extensions/myMod/myExtension.lua
```

Once a BeamNG extension has been loaded, you can access its table:

```lua
myMod_myExtension.myFunction()

  myMod_myExtension.myData = 20
```

You can also run a function in all the extensions that are currently loaded in this Lua virtual machine:

```lua
extensions.hook("myCustomEvent")        -- this will call myMod_myExtension.myCustomEvent(), and it will myCustomEvent() in all other loaded extensions
```

When you no longer require an extension, you must unload it:

```lua
extensions.unload(...)
```

Keeping extensions loaded when they aren’t necessary will waste computer resources and lower the framerate, so avoid it.

Note 1: There’s a syntax in the form of `extensions.myMod_myExtension.foo()`. Avoid this syntax, because a) it will lower frame rates compared to `myMod_myExtension.foo()`, and… b) it automatically loads the extension if it was not loaded. As a general rule, you shouldn’t need to automatically load an extension, you should do it explicitly.

Note 2: Your extension may explicitly define which other extensions it depends on. This is done with:

```lua
M.dependencies = { "foo_bar", "baz_qux", ...}
```

This will tell the BeamNG extension system to load/unload these dependencies for you. It will also organize the hook function calls, so they follow the tree of dependencies in the appropriate order. In other words, a hook will run in the dependencies first, then in your own extension, and so on.

### Common extension functions/data

In addition to your own really specific “myFunction”, “myData” members, your table can contain more common members.

For example:

```lua
M.onExtensionLoaded = function() ... end   -- called when the extension is loaded

  M.onUpdate = function() ... end            -- called once per GFX frame

  M.onGuiUpdate = function() ... end         -- called once per UI frame

  M.state = { foo=1, bar=2, ... }            -- may be used to save+load extension state during a reload of the Lua virtual machine

  M.onSerialize = function() ... end         -- may be used to save+load extension state during a reload of the Lua virtual machine using a custom serializing function

  M.dependencies = { "core_camera", ... }    -- may be used to automatically load other extensions

  etc
```

There’s no centralized list with those special functions and variables; the source code IS the documentation(tm). For example, you may research the code inside lua/ge/main.lua, lua/common/extensions.lua, etc. See who’s calling extension hooks, or observe how other extensions have been written, etc.

##### Programming documentation feedback

*If you feel this **programming documentation** is too high level, too low level, is missing important topics, is erroneous anywhere, etc, please write a [post at this thread](https://www.beamng.com/threads/new-beamng-drive-documentation.77939/) and ping me personally by typing `@stenyak` so I will get notified.*

Last modified: January 24, 2025