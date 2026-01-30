PROJECT := lib{{projectName}}.a
CC := gcc
CFLAGS := -std=c{{cVersion}} -O2 -Wall -fPIC
SRCS := src/lib.c
OBJS := $(SRCS:.c=.o)

all: $(PROJECT)

$(PROJECT): $(OBJS)
	ar rcs $(PROJECT) $(OBJS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(PROJECT) $(OBJS)
