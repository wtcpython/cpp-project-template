cmake_minimum_required(VERSION 3.30)

# https://cmake.org/cmake/help/latest/manual/cmake-cxxmodules.7.html#generator-support
if(NOT (CMAKE_GENERATOR STREQUAL "Ninja"
        OR CMAKE_GENERATOR STREQUAL "Ninja Multi-Config"
        OR CMAKE_GENERATOR STREQUAL "Visual Studio 17 2022"
        OR CMAKE_GENERATOR STREQUAL "Visual Studio 18 2026"))
    message(FATAL_ERROR "Unsupported CMake generator: ${CMAKE_GENERATOR}\n"
        "Supported generators for C++ modules are:\n"
        "  Ninja\n"
        "  Ninja Multi-Config\n"
        "  Visual Studio 17 2022\n"
        "  Visual Studio 18 2026")
endif()

# Set experimental flag to enable `import std` support from CMake.
# This must be enabled before C++ language support.
if(CMAKE_VERSION VERSION_GREATER_EQUAL "4.0.3")
    # v4.0.3, v4.0.4, v4.0.5, v4.0.6, v4.1.x, v4.2.x
    set(CMAKE_EXPERIMENTAL_CXX_IMPORT_STD "d0edc3af-4c50-42ea-a356-e2862fe7a444")

elseif(CMAKE_VERSION VERSION_GREATER_EQUAL "4.0.0")
    # v4.0.0, v4.0.1, v4.0.2
    set(CMAKE_EXPERIMENTAL_CXX_IMPORT_STD "a9e1cf81-9932-4810-974b-6eccaf14e457")

elseif(CMAKE_VERSION VERSION_GREATER_EQUAL "3.30.0")
    # v3.30.x, v3.31.x
    set(CMAKE_EXPERIMENTAL_CXX_IMPORT_STD "0e5b6991-d74f-4b3d-a41c-cf096e0b2508")

endif()

project({{projectName}} VERSION 1.0 LANGUAGES CXX)

# Tell CMake that we explicitly want `import std`. This will initialize the
# property on all targets declared after this to 1
set(CMAKE_CXX_MODULE_STD 1)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(CMAKE_CXX_STANDARD {{cppVersion}})
set(CMAKE_CXX_STANDARD_REQUIRED True)

add_executable(${PROJECT_NAME} src/main.cxx)
