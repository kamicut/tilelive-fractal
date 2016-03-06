var url = require("url");

var mapnik = require("mapnik"),
    math = require('mathjs');
    tiletype = require("tiletype");

var fs = require('fs')


function thresh (color) {
  if (color > 255.0) {
    return 255.0;
  } else if (color < 0) {
    return 0;
  } else {
    return color;
  }
}

// Hue to RGB
function hueToRGB (h) {
  if (h > 1.0) {
    h = h - 1.0
  }
  if (h < 0.16) return thresh(h * 6.0 * 255.0);
  else if (h < 0.5) return 255.0;
  else if (h < 0.67) return thresh((0.67 - h) * 6.0 * 255.0);
  else return 255.0
}

// Julia set
function julia(imgx, imgy, offsetx, offsety, zoom, c) {
  var max_iterations = 255;
  var scalex = zoom / imgx;
  var scaley = zoom/ imgy;

  var im = new mapnik.Image(256, 256);
  for (var x = 0; x < 256; x++) {
    for (var y = 0; y < 256; y++) {
      var cx = (x + offsetx) * scalex - (zoom / 2);
      var cy = (y + offsety) * scaley - (zoom / 2);
      var z = math.complex(cx, cy);
      var t = 0;
      for (t = 0; t < max_iterations; t++) {
        if (math.norm(z) > 2.0) {
          break;
        }
        z = math.add(math.multiply(z, z), c);
      }
      var r = hueToRGB(t/255 - 0.3);
      var g = hueToRGB(t/255);
      var b = hueToRGB(t + 0.3);
      im.setPixel(x, y, new mapnik.Color(r, g, b));
    }
  }
  return im.encodeSync('png');
}

module.exports = function(tilelive, options) {
  var Fractal = function(uri, callback) {
    if (typeof(uri) === "string") {
      uri = url.parse(uri, true);
    }

    this.fractal = decodeURIComponent(uri.hostname + (uri.pathname || "").slice(1));
    this.format = uri.query.format || "png";
    this.tileSize = (uri.query.tileSize | 0) || 256;
    this.headers = {'Content-Type': 'image/png'};
    return callback(null, this);
  };

  Fractal.prototype.getTile = function(z, x, y, callback) {
      var zoom = 4.0/(2 * z + 1);
      var res = 256 * (z + 1);
      console.log(zoom);
      var c = math.complex(-0.4, 0.6)
      var image = julia(res, res, 256 * x, 256 * y, zoom, c);
      console.log(image);
      return callback(null, image, this.headers);
  };

  Fractal.prototype.getInfo = function(callback) {
    return setImmediate(function() {
      return callback(null, {
        fractal: this.fractal,
        format: this.format
      });
    }.bind(this));
  };

  Fractal.prototype.close = function(callback) {
    return callback && setImmediate(callback);
  };

  Fractal.registerProtocols = function(tilelive) {
    tilelive.protocols["fractal:"] = Fractal;
  };

  Fractal.registerProtocols(tilelive);

  return Fractal;
};