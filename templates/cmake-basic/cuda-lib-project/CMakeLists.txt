cmake_minimum_required(VERSION 3.20)
project({{projectName}} VERSION 1.0 LANGUAGES CUDA CXX)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(CMAKE_CUDA_STANDARD {{cudaVersion}})
set(CMAKE_CUDA_STANDARD_REQUIRED True)

add_library(${PROJECT_NAME} src/lib.cu)