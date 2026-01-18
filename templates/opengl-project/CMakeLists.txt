cmake_minimum_required(VERSION 3.20)
project({{projectName}} VERSION 0.1.0 LANGUAGES C CXX)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(glfw3 CONFIG REQUIRED)
find_package(glad CONFIG REQUIRED)
find_package(glm CONFIG REQUIRED)

add_executable({{projectName}} src/main.cpp)

target_link_libraries({{projectName}} PRIVATE 
    glfw
    glad::glad
    glm::glm
)
