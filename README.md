PathJS
======

A Javascript library to create interpolated path that can be used to create animations,
HTML5 Canvas drawings, SVG polygons, etc.  Its not dependant on any library.  Instead,
it uses adapters to convert the paths into something that can be used with a library.

## Features

* Generate sets of interpolated points like lines, circles, ellipes, Bezier curves.
* Manipulate paths with transforms like rotations, translations, etc.
* Combine multiple paths together to make more complex paths
* Convert paths using adapters to other useful representations like the jQuery animate() step function,
  drawing on a canvas, creating a SVG polygon, etc.

## Usage

Just include path.js in your page.  

``` html
<script src='path.min.js'></script>
```

Then build a path using a generator, manipulate it, then use an adapter to do something useful with it:

``` javascript

   var path;
   
   // Create a sinusoidal wave along the x-axis
   path = PATH([
                 {fn: 'start', x: 10, y: 50},
                 {fn: 'wave', length: 400, amplitude: 40, frequency: 70, smooth: true}
               ]);

   // Rotate it 45 degrees
   path.rotate(45, 'middle'); 
   
   // This element is a Canvas.  animatePlot() will
   // draw the individual points in the path on the
   // canvas over a 5 second interval
   
   $('#sine')
      .animate({
           tabIndex: 0
         }, {
           duration: 5000,
           easing: 'linear',
           step: PATH.adapter.animatePlot(path)
         });
         
```

## Demo

See the [demo](http://bseth99.github.com/pathjs/index.html) pages.

## License

Copyright (c) 2012 Ben Olson
Licensed under the MIT License
