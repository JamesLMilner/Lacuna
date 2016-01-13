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
Creative Commons Attribution- NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

Copyright James Milner 2015
