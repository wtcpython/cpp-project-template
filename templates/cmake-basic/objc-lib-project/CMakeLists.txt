cmake_minimum_required(VERSION 3.20)
project({{projectName}} VERSION 1.0 LANGUAGES OBJC)

if(NOT APPLE)
    message(FATAL_ERROR "This template requires macOS.")
endif()

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(CMAKE_OBJC_STANDARD {{objcVersion}})
set(CMAKE_OBJC_STANDARD_REQUIRED True)

add_library(${PROJECT_NAME} src/lib.m)
target_link_libraries(${PROJECT_NAME} "-framework Foundation")