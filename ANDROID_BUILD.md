# Android 打包说明

当前项目已经接入 Capacitor，并已生成 `android/` 原生工程。

## 已完成

- `package.json`：Capacitor / React / Babel 本地依赖
- `capacitor.config.json`：应用 ID `com.cunzai.accounting`
- `scripts/prepare-capacitor.mjs`：把静态网页整理到 `www/`
- `android/`：Capacitor Android 工程
- `www/vendor/`：React / ReactDOM / Babel 已本地化，APK 不再依赖 CDN
- Android SDK：安装在 `C:\Android`
- Android Studio：安装在 `C:\Program Files\Android\Android Studio`
- JDK 17：安装在 `C:\Java\jdk-17.0.19+10`
- JDK 21：安装在 `C:\Java\jdk-21.0.11+10`

## 为什么同时有 JDK 17 和 JDK 21

已按要求安装 JDK 17。当前 Capacitor 7 生成的 Android 工程使用 Java 21 编译配置，所以实际打包 APK 时需要使用 JDK 21。

## 本机已安装 SDK 包

- `platform-tools` 37.0.0
- `platforms;android-35`
- `build-tools;35.0.0`
- `build-tools;34.0.0`

## 打 Debug APK

```powershell
$env:JAVA_HOME="C:\Java\jdk-21.0.11+10"
$env:ANDROID_HOME="C:\Android"
$env:ANDROID_SDK_ROOT="C:\Android"
$env:Path="$env:JAVA_HOME\bin;C:\Android\cmdline-tools\latest\bin;C:\Android\platform-tools;$env:Path"

npm run cap:sync
cd android
.\gradlew.bat assembleDebug
```

Debug APK 输出位置：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## 打开 Android Studio

Android Studio 可执行文件：

```text
C:\Program Files\Android\Android Studio\bin\studio64.exe
```

打开后选择项目里的 `android/` 目录即可。

## 常用命令

```powershell
npm run prepare:app
npm run cap:sync
npm run android:open
npm run android:build
```
