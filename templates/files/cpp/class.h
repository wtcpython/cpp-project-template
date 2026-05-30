#pragma once

{{#baseClass}}
#include "{{baseClass}}.h"
{{/baseClass}}

class {{name}}{{#baseClass}} : public {{baseClass}}{{/baseClass}} {
public:
    {{name}}();
    ~{{name}}();

private:

};
