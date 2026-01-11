When programming mods for BeamNG, you’ll likely be using these languages:

- Lua: is the main programming language, and is typically used to calculate as much logic as possible. For example, gameplay logic, various vehicle behaviours, parts of the physics, etc.
- Javascript/Html: is used for displaying information in the User Interface. As a rule of thumb, we recommend it only for UI display purposes, leaving as much logic as possible to be calculated in Lua. The Lua side would then send the result of all calculations to the UI side, where Javascript/Html would merely display it. This typically helps make your code more robust.

## BeamNG Terminology

- [LUA Extensions](https://documentation.beamng.com/modding/programming/extensions/): this is BeamNG’s module system. It features serialization, events, etc.
- [Virtual Machines](https://documentation.beamng.com/modding/programming/virtualmachines/): BeamNG runs several independent Lua systems in parallel as well as multiple UI instances, which we call VMs.
- [Virtual Machines Queues](https://documentation.beamng.com/modding/programming/virtualmachines/#communication): BeamNG’s main system to communicate between virtual machines.
- [Virtual Machines Mailboxes](https://documentation.beamng.com/modding/programming/virtualmachines/#communication) \`: BeamNG’s secondary system to communicate between VLUA virtual machines.

## BeamNG Code Conventions

#### Style

- Folder naming example: **ge/someFolderHere/lowerCamelCase/**
- File naming example: **lowerCamelCase.lua**
- Indenting: **2 spaces (not tabs)**
- Trim trailing spaces **ON**
- Function and variable names, **camelCase**
- "Class" names, upper camel case (PascalCase), example: **MyCoolClass**

#### Source code location

Please check [source code location](https://documentation.beamng.com/modding/programming/virtualmachines/#source-code-location) for information about where your files should go.

## Lua language basics

While you should learn how to program and how to program Lua on your own, here’s the most absolute basics of the language:

#### Basic Terminology

- `Table`: The basic and only type of container used in Lua. Depending on how you use a table, the table will resemble an array (a list) or a dictionary (a map).
- `Array`: A Lua table that contains only integer keys from 1 to infinity. Can be counted correctly with `#tbl`
- `Dictionary` (`dict`): A lua table that contains all kinds of keys. Cannot be counted with `#tbl`.
- `Module`: The traditional Lua `module` is deprecated. Do not use it
- `Package`: the normal [Lua package](https://www.lua.org/manual/5.3/manual.html#6.3). Used, but please use Extensions if possible. See [*here*](http://lua-users.org/wiki/ModulesTutorial) and also [*here*](http://lua-users.org/wiki/TheEssenceOfLoadingCode).

#### Syntactic Sugar

For convenience, the Lua language sometimes offers different ways to identically behaving code. For example:

- `myTable.ident` is equivalent to `myTable['ident']`
- `myObject:name(args)` is syntactic sugar for `myObject.name(myObject, args)`
- `myFunction{fields}` is syntactic sugar for `myFunction({fields})`
- `myFunction'string'` (or `myFunction"string"` or `myFunction[[string]]`) is syntactic sugar for `myFunction('string')`
- `function t.a.b.c:foobar(params) body end` is syntactic sugar for `t.a.b.c.foobar = function(self, params) body end`

Last modified: April 8, 2024