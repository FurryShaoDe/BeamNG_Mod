External hardware and software can be integrated with BeamNG.drive and BeamNG.tech, by listening for UDP packets containing the desired data.

There’s several UDP protocols available, and if you are a hardware or software manufacturer, you can implement your own protocol with relative ease (see Other Protocols section below).

These protocols can be enabled and configured in Options > Other > Protocols > OutGauge UDP protocol.

## OutGauge UDP protocol

This protocol shares very basic information about the vehicle, such as speed, pedals, some dashboard lights, etc.

It uses the same format used by Live For Speed, which means that most digital displays and 3rd party software that works with OutGauge in LFS will also work in BeamNG.drive. Not all fields are implemented at the moment. The UDP packet has the following format:

```c
// Items marked as \`N/A\` are not implemented.

typedef struct xxx {

    unsigned       time;            // time in milliseconds (to check order) // N/A, hardcoded to 0

    char           car[4];          // Car name // N/A, fixed value of "beam"

    unsigned short flags;           // Info (see OG_x below)

    char           gear;            // Reverse:0, Neutral:1, First:2...

    char           plid;            // Unique ID of viewed player (0 = none) // N/A, hardcoded to 0

    float          speed;           // M/S

    float          rpm;             // RPM

    float          turbo;           // BAR

    float          engTemp;         // C

    float          fuel;            // 0 to 1

    float          oilPressure;     // BAR // N/A, hardcoded to 0

    float          oilTemp;         // C

    unsigned       dashLights;      // Dash lights available (see DL_x below)

    unsigned       showLights;      // Dash lights currently switched on

    float          throttle;        // 0 to 1

    float          brake;           // 0 to 1

    float          clutch;          // 0 to 1

    char           display1[16];    // Usually Fuel // N/A, hardcoded to ""

    char           display2[16];    // Usually Settings // N/A, hardcoded to ""

    int            id;              // optional - only if OutGauge ID is specified

} xxx;
```
```lua
-- OG_x - bits for flags

local OG_SHIFT =     1  -- key // N/A

local OG_CTRL  =     2  -- key // N/A

local OG_TURBO =  8192  -- show turbo gauge

local OG_KM    = 16384  -- if not set - user prefers MILES

local OG_BAR   = 32768  -- if not set - user prefers PSI

-- DL_x - bits for dashLights and showLights

local DL_SHIFT        = 2 ^ 0    -- shift light

local DL_FULLBEAM     = 2 ^ 1    -- full beam

local DL_HANDBRAKE    = 2 ^ 2    -- handbrake

local DL_PITSPEED     = 2 ^ 3    -- pit speed limiter // N/A

local DL_TC           = 2 ^ 4    -- tc active or switched off

local DL_SIGNAL_L     = 2 ^ 5    -- left turn signal

local DL_SIGNAL_R     = 2 ^ 6    -- right turn signal

local DL_SIGNAL_ANY   = 2 ^ 7    -- shared turn signal // N/A

local DL_OILWARN      = 2 ^ 8    -- oil pressure warning

local DL_BATTERY      = 2 ^ 9    -- battery warning

local DL_ABS          = 2 ^ 10   -- abs active or switched off

local DL_SPARE        = 2 ^ 11   -- N/A
```

## MotionSim UDP protocol

This is a simplistic protocol that could be used to guide motion platforms. Only the most basic information is shared - for more advanced uses, please check ‘Other Protocols’ below.

```c
typedef struct xxx  {

    char format[4]; // allows to verify if packet is the expected format, fixed value of "BNG1"

    float posX, posY, posZ; // world position of the vehicle

    float velX, velY, velZ; // velocity of the vehicle

    float accX, accY, accZ; // acceleration of the vehicle, gravity not included

    float upX,  upY,  upZ;  // vector components of a vector pointing "up" relative to the vehicle

    float rollPos, pitchPos, yawPos; // angle of roll, pitch and yaw of the vehicle

    float rollVel, pitchVel, yawVel; // angular velocities of roll, pitch and yaw of the vehicle

    float rollAcc, pitchAcc, yawAcc; // angular acceleration of roll, pitch and yaw of the vehicle

} xxx;
```

## Other protocols

### I’m an end-user and want to use other protocols

Please follow the product manual for your hardware / motion sim platform / digital dash / etc.

### I’m a manufacturer and want to implement my own protocol

**For programmers/manufacturers only**: if you need assistance to integrate your hardware or software with BeamNG, you can [reach us via email](https://documentation.beamng.com/modding/protocols/).

If you are a programmer from a hardware or software manufacturer, you may want to access more information than that offered by the default protocols described above.

- Before v0.32, you were forced to overwrite one of the official core files (such as overwriting `outgauge.lua`, or overwriting `motionSim.lua`).
- Starting in v0.32, this area has been revamped, and you can place your own additional files inside `lua/vehicle/protocols/`.

Below we describe the new protocols system introduced in v0.32:

#### Picking a unique protocol name

The first step is to decide a name for your protocol. Please pick a name that is likely going to be **unique** - the goal here is to avoid conflicts with other protocols. If your protocol has the same name as other protocols, then it can get overwritten by other protocols.

A safe recommendation is to pick a protocol name that includes the **author** of the protocol (could be a company, an organization, an individual person, etc), together with a distinctive **unique name** for the protocol itself.

For example: “ `MyCoolCompanyInc_ProtoDashboard` ”.

**Note**: BeamNG software **can run any amount of protocols simultaneously**.

So if you build a few products that require a different protocol each, that’s perfectly doable: you just need to pick a different protocol name for each, and this way the user won’t be overwriting the files of one protocol with another one.

#### Programming your protocol

During development of your protocol, you can follow these steps:

- 1 Open the [**User folder**](https://documentation.beamng.com/support/userfolder).
- 2 Inside the User folder, create a folder called `USER_FOLDER/mods/unpacked/my_protocol_name/lua/vehicle/protocols/` (replace `my_protocol_name` with the **unique name** you decided in the previous section).
- 3 Inside that folder, create a `.LUA` file for your custom protocol. For example, `USER_FOLDER/mods/unpacked/my_protocol_name/lua/vehicle/protocols/my_protocol_name.lua` (replace `my_protocol_name` with the **unique name** you decided in the previous section).
	- *You may want to use one of our official protocol files as reference - they are located in `PROGRAM_INSTALL_FOLDER/lua/vehicle/protocols/*.lua`, and are distributed under a permissive open source bCDDL license. You are free to copy-paste-modify our protocols and redistribute the result under bCDDL (or any compatible license).*
- 4 Your custom protocol will run by reloading the vehicle using Ctrl + R.
	- *You can test further changes by saving the `.LUA` file and pressing Ctrl + R again.*
- 5 When you reach a state you’re happy with and which you want to distribute:
	- Make sure you close all your code editors, any open file explorer windows, etc - to avoid files being locked by other processes.
	- Go to `ESC menu` > `Mods` > `Mods Manager` > my\_protocol\_name > `PACK`.
	- *This will compress your `mods/unpacked/my_protocol_name/` protocol folder, converting it into a ZIP file located in `mods/my_protocol_name.zip`.*

This resulting ZIP file can be distributed freely to end users (see section below).

In the future, when you need to start modifying the protocol for new features, bugfixes, etc:

- 1 Go to `ESC menu` > `Mods` > `Mods Manager` > my\_protocol\_name > `UNPACK`.
	- *This will extract your `mods/my_protocol_name.zip` ZIP file back into `/mods/unpacked/my_protocol_name/`*
- 2 You are now free to edit the lua code, test using Ctrl + R as usual, etc.

#### Protocol identification

Since multiple protocols can be running at the same time, very often using the exact same UDP port, you need to ensure your hardware/software is ignoring other protocols’ packets, and using only **your** own protocol packets.

There’s a number of ways to accomplish this, but a common one is using some sort of **unique marker**.

*For example, the MotionSim protocol contains 4 initial chars with a hardcoded value of `"BNG1"`. This means that any hardware/software that is compatible with MotionSim protocol can listen to all UDP packets, and discard those whose first 4 chars aren’t `"BNG1"`. For example, if they find `"18x7"` then that’s likely data from an unknown protocol, with a different format than what MotionSim clients can understand.*

For your own protocols, you can use whichever solution you prefer. For example, you could decide to use 10 chars instead of 4. Or you could decide to use 6 chars, followed by 4 integers corresponding to a semantic version number (to cross-check compatibility of packer format vs packet parser). Or you can use any custom solution you prefer.

The only goal here is to ensure your code can identify which UDP packets it’s compatible with; while preventing your UDP packets from being mistaken as packets from other protocol.

#### Distributing your protocol

To make things easier for end-users, we recommend you distribute your file directly as a mod file (using our special `.ZIP` file layout).

To learn how to create a ZIP file, please check `Programming your protocol` section above.

You can distribute this ZIP file to end-users in several ways:

- **Recommended**: [upload it to the official BeamNG mod repository](https://www.beamng.com/resources/add). Users can easily search your protocol in the built-in `Mods` menu, and install it with a single click. More information [here](https://www.beamng.com/threads/uploading-mods-to-the-repository.16555).
- Alternative: you may distribute the `.ZIP` file yourself (for example, using your own web server, or included together with your software package, etc):
	- If you want to automate the install, your software needs to locate the [**User folder**](https://documentation.beamng.com/support/userfolder), and copy the.ZIP file as-is inside `USER_FOLDER/mods/`. Do **not** extract the ZIP file, instead, simply copy the ZIP file into that folder. For example `USER_FOLDER/mods/my_protocol_name.zip`.
	- If you want the install to be performed manually by end-users, you will want to include the following link in your product manual: `https://go.beamng.com/installing-mods-manually`. The benefit of providing the link is: a) the link is guaranteed to continue working in the future, and b) if we change the ZIP install procedure in the future, that page will always contain the latest instructions.

Last modified: January 24, 2025