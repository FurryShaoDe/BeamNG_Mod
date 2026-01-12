### Overview

An **Action** is each of the in-game activities that can take place after the player has manipulated a [Control](https://documentation.beamng.com/modding/input/introduction/#control).

E.g. steer left, change camera, toggle menu.

Actions are defined in one or more.json files.

It is possible to provide new extra actions through mods. Just remember that, if you don’t also provide some bindings, then the users of your mod will need to manually configure his controllers.

There are two basic kinds of actions: [Regular actions](https://documentation.beamng.com/modding/input/actions/#regular-actions) and [Vehicle-specific actions](https://documentation.beamng.com/modding/input/actions/#vehicle-specific-actions):

### Regular Actions

Regular actions are those that can take place regardless of which vehicle is currently used.

They can therefore be available for use even while in the main menu, before entering any level or spawning any vehicle.

BeamNG.drive comes with many predefined **regular actions**. These are defined in:

```
lua/ge/extensions/core/input/actions/*.json
```

Mods can bundle additional regular actions. To do so, they must provide one or more additional json files following this naming convention:

```
lua/ge/extensions/core/input/actions/*.json
```

For example:

```
lua/ge/extensions/core/input/actions/explosions_mod.json
lua/ge/extensions/core/input/actions/advanced_menus.json
```

Any actions defined there will be available to end-users in the `Options` → `Controls` menu, mixed in with the default actions provided by BeamNG.drive.

While it is possible to override the default `input_actions.json` file with a customized one, this means the mod author will need to constantly update his modified file each time a BeamNG.drive update comes out with new actions (or modified actions, or removed ones). It is therefore strongly advised against.

  

### Vehicle-specific Actions

Vehicle-specific actions are those that can only be triggered while driving an specific vehicle. If you switch to a different kind of vehicle, they’ll be replaced by the actions of the new vehicle.

Some of BeamNG.drive official vehicles come with a few predefined vehicle-specific actions. For example, the Small Cannon provides the ability to open fire with your controller. These vehicle-specific actions are defined in:

```
vehicles/vehicle_directory_name/input_actions.json
```

Similarly to [Regular actions](https://documentation.beamng.com/modding/input/actions/#regular-actions), mods can bundle additional vehicle-specific actions too. The mod-provided files must follow this naming convention:

```
vehicles/vehicle_directory_name/input_actions*.json
```

For example:

```
vehicles/hatch/input_actions_hydraulic_suspension.json
vehicles/pickup/input_actions_winch_cable.json
```

All of these actions will be typically found in the “Vehicle-specific” category of the `Options` → `Controls` menu.

Again, it is necessary to use unique file names for your vehicle-specific actions, to make sure your actions are not overridden by other mods using the same file names.

  

### Action-files Format

Action files mostly follow the [json format](https://en.wikipedia.org/wiki/JSON). They must start with `{` and end with `}`. Here’s a sample of how the overall structure has to look like:

```js
{

    "an_action"     : {"order":1,  "title":"Do Something", ...},

    "another_action": {"order":2,  "title":"Do Something Else", ...},

    "third_action"  : {"order":10, "title":"Do More Things", ...},

    //...

}
```

Each line has two parts:

- The first string on each line is the action name. E.g. `"an_action"`.
- The rest of the line contains the parameters of the action. E.g. `"order"`, `"title"`, `"ctx"`, and more.

Here’s more information about them:

#### Action names

**Action names must be unique, otherwise they may get overridden by other mods using the same action names. Specifically:**

- [Regular action](https://documentation.beamng.com/modding/input/actions/#regular-actions) names must be different from all other regular actions names.
- [Vehicle-specific](https://documentation.beamng.com/modding/input/actions/#vehicle-specific-actions) action names must be unique within the current vehicle.

The easiest way to ensure the action names are unique, is to use a unique prefix. For example:

#### Action Parameters

The parameters of an action controls what the action actually does and how it’s displayed in the menus. Here’s a table with all details:

[Vehicle-specific](https://documentation.beamng.com/modding/input/actions/#vehicle-specific-actions) actions have some particularities, which are also described below

  

Name

title

Mandatory

Yes

Type

string

Default Value

n/a

Name

desc

Mandatory

Yes

Type

string

Default Value

n/a

Description

Full description, may be displayed as tool-tip, should be about one sentence long.

Name

isBasic

Mandatory

No

Type

boolean

Default Value

true

Name

cat (regular actions)

Mandatory

Yes

Type

string

Default Value

n/a

Description

See [Action categories](https://documentation.beamng.com/modding/input/actions/#action-categories)

Name

cat (vehicle-specific actions)

Mandatory

No

Type

string

Default Value

“vehicle\_specific”

Description

See [Action categories](https://documentation.beamng.com/modding/input/actions/#action-categories)

Name

order

Mandatory

Yes

Type

number

Default Value

n/a

Name

isCentered

Mandatory

No

Type

boolean

Default Value

false

Description

If false, the action will produce values in the range 0 to 1 (for example, it can be used for a brake pedal or handbrake). If true, generated values will be in the range of -1 to +1 (for example, it can be used for the steering, or for changing the camera height up and down).

Name

actionMap (regular actions)

Mandatory

No

Type

string

Default Value

“Normal”

Description

Determines which [Action Map](https://documentation.beamng.com/modding/input/introduction/#action-map) the action will be assigned into. In order of priority, the most common action maps are:

- “Global” - will work even when the UI has focus (useful for very few actions, such as ALT+F4 binding)
- “Menu” - assigned automatically when “cat” (category) is “Menu”
- “Normal” - default map. This, and the action maps below. won’t get triggered if a Menu action is triggered with the same control
- “VehicleCommon” - actions that may apply to numerous kinds of vehicles. Assigned automatically IF this action context is “vlua”
- “VehicleSpecific” - actions that only apply to the currently active vehicle. Assigned automatically IF this is a vehicle-specific actions.json file

Custom names can be specified, and the corresponding action map will be automatically created. This can be useful for mods that want to quickly de/activate certain set of actions, etc.

Name

actionMap (vehicle-specific actions)

Mandatory

No

Type

string

Default Value

“VehicleSpecific”

Description

Determines which [Action Map](https://documentation.beamng.com/modding/input/introduction/#action-map) the action will be assigned into. In order of priority, the most common action maps are:

Name

ctx (regular actions)

Mandatory

Yes

Type

string

Default Value

n/a

Description

Defines how the code defined in onChange/onUp/onDown/onRelative will be executed:

- “ui” for user interface - javascript (async)
- “vlua” for active vehicle - lua (async)
- “bvlua” for all vehicles - lua (async)
- “elua” for game engine - lua (async)
- “tlua” for game engine - lua (sync)
- “ts” for game engine - torquescript (sync)

Name

ctx (vehicle-specific actions)

Mandatory

No

Type

string

Default Value

“vlua”

Description

See the description above

Name

- onChange
- onDown
- onUp
- onRelative

Mandatory

Yes

Type

string

Default Value

n/a

Description

Specifies which source code will be executed when the action is triggered. The code execution context is defined in the ctx parameter of the current action

At least one of them must be defined. They are triggered like this:

- onChange: runs when the controller position changes. Supports: keys/buttons and axes
- onDown: runs when a key/button is pressed down. Supports: keys/buttons
- onUp: runs when a key/button is lifted up. Supports: keys/buttons
- onRelative: runs when holding the right mouse button and moving the mouse (don’t use unless you know what you’re doing)

### Action Categories

The category of an action is a mandatory parameter with only cosmetic effects.

It will influence where the action may be displayed in various in-game menus (such as the `Options` → `Controls` hierarchy of actions).

To see a list of available categories, please refer to the following file:

```
lua/ge/extensions/core/input/categories.lua
```

Last modified: January 24, 2025