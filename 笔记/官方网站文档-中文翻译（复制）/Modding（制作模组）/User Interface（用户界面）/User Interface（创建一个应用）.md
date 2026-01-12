### 简介

BeamNG.drive 的用户界面和应用（apps）使用 `AngularJS (1.5.8)` 框架编写。

对该框架有一定了解会有所帮助，但并非必需。在此上下文中，应用本质上只是 `beamng.apps` 模块中的简单指令（directive）。

每个应用有 3 个重要组成部分：

1. 一个 `app.js` 文件，包含应用使用的所有代码
2. 一个 `app.json` 文件，包含应用的相关信息
3. 一个 `app.png` 图像文件，用于在应用选择器中显示

#### app.js 文件

一个 BeamNG 应用指令通常遵循如下结构：

```
angular.module('beamng.apps')
.directive('myApp', ['StreamsManager', function (StreamsManager) {
  return {
    template:  '[一些 HTML 内容]',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      // 应用中将要使用的流（streams）的可选列表
      var streamsList = [/* 此处填写 streams */];

      // 使所需的 streams 可用
      StreamsManager.add(streamsList);

      // 确保在关闭应用后进行清理
      scope.$on('$destroy', function () {
        StreamsManager.remove(streamsList);
      });

      scope.$on('streamsUpdate', function (event, streams) {
        /* 一些使用 streams 数值的代码 */
      });
    }
  };
}]);
```

上面的示例是一个使用车辆 streams 的应用（这也是最常见的情况）。然而，这并非唯一用途，应用几乎可以用于任何事情。再次强调，代码必须包含在 `app.js` 文件的 `link` 函数中，例如：

```
angular.module('beamng.apps')
.directive('myApp', ['StreamsManager', function (StreamsManager) {
  return {
    template:  '<button ng-click="hello()">点击我</button>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      scope.hello = function () {
        // 在这里执行一些操作
      };
    }
  };
}])
```

有时，应用需要存储一些数据。在这种情况下，可以在应用文件夹中添加一个额外的 `settings.json` 文件来保存这些数据。要使用它，指令需要进行一些小的修改，如下例所示：

```
angular.module('beamng.apps')
.directive('myApp', ['StreamsManager', function (StreamsManager) {
  return {
    template:  '[一些 HTML 内容]',
    replace: true,
    restrict: 'EA',
    // [1] 我们“require” bngApp 父控制器
    require: '^bngApp',
    // [2] 控制器作为 link 函数的第 4 个参数提供
    link: function (scope, element, attrs, ctrl) {
      var streamsList = ['sensors'];

      StreamsManager.add(streamsList);

      // [3] 使用一个变量来保存设置
      var appSettings = null;

      // 当 DOM 就绪并且控制器已设置完成时，获取已存储的设置
      element.ready(function () {
        // [4] 调用控制器的 getSettings() 函数
        ctrl.getSettings()
          .then(function (settings) {
            appSettings = settings;
          })
      });

      scope.$on('$destroy', function () {
        StreamsManager.remove(streamsList);
        // [5] 可选：在结束时保存（可能已修改的）应用设置
        ctrl.saveSettings(appSettings);
      });

      scope.$on('streamsUpdate', function (event, streams) {
        /* 一些使用 streams 数值的代码 */
      });
    }
  };
}])
```

#### app.json 文件

该文件非常简单，仅用于保存与应用相关的信息，方便加载应用。不过，必须非常小心字段名称，因为拼写错误或缺失字段可能会影响应用的正常执行。文件内容的形式如下：

```
{
  "name" : "My App",
  "author": "Me",
  "version": "0.1",
  "description": "只是一个教程应用",
  "directive": "myApp",
  "domElement": "<my-app></my-app>",
  "css": { "width": "150px", "height": "150px", "top": "200px", "left": "200px" },
  "preserveAspectRatio": true
}
```

必需字段如下：

|       字段        |                                                       说明                                                       |
| :-------------: | :------------------------------------------------------------------------------------------------------------: |
|    **name**     |                                                    应用的显示名称                                                     |
|   **author**    |                                                     应用的作者                                                      |
|   **version**   |                                                     应用的版本号                                                     |
| **description** |                                                    应用的简要描述                                                     |
|  **directive**  |                                            指令的名称（与 app.js 文件中的名称相同）                                            |
| **domElement**  | 实际承载应用的 DOM 元素。`domElement` 由指令名称决定，本质上是从 *camelCase* 转换为 *lisp-case*，因此在本例中是从 `myApp` 转换为 `<my-app></my-app>` |
|     **css**     |                 应用首次启动时使用的默认 CSS 属性，包括宽度、高度，以及 top/bottom、left/right 属性，这些属性还决定了应用将对齐到屏幕的哪个角落                  |

#### app.png 文件

该文件是在应用选择视图中显示的图像。推荐尺寸为 **250x120** 像素。

### 使用你的应用

为了让你的应用在游戏中可见，请将包含应用文件的文件夹移动到用户目录的 UI 目录中（`<Userfolder>\ui\modules\apps`）。

之后，该应用将出现在选择列表中。你可能需要关闭并重新打开一次列表。

最后修改时间：2025 年 8 月 25 日

---
gpt-5.2翻译