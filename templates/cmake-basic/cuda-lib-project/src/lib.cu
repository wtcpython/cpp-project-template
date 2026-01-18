#include <cuda_runtime.h>

__global__ void simpleKernel(float *d_out, float *d_in, int n) {
    int i = threadIdx.x + blockIdx.x * blockDim.x;
    if (i < n) {
        d_out[i] = d_in[i] * 2.0f;
    }
}

extern "C" void launchKernel(float *d_out, float *d_in, int n) {
    int threadsPerBlock = 256;
    int blocksPerGrid = (n + threadsPerBlock - 1) / threadsPerBlock;
    simpleKernel<<<blocksPerGrid, threadsPerBlock>>>(d_out, d_in, n);
}
