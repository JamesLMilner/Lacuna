## THIS REPO IS DEPRECATED

I wrote Lacuna as a project 2 years ago with my very limited knowledge of JavaScript and PHP. As such it is riddled with problems and bad programming and as such I have deprecated this project. I am currently working on Lacuna2 which will hopefully remedy some of those issues.

# Lacuna

Lacuna is a 3D Web GIS constructed using HTML5, CSS, JavaScript (three.js + jQuery) and a PostGIS backend. The project was part of a UCL masters dissertation.

![Lacuna Screenshot](http://www.loxodrome.io/lacuna/experimental/screenshot.png "Lacuna")

##Functionality

The project implements:
* Visualisation of geometries
* Attribute retrieval
* Measurement (length and surface area)
* 3D Buffering (sphere, cylinder, box)
* Object level editing (rotation, scaling, transformation, deletion, copying)
* Vertex level editing (manipulating individual vertices)

Alongside helper functionality:
* Wireframing
* Canvas colour changing
* Raycasting helper (shows surface hit and normal of the collision)
* Camera functions (zoom to location, max zoom, min zoom)

##Technologies
Clientside:
* three.js r70
* jQuery
* perfect-scrollbar

Serverside:
* PostgreSQL
* PostGIS

##Current Development Work
* UI improvements
* Code refactoring
* Performance

# License
The MIT License (MIT)

Copyright (c) 2015 James Milner

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
