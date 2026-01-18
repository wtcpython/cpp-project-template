cmake_minimum_required(VERSION 3.20)
project({{projectName}} VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(SDL2 CONFIG REQUIRED)

add_executable({{projectName}} src/main.cpp)

target_link_libraries({{projectName}} PRIVATE SDL2::SDL2 SDL2::SDL2main)