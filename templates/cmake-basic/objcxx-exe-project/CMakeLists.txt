cmake_minimum_required(VERSION 3.20)
project({{projectName}} VERSION 1.0 LANGUAGES CXX OBJCXX)

if(NOT APPLE)
    message(FATAL_ERROR "This template requires macOS.")
endif()

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(CMAKE_CXX_STANDARD {{objcxxVersion}})
set(CMAKE_OBJCXX_STANDARD {{objcxxVersion}})
set(CMAKE_CXX_STANDARD_REQUIRED True)

add_executable(${PROJECT_NAME} src/main.mm)
target_link_libraries(${PROJECT_NAME} "-framework Foundation")