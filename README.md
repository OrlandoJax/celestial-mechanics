# celestial-mechanics
Javascript code to create an animation of satellite paths around a planet.
Name: CelestialMechanics.js
Author: Rupert Brown
Date: 1 june 2020
Desription: Javascript to create three animations to represent the movement of a satellite
travelling around a planet. The animations are:
1: the satellite is captured by the planet's gravity and falls into the planet (spiral canvas),
2: the satellite is captured by the planet's gravity but is travelling too fast and is flies
   away from the planet having picked up speed from the encounter (parabola canvas),
3: the satellite is at the right height and speed to remain in a stable orbit around the planet
   (orbit canvas).
This javascript assumes an html page that contains three canvas elements. Each canvas displays
one of the animations. All the animation calculations and drawing are done within the context
of one animation frame. It didn't seem possible to run separate animation frames (more than one)
for one html page.
