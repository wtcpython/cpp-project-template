PROJECT := {{projectName}}
CXX := g++
CXXFLAGS := -std=c++{{cppVersion}} -O2 -Wall
SRCS := src/main.cpp

all: $(PROJECT)

$(PROJECT): $(SRCS)
	$(CXX) $(CXXFLAGS) -o $(PROJECT) $(SRCS)

clean:
	rm -f $(PROJECT)
