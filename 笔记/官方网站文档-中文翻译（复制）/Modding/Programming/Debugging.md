There are several ways to debug the code you are writing.

### Debugging Lua code via Console:

Similar to most languages, this is the most basic way you can debug: a) add a print to console, b) reload your code c) observe the results in console.

#### a) Add a log

To print to console, you can use:

- `log("E", "context", "My message: "..dumps(myContext))`: this will generate a log message with a severity level of Error (use `E` for error, `W` for warning or `I` for info).
	- *Note: you can leave an empty context if that’s not useful for your purposes, e.g. `log("I", "", "My message")`*
- `dump("My message", myContext)`: this generates a log with the highest severity level. It converts all passed object to string with calls to `dumps()`.
- `print("My message: "..dumps(myContext))`: this will generate a log message with the highest severity level

Note: as a general rule, all log messages you intend to publish with your mod should have at least one variable to provide appropriate context. If there is no variable, and the log is simply a hardcoded string, there’s a high chance the log alone won’t be useful enough when you need to solve issues in the future.

### b) Reload your code

To reload the Lua VM, see [virtual machines reloading](https://documentation.beamng.com/modding/programming/virtualmachines/#reloading).

In some rare cases you may need to completely shut down the program and launch it again from scratch. This can happen if you’ve previously tried buggy code that has left the entire reloading system in a failing, unrecoverable state. Our reloading system tries as best as it can to survive possible programming errors - but it can only do so much.

### c) Check the console

To open the Console press the ~ (*tilde*) key on keyboards with US layout.

*Note: For different keyboard layouts, verify which key is assigned to the **Toggle System Console** action in the **Options > Controls > Bindings** menu, under the **General Debug** section*

### Debugging Lua code using a debugger:

(TODO)

Last modified: October 4, 2024