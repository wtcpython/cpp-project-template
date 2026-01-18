cmake_minimum_required(VERSION 3.20)
project({{projectName}} VERSION 1.0 LANGUAGES CXX)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(CMAKE_CXX_STANDARD {{cppVersion}})
set(CMAKE_CXX_STANDARD_REQUIRED True)

add_executable(${PROJECT_NAME} src/main.cpp)
