PROJECT := lib{{projectName}}.a
CXX := g++
CXXFLAGS := -std=c++{{cppVersion}} -O2 -Wall -fPIC
SRCS := src/lib.cpp
OBJS := $(SRCS:.cpp=.o)

all: $(PROJECT)

$(PROJECT): $(OBJS)
	ar rcs $(PROJECT) $(OBJS)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -f $(PROJECT) $(OBJS)
