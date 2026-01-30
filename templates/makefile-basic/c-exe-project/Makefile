PROJECT := {{projectName}}
CC := gcc
CFLAGS := -std=c{{cVersion}} -O2 -Wall
SRCS := src/main.c

all: $(PROJECT)

$(PROJECT): $(SRCS)
	$(CC) $(CFLAGS) -o $(PROJECT) $(SRCS)

clean:
	rm -f $(PROJECT)
