# C++ Project Template

> Enhance C++ experience in Visual Studio Code

## Overview

A lightweight extension to provide additional C++ project features. It works with [C/C++](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools) and [CMake Tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cmake-tools) to provide the following features:

### Create C++ Projects

You can create CMake, Makefile, Win32 (Windows only), SDL, Meson, and Qt (requires [Qt Core](https://marketplace.visualstudio.com/items?itemName=TheQtCompany.qt-core)) projects.

![create project](https://raw.githubusercontent.com/wtcpython/cpp-project-template/main/images/create-project.png)

### Create CMake Projects

You can create C, C++, CUDA projects in `CMake Project`.

![create cmake project](https://raw.githubusercontent.com/wtcpython/cpp-project-template/main/images/create-cmake-project.png)

For C++23 and later, you may choose to enable the modern module feature, which uses `import std;` in place of `#include <iostream>`.

### Flexible choice of C/C++ language standards

You can select a suitable C/C++ language standard when creating a project.
The version you selected will be written in `CMakeLists.txt` or `meson.build`.

![cpp standard version](https://raw.githubusercontent.com/wtcpython/cpp-project-template/main/images/cpp-standard-version.png)

### Create C/C++ file

When you open a folder, you can create C/C++ specific files, like class, enum, interface, it will automatically generate some code in the file, like:

- If you select a class, it will create both `.h` and `.cpp` files, and the `.cpp` file will include `.h` file.
- If you select a header file, it will contain `#ifdef`, `#define` and `#endif`.

![create cpp file](https://raw.githubusercontent.com/wtcpython/cpp-project-template/main/images/create-cpp-file.png)

### vcpkg integrate

If you select `SDL` and `OpenGL`, it will use `vcpkg` to install third-party modules. This extension will check `VCPKG_ROOT`, `C:\vcpkg` (Windows) and `~/vcpkg` (MacOS and Linux). If not found, the extension will prompt you to install vcpkg.

### vcpkg.json file operation

The right-menu of `vcpkg.json` provides the following features:

![vcpkg file](https://raw.githubusercontent.com/wtcpython/cpp-project-template/main/images/vcpkg-file.png)

#### Integrate to CMake

It will integrate the vcpkg toolchain to cmake toolchain, by writing the configuration to the current workspace settings.

![integrate to cmake](https://raw.githubusercontent.com/wtcpython/cpp-project-template/main/images/integrate-to-cmake.png)

#### Add a Dependency

This extension will show a list of the current available vcpkg ports, you can search a port, and click to install, it will also ask if you want to add port to cmake file.

![add a dependency](https://raw.githubusercontent.com/wtcpython/cpp-project-template/main/images/add-a-dependency.gif)

## Requirements

- VS Code (version 1.75.0+)
- [C/C++](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools)
- [CMake Tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cmake-tools)
