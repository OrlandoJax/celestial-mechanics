//------------------------------------------------------------------------------------------
//
// Name: CelestialMechanics.js
// Author: Rupert Brown
// Date: 1 june 2020
// Desription: Javascript to create three animations to represent the movement of a satellite
// travelling around a planet. The animations are:
// 1: the satellite is captured by the planet's gravity and falls into the planet (spiral canvas),
// 2: the satellite is captured by the planet's gravity but is travelling too fast and is flies
//    away from the planet having picked up speed from the encounter (parabola canvas),
// 3: the satellite is at the right height and speed to remain in a stable orbit around the planet
//    (orbit canvas).
// This javascript assumes an html page that contains three canvas elements. Each canvas displays
// one of the animations. All the animation calculations and drawing are done within the context
// of one animation frame. It didn't seem possible to run separate animation frames (more than one)
// for one html page.
//
//------------------------------------------------------------------------------------------
//
// Identify the three canvas and create their context.

const planetSpiral = document.querySelector('.spiralCanvas');
const psctx = planetSpiral.getContext('2d');

const planetParabola = document.querySelector('.parabolaCanvas');
const ppctx = planetParabola.getContext('2d');

const planetOrbit = document.querySelector('.orbitCanvas');
const poctx = planetOrbit.getContext('2d');

// Give each canvas a height and width in pixels.

const pswidth = planetSpiral.width = 400;
const psheight = planetSpiral.height = 400;
const ppwidth = planetParabola.width = 400;
const ppheight = planetParabola.height = 400;
const powidth = planetOrbit.width = 400;
const poheight = planetOrbit.height = 400;

//------------------------------------------------------------------------------------------
// Make all the declarations for the spiral canvas.

let sPlanetSize = 20;        // Radius (pixels) of the spiral canvas planet.
let sSatelliteSize = 6;      // Radius (pixels) of the spiral canvas satellite.
let SpiralX = 0;             // x coordinate, top left hand corner, spiral canvas satellite.
let SpiralY = 0;             // y coordinate, top left hand corner, spiral canvas satellite.
let SpiralRadius = 150;      // Initial radius (pixels) from the planet of the satellites spiral path.
const SpiralFactor = 0.998;  // A "fudge factor" used to reduce the radius each animation frame.
let SpiralAngle = Math.PI;   // The initial starting angle of the spiral.
let OrbitTime = 10;          // Number of seconds to complete an orbit - principally for the orbit canvas.
let RefreshRate = 60;        // Assumed canvas refresh rate - used by all the animations.

// The initial value by which the spiral angle increases each animation frame.
let SpiralAngleIncrement = (2 * Math.PI)/(OrbitTime * RefreshRate * 2);

// A factor to increase the value of SpiralAngleIncrement to make the satellite speed up the
// closer it gets to the planet.
const SpiralAcceleration = 1.003;

//------------------------------------------------------------------------------------------
// Make all the declarations for the parabola canvas.

let pPlanetSize = 20;      // Radius (pixels) of the parabola canvas planet.
let pSatelliteSize = 6;    // Radius (pixels) of the parabola canvas satellite.

// The parabola is based on the simple equation x2 = 4ay.
// So we have x and y values that get translated into X and Y coordinates
// for drawing on the screen.
const xMin = -10;
const xMax = 10;
let x = xMin;
let y = 10;
let a = 1.5;
let ParabX = -200;         // x coordinate, top left hand corner, parabola canvas satellite.
let ParabY = -200;         // y coordinate, top left hand corner, parabola canvas satellite.
let ParabTime = 10;        // Number of seconds to complete the parabola.

// The initial value by which the value of x increases each animation frame.
let FramexIncrement = (xMax - xMin)/(ParabTime * RefreshRate * 40);

// A factor to increase the value of FramexIncrement to make the satellite speed up.
// Based on the idea that it will be going 50% faster after ParabTime * RefreshRate increments.
const accelerationFactor = 1.01;

//------------------------------------------------------------------------------------------
// Make all the declarations for the orbit canvas.

let oPlanetSize = 20;
let oSatelliteSize = 6;
let OrbitX = 0;
let OrbitY = 0;
let OrbitAngle = 0;
let OrbitRadius = 150;
let FrameAngleIncrement = (2 * Math.PI)/(OrbitTime * RefreshRate);

//------------------------------------------------------------------------------------------
// Using the same background image for all three canvas.

let image = new Image();
image.src = 'StarBackv01.jpg' // An image containing a star field for background.

//------------------------------------------------------------------------------------------
// Establish three variables to hold fill gradients to make the planets look a bit more interesting.

var sGradient;
var pGradient;
var oGradient;

//------------------------------------------------------------------------------------------
// A very simple class used to create and define the planets and satellites.

class CelestialBody {
    constructor(x, y, color, size) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
    }
}
 
//------------------------------------------------------------------------------------------
// The function that draws the body onto the correct canvas (context) with the specified colour.
// void context.arc(x, y, radius, startAngle, endAngle [, anticlockwise]);
// The arc() method creates a circular arc centered at (x, y) with a radius of radius.
// The path starts at startAngle, ends at endAngle, and travels in the direction given by
// anticlockwise (defaulting to clockwise).

function draw(context, body, colour) {
    context.beginPath();
    context.fillStyle = colour;
    context.arc(body.x, body.y, body.size, 0, 2 * Math.PI);
    context.fill();
}

//------------------------------------------------------------------------------------------
// Do some set up work for the three canvas.

function setUpCanvas () {

    // Move the 0, 0 coordinate to the middle of the three canvas. This helps with the
    // geometry.
    psctx.translate(pswidth/2, psheight/2);
    ppctx.translate(ppwidth/2, ppheight/2);
    poctx.translate(powidth/2, poheight/2);

    // Create the planets and satellites. Create the planet colour gradients at the same time.
    // Colour gradients are closely tied to the physical X Y coordinate of the object.
 
    // Spiral canvas planet.
    sPlanet = new CelestialBody(
       6-sPlanetSize/2,
       6-sPlanetSize/2, 
       'rgb(0,0,255)',
       sPlanetSize)
    // Spiral canvas planet colour gradient.
    sGradient = psctx.createRadialGradient((6-sPlanetSize/2) + 2,(6-sPlanetSize/2) + 2,2, (6-sPlanetSize/2) + 5,(6-sPlanetSize/2) + 7,20);
    sGradient.addColorStop(0, 'rgb(200,255,255');
    sGradient.addColorStop(.5, 'rgb(100,255,255');
    sGradient.addColorStop(1, 'rgb(0,100,255');
    // Spiral canvas satellite.
    sSatellite = new CelestialBody(
       -sSatelliteSize/2,
       -sSatelliteSize/2, 
       'rgb(255,0,0)',
       sSatelliteSize)

    // Parabola canvas planet.
    pPlanet = new CelestialBody(
       -pPlanetSize/2,
       ((-pPlanetSize/2) + 50), 
       'rgb(0,0,255)',
       pPlanetSize)
    // Parabola canvas planet colour gradient.
    pGradient = psctx.createRadialGradient((-sPlanetSize/2) + 2,(-sPlanetSize/2) + 52,2, (-sPlanetSize/2) - 4,(-sPlanetSize/2) + 53,20);
    pGradient.addColorStop(0, 'rgb(200,255,255');
    pGradient.addColorStop(.5, 'rgb(100,255,255');
    pGradient.addColorStop(1, 'rgb(0,100,255');
    // Parabola canvas satellite.
    pSatellite = new CelestialBody(
       -pSatelliteSize/2,
       -pSatelliteSize/2, 
       'rgb(255,0,0)',
       pSatelliteSize)
 
    // Orbit canvas planet.
    oPlanet = new CelestialBody(
        -oPlanetSize/2,
        -oPlanetSize/2, 
        'rgb(0,0,255)',
        oPlanetSize)
    // Orbit canvas planet colour gradient.
    oGradient = psctx.createRadialGradient((-sPlanetSize/2) + 2,(-sPlanetSize/2) + 2,2, (-sPlanetSize/2) - 0,(-sPlanetSize/2) -0,20);
    oGradient.addColorStop(0, 'rgb(200,255,255');
    oGradient.addColorStop(.5, 'rgb(100,255,255');
    oGradient.addColorStop(1, 'rgb(0,100,255');    
    // Orbit canvas satellite.
    oSatellite = new CelestialBody(
        -oSatelliteSize/2,
        -oSatelliteSize/2, 
        'rgb(255,0,0)',
        oSatelliteSize)

    // Get the background image and make sure it has loaded before drawing it on all three canvas.
    image.onload = function() {
        psctx.drawImage(image, -200, -200);
        ppctx.drawImage(image, -200, -200);   // Get the background image and make sure it has loaded before drawing it.
        poctx.drawImage(image, -200, -200);
    }
}

//------------------------------------------------------------------------------------------
// Determine the X Y coordinates of the satellite for the spiral canvas.

function spiralCanvasCalculations() {

    // Calculate the X and Y coordinates based on the current spiral angle and radius.
    SpiralX = Math.sin(SpiralAngle) * SpiralRadius;
    SpiralY = Math.cos(SpiralAngle) * SpiralRadius;

    // Calculate a new spiral increment. The SpiralAcceleration makes each increment slightly
    // bigger than the last.
    SpiralAngleIncrement = SpiralAngleIncrement * SpiralAcceleration;
 
    // Reset the spiral angle when we go through 360 degrees (2 * PI).
    SpiralAngle = SpiralAngle + SpiralAngleIncrement;
    if(SpiralAngle > (2 * Math.PI)) {
       SpiralAngle = 0;
    }
    
    // Calculate a new spiral radius. The SpiralFactor makes the radius a bit smaller
    // each animation frame.
    SpiralRadius = SpiralRadius * SpiralFactor;

    // Once the satellite has reached the surface of the planet, reset the parameters
    // to allow the spiral to start again.
    if(SpiralRadius < (sPlanetSize + sSatelliteSize)) {
        SpiralAngle = Math.PI;
        SpiralRadius = OrbitRadius;
        SpiralAngleIncrement = (2 * Math.PI)/(OrbitTime * RefreshRate * 2);
    }

    // Finally set the new X and Y coordinates for the spiral canvas satellite.
    sSatellite.x = SpiralX - (sSatelliteSize/2);
    sSatellite.y = SpiralY - (sSatelliteSize/2);
}

//------------------------------------------------------------------------------------------
// Determine the X Y coordinates of the satellite for the parabola canvas.

function parabolaCanvasCalculations() {

    // Based on increments to the value of x, calculate the value of y using the parabola calculation:
    y = (x * x)/(4 * a);
    // Use a factor to translate x into a pixel value X.
    ParabX = x * 20;
    // Use another "fudge factor" to translate y into a pixel value Y - just to position things
    // within the context of the 400 by 400 pixel canvas.
    ParabY = (-((y * 20) - 300)) - 170;

    // The accelerationFactor makes the FramexIncrement larger over time thus speeding up
    // the satellite.
    FramexIncrement = FramexIncrement * accelerationFactor;
    // Increment the x value to achieve the animation movement.
    x = x + FramexIncrement;
    // Once x reaches a maximum value, reset it to start the animation again.
    if (x > xMax){
        x = xMin;
        FramexIncrement = (xMax - xMin)/(ParabTime * RefreshRate * 40);
    }

    // Finally set the new X and Y coordinates for the parabola canvas satellite.
    pSatellite.x = ParabX - (pSatelliteSize/2);
    pSatellite.y = ParabY - (pSatelliteSize/2);
}

//------------------------------------------------------------------------------------------
// Determine the X Y coordinates of the satellite for the orbit canvas.

function orbitCanvasCalculations() {

    // Calculate the X and Y coordinates based on the orbit angle and radius.
    OrbitX = Math.sin(OrbitAngle) * OrbitRadius;
    OrbitY = Math.cos(OrbitAngle) * OrbitRadius;

    // Reset the orbit angle when we go through 360 degrees (2 * PI).
    OrbitAngle = OrbitAngle + FrameAngleIncrement;
    if(OrbitAngle > (2 * Math.PI)) {
        OrbitAngle = 0;
    }

    // Finally set the new X and Y coordinates for the orbit canvas satellite.
    oSatellite.x = OrbitX - (oSatelliteSize/2);
    oSatellite.y = OrbitY - (oSatelliteSize/2);
}

//------------------------------------------------------------------------------------------
// Enter the main animation loop.

function loop() {

//------------------------------------------------------------------------------------------
   // Spiral calculations and drawing.

   spiralCanvasCalculations();

   // Here we save the state of the context and then restore it.
   // In between we change the global alpha value - this makes the background
   // image a bit transparent. It creates the satellite "tail" effect when it's
   // drawn on the canvas. The lower the number the more transparent, the bigger
   // the tail effect.
   psctx.save();
   psctx.globalAlpha = 0.25;
   psctx.drawImage(image, -200, -200);
   psctx.restore();
 
   draw(psctx, sPlanet, sGradient);
   draw(psctx, sSatellite, 'rgb(255,0,0)');

   //------------------------------------------------------------------------------------------
   // Parabola calculations and drawing.

   parabolaCanvasCalculations();

   ppctx.save();
   ppctx.globalAlpha = 0.25;
   ppctx.drawImage(image, -200, -200);
   ppctx.restore();
 
   draw(ppctx, pPlanet, pGradient);
   draw(ppctx, pSatellite, 'rgb(255,0,0)');

   //------------------------------------------------------------------------------------------
   // Orbit calculations and drawing.

   orbitCanvasCalculations();

   poctx.save();
   poctx.globalAlpha = 0.25;
   poctx.drawImage(image, -200, -200);
   poctx.restore();
 
   draw(poctx, oPlanet, oGradient);
   draw(poctx, oSatellite, 'rgb(255,0,0)');

   //------------------------------------------------------------------------------------------

   requestAnimationFrame(loop);
}

setUpCanvas();
loop();