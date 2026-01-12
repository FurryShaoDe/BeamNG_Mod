Here’s an overall view of how bindings work in BeamNG.drive.

### Terminology

#### Controller

A hardware device plugged into your computer.

Also called “device” or “input device”.

E.g. keyboard, mouse, joystick, steering wheel, gamepad, android remote app.

#### Control

Each key, button or axis in a controller.

E.g. space bar key, left mouse button, horizontal stick axis, right pedal.

#### Event

An input event is how the game engine tracks each movement (or change in state) of a [Control](https://documentation.beamng.com/modding/input/introduction/#control).

#### Action

In-game activities that can take place after the player has manipulated a [Control](https://documentation.beamng.com/modding/input/introduction/#control).

E.g. steer left, change camera, toggle menu.

For detailed information, refer to [Actions](https://documentation.beamng.com/modding/input/actions).

#### Action Category

The user interface (e.g. Options > Controls menu) can sort actions into categories. This makes them easier to navigate by the user.

E.g. ‘vehicle’, ‘slowmotion’, ‘debug’, etc.

For detailed information, refer to [Action categories](https://documentation.beamng.com/modding/input/actions/#action-parameters).

#### Binding

Relation between actions and controls.

*(sometimes also called `input mapping` or `inputmap`)*

E.g. up arrow <-> accelerate, escape key <-> toggle menu, left pedal <-> engage clutch.

Each control can be bound to zero, one or more actions.

Bindings may or may not be active, depending on context.

E.g. menu bindings won’t be active if the menu is closed.

For detailed information, refer to [Bindings](https://documentation.beamng.com/modding/input/bindings).

#### Action Map

A set of [bindings](https://documentation.beamng.com/modding/input/bindings), which can be de/activated in group, and its priority changed at any time.

For detailed information, refer to [Action Maps](https://documentation.beamng.com/modding/input/action-maps).

#### InputMap

A file containing the bindings for a controller.

E.g. settings/inputmaps/keyboard.json, settings/inputmaps/mouse.diff

The default inputmaps use json extension. The user configuration use diff extension (they specify which bindings have changed and how: removals, additions, modifications, etc.

### Basic Workflow

The way bindings work is the following:

1. First, the user manipulates a [control](https://documentation.beamng.com/modding/input/introduction/#control) in their [controller](https://documentation.beamng.com/modding/input/introduction/#controller).
2. This generates an input [event](https://documentation.beamng.com/modding/input/introduction/#event).
3. The game starts traversing the active [actionmaps](https://documentation.beamng.com/modding/input/introduction/#action-map), looking for one or more bindings.
4. The actions associated to those bindings are executed.

Last modified: June 9, 2022