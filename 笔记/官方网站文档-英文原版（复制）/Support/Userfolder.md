#### Basics

##### How to access the Userfolder

The easiest way to access the folder is through `BeamNG.drive Launcher` → `Manage User Folder` → `Open in Explorer`

##### How it works

BeamNG.drive’s folder structure is composed by two main folder:

- **Install Folder**: where the program is installed
- **User Folder**: where the user’s custom files are located

It normally contains:

|         **Files**          |                          Description                           |                                    Folder                                    |
| :------------------------: | :------------------------------------------------------------: | :--------------------------------------------------------------------------: |
|         **Cache**          | All files cached by the game, allows to speed up loading times |                                   `/temp`                                    |
|          **Mods**          |       Contains all mods, including repository downloads        |                                   `/mods`                                    |
|        **Replays**         |               Replays recorded and saved in-game               |                                  `/replays`                                  |
|      **Screenshots**       |                   Screenshots taken in-game                    |                                `/screenshots`                                |
|        **Settings**        |       All the user settings, including Controls settings       |                                 `/settings`                                  |
| **Vehicle Configurations** |              The user-made vehicle configuration               |                                `/vehicles/..`                                |
|      **World Editor**      |               Anything saved in the World Editor               | `/levels/..` for level related saves and `/flowEditor` for *Flowgraph* saves |


This separation allows for modifications without affecting the original installation, making it easier to return to the original state at any time.

---

##### Structure & Priority

The **User Folder** ’s structure mimics the one of the **Game Folder**. If a file exists in the same *relative* location in both folders, the one in the **User Folder** will be loaded over the original.

It is **NOT RECOMMENDED** to store your user folder in the same location as your install folder.

If you are using Steam, it may detect these unknown files and decide to remove them updates, during file verification process, or when you reinstall. This will cause you to lose all mods, settings, and custom content with no warning.

---

#### User Folder changes (> 0.22)

With game version **0.22.0.0**, there have been some important changes to the **User Folder**, including the new default location and the way it works.

##### Versioning & Data Migration

In versions prior to **0.22.0.0** the **User Folder** was shared across different versions of the program.

Reusing the same user folder for all program versions would introduce issue if the user has made any modifications. For example, if they have been using the easily-accessible World Editor. These modifications may create conflicts and break content if they are used as-is for a different version of the program.

To reduce the risk of such issues, the data inside the **User Folder** is versioned:

```
Userfolder/BeamNG.drive/0.22/<files>
```
  

When a new *program version* is detected, the **Game Launcher** takes care of migrating some files from the previous version to the new one.

Launcher message when a new version is detected

The data that is transferred automatically includes:

|     Folder     |                                 Description                                  |
| :------------: | :--------------------------------------------------------------------------: |
|    `/mods`     |              Contains all mods, including repository downloads               |
|   `/replays`   |                      Replays recorded and saved in-game                      |
| `/screenshots` |                          Screenshots taken in-game                           |
|  `/settings`   |                The user settings, including Controls settings                |
| `/trackEditor` |                         Track Builder related files                          |
|  `/vehicles`   | Only the user-made vehicle configuration (*.pc and corresponding.jpg files*) |

Other files from the previous version can be manually transferred, if needed.

---

##### Manual Data Migration

If for any reason, the **data migration** process was not successful, you can perform a **manual data migration** with the following steps:

1. Open the *old user folder location* (the old default path was `My Documents\BeamNG.Drive`)
2. Navigate to the *new location* through `Launcher → Manage User Folder → Open in Explorer` and **open the folder** corresponding to the current version of the program
3. Transfer the files from the *old folder* to the *new folder* (as needed)

Last modified: January 24, 2025