cmake_minimum_required(VERSION 3.20)
project({{projectName}} VERSION 1.0 LANGUAGES C)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(CMAKE_C_STANDARD {{cVersion}})
set(CMAKE_C_STANDARD_REQUIRED True)

add_library(${PROJECT_NAME} src/lib.c)
