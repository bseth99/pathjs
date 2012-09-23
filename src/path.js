/*
Copyright (c) 2012 Ben Olson

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

;(function(undefined)
{

  var _RAD = Math.PI / 180;

  function __copy (a)
  {
     var n = [],
         i = 0,
         l = a.length;

     for(;i<l;i++)
        n.push({x: a[i].x, y: a[i].y});

     return n;
  }

  function __resolve (p, o)
  {
     var t, i,
         l = p.length;

     if (typeof o == 'string')
     {
        if (o.indexOf('%') > 0)
           t = p[Math.floor(parseInt(o, 10) / 100 * l)];
        else if (o == 'start')
           t = p[0];
        else if (o == 'middle')
           t = p[Math.floor(l/2)];
        else if (o == 'end')
           t = p[l-1];
     }
     else
     {
        t = p[o];
     }

     if (!t) t = p[0];

     return t;
  }

  var Path = function (points)
  {
     if (arguments.length)
        this.points = [].concat(points);
  };

  Path.prototype = {
     points: [],
     current: 0,
     box: null,

     append: function (p, align)
      {
         var align = align || false,
             p = (p && p.points) ? p : new Path(p),
             l, f;

         if (align)
         {
            l = this.last();
            f = p.first();
            p.move(l.x-f.x, l.y-f.y);
         }

         this.points = this.points.concat(__copy(p.points));

         this.box = null;

         return this;
      },

     appendTo: function (p, align)
      {
         p.append.call(p, this, align);

         return this;
      },

     prepend: function (p, align)
      {
         var align = align || false,
             p = (p && p.points) ? p : new Path(p),
             l, f;

         if (align)
         {
            l = this.first();
            f = p.last();
            p.move(l.x-f.x, l.y-f.y);
         }

         this.points = p.points.concat(__copy(this.points));

         this.box = null;

         return this;
      },

     prependTo: function (p, align)
      {
         p.prepend.call(p, this, align);

         return this;
      },

     reverse: function ()
      {
         this.points.reverse();

         return this;
      },

     move: function (tx, ty, o)
      {
         var len = this.points.length,
             i = 0,
             t,
             o = (o && o.x ? o : __resolve(this.points, o)) || {x: 0, y: 0};

         for (;i<len;i++)
         {
            t = {x: this.points[i].x - o.x, y: this.points[i].y - o.y};
            this.points[i].x = o.x + t.x + tx;
            this.points[i].y = o.y + t.y + ty;
         }

         this.box = null;

         return this;
      },

     scale: function (sx, sy, o)
      {
         var len = this.points.length,
             i = 0,
             t,
             o = (o && o.x ? o : __resolve(this.points, o)) || {x: 0, y: 0};

         for (;i<len;i++)
         {
            t = {x: this.points[i].x - o.x, y: this.points[i].y - o.y};
            this.points[i].x = o.x + t.x * sx;
            this.points[i].y = o.y + t.y * sy;
         }

         this.box = null;

         return this;
      },

     skew: function (rx, ry, o)
      {
         var len = this.points.length,
             i = 0,
             t,
             o = (o && o.x ? o : __resolve(this.points, o)) || {x: 0, y: 0},
             m =
              [
               [1                  , Math.tan(rx * _RAD)],
               [Math.tan(ry * _RAD), 1]
              ];

         for (;i<len;i++)
         {
            t = {x: this.points[i].x - o.x, y: this.points[i].y - o.y};
            this.points[i].x = o.x + t.x * m[0][0] + t.y * m[0][1];
            this.points[i].y = o.y + t.x * m[1][0] + t.y * m[1][1];
         }

         this.box = null;

         return this;
      },

     rotate: function (r, o)
      {
         var len = this.points.length,
             i = 0,
             t,
             o = (o && o.x ? o : __resolve(this.points, o)) || {x: 0, y: 0},
             m =
              [
               [Math.cos(r * _RAD), -Math.sin(r * _RAD)],
               [Math.sin(r * _RAD), Math.cos(r * _RAD)]
              ];

         for (;i<len;i++)
         {
            t = {x: this.points[i].x - o.x, y: this.points[i].y - o.y};
            this.points[i].x = o.x + t.x * m[0][0] + t.y * m[0][1];
            this.points[i].y = o.y + t.x * m[1][0] + t.y * m[1][1];
         }

         this.box = null;

         return this;
      },

     wrap: function (p)
      {
         var len = this.points.length,
             dw = this.width(),
             cc = p.center(),
             oo = p.first(),
             co = this.first(),
             co = {x: co.x, y: co.y},
             px, py, cx, cy, dy, dx, pt, r,
             i = 0;


         for (;i<len;i++)
         {
            cx = this.points[i].x - co.x;
            cy = this.points[i].y - co.y;

            pt = p.step(cx/dw);

            dx = pt.x - cc.x;
            dy = pt.y - cc.y;

            r = Math.sqrt(dx*dx+dy*dy);

            px = dx * cy / r;
            py = dy * cy / r;

            this.points[i].x = px + pt.x;
            this.points[i].y = py + pt.y;
         }

         this.box = null;

         return this;
      },

     getBoundingBox: function ()
      {
         var l = this.points.length,
             i = 0;

         if (!this.box)
         {
            this.box = {x1: 999999, y1: 999999, x2: -999999, y2: -999999};

            for (;i<l;i++)
            {
               this.box.x1 = Math.min(this.box.x1, this.points[i].x);
               this.box.y1 = Math.min(this.box.y1, this.points[i].y);
               this.box.x2 = Math.max(this.box.x2, this.points[i].x);
               this.box.y2 = Math.max(this.box.y2, this.points[i].y);
            }
         }

         return this.box;
      },

     height: function ()
      {
         this.getBoundingBox();

         return this.box.y2 - this.box.y1;
      },

     width: function ()
      {
         this.getBoundingBox();

         return this.box.x2 - this.box.x1;
      },

     top: function ()
      {
         this.getBoundingBox();

         return this.box.y1;
      },

     left: function ()
      {
         this.getBoundingBox();

         return this.box.x1;
      },

     center: function ()
      {
         this.getBoundingBox();

         return {x: (this.box.x1 + this.box.x2) / 2, y: (this.box.y1 + this.box.y2) / 2};
      },

     bottom: function ()
      {
         this.getBoundingBox();

         return this.box.y2;
      },

     right: function ()
      {
         this.getBoundingBox();

         return this.box.x2;
      },

     duplicate: function ()
      {
         return new Path(__copy(this.points));
      },

     first: function ()
      {
         this.current = 0;

         return this.points[0];
      },

     last: function ()
      {
         this.current = this.points.length-1;

         return this.points[this.current];
      },

     next: function ()
      {
         return (this.current < this.points.length-1 ? this.points[++this.current] : null);
      },

     prev: function ()
      {
         return (this.current > 0 ? this.points[--this.current] : null);
      },

     each: function (fn)
      {
         var i=0,
             l=this.points.length;

         for (;i<l;i++)
            fn(i, this.points[i]);

         return this;
      },

     closest: function ()
      {  // TODO
      },

     step: function (t)
      {
         // Normalize to be between 0 and 1
         var j = t > 1 ? t - Math.floor(t) : t,
             k = j < 0 ? 1 - j : j,
             pos = Math.floor((this.points.length - 1) * k);

         return this.points[pos];
      }
  };

  PATH = function(params)
  {
     var path = new Path(),
         last,
         idx = 0,
         len = params.length,
         opt;

     for (;idx<len;idx++)
     {
        opt = params[idx];

        if (PATH.generator[opt.fn])
        {
           opt.start = last || {};
           last = path.append(PATH.generator[opt.fn].call(this, opt)).last();
        }
        else
        {
           throw('Path generator ' + func + ' does not exist');
        }
     }

     return path;
  };

  PATH.generator = {

     start: function(options)
      {
         return {x: options.x, y: options.y}
      },

     line: function(options)
      {
         var x1 = options.start.x || 0,
             y1 = options.start.y || 0,
             x2 = options.x,
             y2 = options.y,
             c = plotLine(x1, y1, x2, y2, (options.density || 3));

         return c;

      },

     rectangle: function(options)
      {
         var step = options.density || 5,
             sx = options.start.x || 0,
             sy = options.start.y || 0,
             w = options.w,
             h = options.h,
             cr = options.cornerRadius || 0,
             rect = PATH([{fn: 'start', x: sx,     y: sy}]),
             arc, lines, ctr, tm, len;


         if (!cr.length)
            cr = [cr,cr,cr,cr];

         arc = cr.map(function (r, i)
           {
              return (
                PATH([{fn: 'circle', radius: r, arc: {start: 0, end: 90}, density: 1}]).rotate((i - 2) * 90)
                 );
           });

         lines = cr.map(function (r, i)
           {
              return (
                i % 2 == 0 ?
                  PATH([{fn: 'line',    x: w-cr[i]-cr[(i+1)%4], y: 0,                   density: 1}])
                :
                  PATH([{fn: 'line',    x: 0,                   y: h-cr[i]-cr[(i+1)%4], density: 1}])
                );
           });

         rect.append(arc[0], true)
             .append(lines[0], true)
             .append(arc[1], true)
             .append(lines[1], true)
             .append(arc[2], true)
             .append(lines[2].reverse(), true)
             .append(arc[3], true)
             .append(lines[3].reverse(), true);

         // Fix point density
         tm = [], len = rect.points.length;
         for (ctr=0;ctr<len;ctr++)
            if (ctr % step == 0 || ctr == len - 1) tm.push(rect.points[ctr]);

         return tm;

      },

     circle: function(options)
      {
         var x = options.start.x || 0,
             y = options.start.y || 0,
             r = options.radius,
             c = plotEllipseRect(x-r*2, y-r, x, y+r, (options.density || 3));

         var arcs = 0,
             arce = c.length,
             mv;

         if (options.arc)
         {
            arcs = Math.round((options.arc.start / 360) * arce);
            arce = Math.round((options.arc.end / 360) * arce);

            c = c.slice(arcs, arce);

            mv = {dx: x - c[0].x, dy: y - c[0].y};

            c = c.map(function(p) {  return {x: p.x + mv.dx, y: p.y + mv.dy};  });
         }

         return c;
      },

     ellipse: function(options)
      {
         var x = options.start.x || 0,
             y = options.start.y || 0,
             a = options.a,
             b = options.b,
             c = plotEllipseRect(x-a*2, y-b, x, y+b, (options.density || 3));

         var arcs = 0,
             arce = c.length,
             mv;

         if (options.arc)
         {
            arcs = Math.floor((options.arc.start / 360) * arce);
            arce = Math.ceil((options.arc.end / 360) * arce);

            c = c.slice(arcs, arce);

            mv = {dx: x - c[0].x, dy: y - c[0].y};

            c = c.map(function(p) {  return {x: p.x + mv.dx, y: p.y + mv.dy};  });
         }

         return c;
      },

     wave: function(options)
      {
         var x = options.start.x || 0,
             y = options.start.y || 0,
             step = (options.density || 5),
             ip = options.interpolate || true,
             sm = options.smooth || false,
             mv = 1,
             ds = options.length,
             dx = options.frequency / 2,
             dy = options.amplitude,
             ad = x + dx / 2,
             last = {x: x, y: y},
             c = [],
             pt;

         if (!(ip && !sm))
            c.push({x: x, y: y})

         while (ad < x + ds)
         {
            pt = {x: Math.round(ad), y: Math.round(y + dy * mv)};

            if (ip && !sm)
               c = c.concat(plotLine(last.x, last.y, pt.x, pt.y, step));
            else
               c.push(pt)

            mv *= -1;
            ad += dx;

            last = pt;
         }

         if (ip && !sm)
            c = c.concat(plotLine(last.x, last.y, Math.round(ad - dx / 2), y, step));
         else
            c.push({x: ad - dx / 2, y: y})

         if (sm)
            c = PATH.generator.bezier({start: c[0], points: c.slice(1, c.length), density: step});

         return c;
      },

     bezier: function(options)
      {

         var pts = [{x: options.start.x || 0, y: options.start.y || 0}].concat(options.points),
             step = (options.density || 5),
             ptr = 1,
             len = pts.length,
             c = [];

         pts.unshift(pts[1]);
         pts.push(pts[len-1]);

         while (ptr<len)
         {
            c = c.concat(plotBezierQuad.apply(this, pts.slice(ptr-1,ptr+3), step));
            ptr++;
         }

         return c;

      }

  };

  PATH.adapter = {

     // jQuery animate step callback
     animateNode: function (path)
      {
         return (function(now, fx)
          {
             var pt = path.step(fx.pos);

             fx.elem.style.top = pt.y + 'px';
             fx.elem.style.left = pt.x + 'px';
          });
      },

     animatePlot: function (path)
      {
         return (
            function (now, fx)
            {
               var pt = path.step(fx.pos),
                   x = pt.x,
                   y = pt.y,
                   ctx;

               ctx = fx.elem.getContext('2d');

               ctx.fillStyle = 'black';
               ctx.strokeStyle = 'black';
               ctx.lineWidth = 1;

               ctx.beginPath();

               ctx.moveTo(x, y);
               ctx.arc(x, y, 1, 0, 2 * Math.PI, true);
               ctx.fill();

               ctx.stroke();
            });
      },

     drawCanvas: function (canvas, path, options)
      {
         var ctx = canvas.getContext('2d'),
             pt = path.first(),
             options = options || {},
             fill = options.fillStyle || 'none';

         ctx.fillStyle = fill;
         ctx.strokeStyle = options.strokeStyle || 'black';
         ctx.lineWidth = options.lineWidth || 1;

         ctx.beginPath();
         ctx.moveTo(pt.x, pt.y);

         while (pt = path.next())
            ctx.lineTo(pt.x, pt.y);

         if (fill != 'none')
         {
            ctx.closePath();
            ctx.fill();
         }

         ctx.stroke();
      },

     drawSVG: function (svg, path, options)
      {
         var pt = path.first(),
             options = options || {},
             pl = '',
             st,
             nd;

         options.fill = (options.fillStyle || 'none');
         options.stroke = (options.strokeStyle || 'black');
         options.lineWidth = (options.lineWidth || '1');

         do {
            pl += Math.round(pt.x)+','+Math.round(pt.y)+' ';
         } while (pt = path.next());

         nd = document.createElementNS('http://www.w3.org/2000/svg','polygon');
         nd.setAttribute('points', pl);

         for (st in options)
            nd.style[st] = options[st];

         svg.appendChild(nd);

         return nd;
      },

  };

/*

Bresenham Algorithm Implementations
Adapted from C code posted at:
http://free.pages.at/easyfilter/bresenham.html
Copyright © Alois Zingl, Vienna, Austria

*/


function plotLine(x0, y0, x1, y1, step)
{
  var step = step || 5,
      ctr = 0,
      dx =  Math.abs(x1-x0),
      sx = x0<x1 ? 1 : -1,
      dy = -Math.abs(y1-y0),
      sy = y0<y1 ? 1 : -1,
      err = dx+dy, e2,
      out = []; /* error value e_xy */

  for(;;){  /* loop */
    if (ctr++%step == 0)
       out.push({x:x0,y:y0});

    if (x0==x1 && y0==y1) break;
    e2 = 2*err;
    if (e2 >= dy) { err += dy; x0 += sx; } /* e_xy+e_x > 0 */
    if (e2 <= dx) { err += dx; y0 += sy; } /* e_xy+e_y < 0 */
  }

  return out;
}

function plotCircle(xm, ym, r, step)
{
   var step = step || 5,
       ctr = 0,
       x = -r,
       y = 0,
       err = 2-2*r, /* II. Quadrant */
       out = {q1: [], q2: [], q3: [], q4: []};
   do {
      if (ctr++%step == 0) {
         out.q1.push({x:xm-x, y:ym+y}); /*   I. Quadrant */
         out.q2.push({x:xm-y, y:ym-x}); /*  II. Quadrant */
         out.q3.push({x:xm+x, y:ym-y}); /* III. Quadrant */
         out.q4.push({x:xm+y, y:ym+x}); /*  IV. Quadrant */
      }
      r = err;
      if (r <= y) err += ++y*2+1;           /* e_xy+e_y < 0 */
      if (r > x || err > y) err += ++x*2+1; /* e_xy+e_x > 0 or no 2nd y-step */
   } while (x < 0);

  return [].concat(out.q1, out.q2, out.q3, out.q4);
}

function plotEllipseRect(x0, y0, x1, y1, step)
{
   var step = step || 5,
       ctr = 0,
       a = Math.abs(x1-x0),
       b = Math.abs(y1-y0),
       b1 = b&1, /* values of diameter */
       dx = 4*(1-a)*b*b,
       dy = 4*(b1+1)*a*a, /* error increment */
       err = dx+dy+b1*a*a,
       e2, /* error of 1.step */
       out = {q1: [], q2: [], q3: [], q4: []};

   if (x0 > x1) { x0 = x1; x1 += a; } /* if called with swapped points */
   if (y0 > y1) y0 = y1;        /* .. exchange them */
   y0 += (b+1)/2; y1 = y0-b1;   /* starting pixel */
   a *= 8*a; b1 = 8*b*b;

   do {
      if (ctr++%step == 0) {
          out.q1.push({x:x1, y:y0}); /*   I. Quadrant */
          out.q2.push({x:x0, y:y0}); /*  II. Quadrant */
          out.q3.push({x:x0, y:y1}); /* III. Quadrant */
          out.q4.push({x:x1, y:y1}); /*  IV. Quadrant */
      }
       e2 = 2*err;
       if (e2 <= dy) { y0++; y1--; err += dy += a; }  /* y step */
       if (e2 >= dx || 2*err > dy) { x0++; x1--; err += dx += b1; } /* x step */
   } while (x0 <= x1);

   while (y0-y1 < b) {  /* too early stop of flat ellipses a=1 */
      if (ctr++%step == 0) {
         out.q1.push({x:x1+1, y:y0++});
         out.q2.push({x:x0-1, y:y0}); /* -> finish tip of ellipse */
         out.q3.push({x:x0-1, y:y1});
         out.q4.push({x:x1+1, y:y1--});
      }
   }

   return [].concat(out.q1, out.q2.reverse(), out.q3, out.q4.reverse());
}

/*
   Reference: http://www.antigrain.com/research/bezier_interpolation/
*/

function findControlPoints(s1, s2, s3)
{
    var dx1 = s1.x - s2.x, dy1 = s1.y - s2.y,
        dx2 = s2.x - s3.x, dy2 = s2.y - s3.y,

        l1 = Math.sqrt(dx1*dx1 + dy1*dy1),
        l2 = Math.sqrt(dx2*dx2 + dy2*dy2),

        m1 = {x: (s1.x + s2.x) / 2.0, y: (s1.y + s2.y) / 2.0},
        m2 = {x: (s2.x + s3.x) / 2.0, y: (s2.y + s3.y) / 2.0},

        dxm = (m1.x - m2.x),
        dym = (m1.y - m2.y),

        k = l2 / (l1 + l2),
        cm = {x: m2.x + dxm*k, y: m2.y + dym*k},
        tx = s2.x - cm.x, ty = s2.y - cm.y,

        c1 = {x: m1.x + tx, y: m1.y + ty},
        c2 = {x: m2.x + tx, y: m2.y + ty};

    return {c1: c1, c2: c2, l1: Math.floor(l1), l2: Math.floor(l2)};
}

/*
   Reference: http://www.niksula.hut.fi/~hkankaan/Homepages/bezierfast.html
*/

function plotBezierQuad(s1, s2, s3, s4, step)
{
    var step = step || 5,

        S1 = findControlPoints(s1, s2, s3),
        S2 = findControlPoints(s2, s3, s4),

        ctr = Math.floor(( (S1.l1 || S1.l2) + (S2.l2 || S2.l1) ) / step),

        p1 = s2,
        p2 = S1.c2,
        p3 = S2.c1,
        p4 = s3,

        // Now do actual bezier math

        dx1 = p2.x - p1.x, dy1 = p2.y - p1.y,
        dx2 = p3.x - p2.x, dy2 = p3.y - p2.y,
        dx3 = p4.x - p3.x, dy3 = p4.y - p3.y,

        ss  = 1.0 / (ctr + 1), ss2 = ss*ss, ss3 = ss2*ss,

        pre1 = 3.0 * ss,
        pre2 = 3.0 * ss2,
        pre4 = 6.0 * ss2,
        pre5 = 6.0 * ss3,

        tmp1x = p1.x - p2.x * 2.0 + p3.x,
        tmp1y = p1.y - p2.y * 2.0 + p3.y,

        tmp2x = (p2.x - p3.x)*3.0 - p1.x + p4.x,
        tmp2y = (p2.y - p3.y)*3.0 - p1.y + p4.y,

        pf = p1,

        dfx = (p2.x - p1.x)*pre1 + tmp1x*pre2 + tmp2x*ss3,
        dfy = (p2.y - p1.y)*pre1 + tmp1y*pre2 + tmp2y*ss3,

        ddfx = tmp1x*pre4 + tmp2x*pre5,
        ddfy = tmp1y*pre4 + tmp2y*pre5,

        dddfx = tmp2x*pre5,
        dddfy = tmp2y*pre5,

        out = [];

    while(ctr--)
    {
        pf = {x: pf.x + dfx, y: pf.y + dfy};

        dfx  += ddfx;
        dfy  += ddfy;
        ddfx += dddfx;
        ddfy += dddfy;

        out.push(pf);
    }

    out.push({x: p4.x, y: p4.y});  // Last step must go exactly to x4, y4

    return out;
}



  PATH.version = '0.1';


})();