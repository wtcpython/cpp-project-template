#include <conio.h>
#include <graphics.h>

int main() {
    initgraph(640, 480);
    setlinecolor(RGB(255, 0, 0));
    setfillcolor(RGB(0, 255, 0));
    fillcircle(200, 200, 100);
    _getch();
    closegraph();
    return 0;
}