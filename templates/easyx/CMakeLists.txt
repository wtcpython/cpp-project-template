cmake_minimum_required(VERSION 3.20)
project({{projectName}} VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

execute_process(
    COMMAND "C:/Program Files (x86)/Microsoft Visual Studio/Installer/vswhere.exe"
        -latest
        -products *
        -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64
        -property installationPath
    OUTPUT_VARIABLE VS_INSTALL_PATH
    OUTPUT_STRIP_TRAILING_WHITESPACE
)

set(EASYX_INCLUDE_DIR "${VS_INSTALL_PATH}/VC/Auxiliary/VS/include")
set(EASYX_LIB_DIR "${VS_INSTALL_PATH}/VC/Auxiliary/VS/lib/x64")

include_directories("${EASYX_INCLUDE_DIR}")
link_directories("${EASYX_LIB_DIR}")

add_executable(${PROJECT_NAME} src/main.cpp)
target_link_libraries(${PROJECT_NAME} PRIVATE easyxw)
