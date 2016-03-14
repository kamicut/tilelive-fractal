var url = require('url');
var ffi = require('./ffi');

var mapnik = require("mapnik"),
    tiletype = require("tiletype");

function pixelsToIm(res, pixels) {
  var im = new mapnik.Image(res, res);
  pixels.forEach(function (pixel, index) {
    var x = Math.floor(index / res);
    var y = index % res;

    var red = (pixel >> 16) & 0xFF;
    var green = (pixel >> 8) & 0xFF;
    var blue = pixel & 0xFF;

    im.setPixel(x, y, new mapnik.Color(red, blue, green));
  })
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
    var zoom = 8.0/Math.pow(2, (z + 1));
    var offsetx = y * zoom - 2.0;
    var offsety = x * zoom - 2.0;
    var pixels = ffi.julia(this.tileSize, this.tileSize, offsetx, offsety, zoom, -0.4, 0.6);
    return callback(null, pixelsToIm(this.tileSize, pixels), this.headers);
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