#include <iostream>
#include <cuda_runtime.h>

__global__ void helloCUDA() {
    printf("Hello from CUDA kernel!\n");
}

int main() {
    helloCUDA<<<1, 1>>>();
    cudaDeviceSynchronize();
    std::cout << "Hello from Host!" << std::endl;
    return 0;
}

