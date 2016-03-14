var url = require('url');
var ffi = require('./ffi');

var mapnik = require("mapnik"),
    tiletype = require("tiletype");

function pixelsToIm(res, pixels, callback) {
  var im = new mapnik.Image(res, res);
  pixels.forEach(function (pixel, index) {
    var x = Math.floor(index / res);
    var y = index % res;

    var red = (pixel >> 16) & 0xFF;
    var green = (pixel >> 8) & 0xFF;
    var blue = pixel & 0xFF;

    im.setPixel(x, y, new mapnik.Color(red, blue, green));
  })
  im.encode('png', callback);
}

module.exports = function(tilelive, options) {
  var Fractal = function(uri, callback) {
    if (typeof(uri) === "string") {
      uri = url.parse(uri, true);
    }

    console.log(uri);
    this.fractal = decodeURIComponent(uri.hostname);
    this.fractalParams = (uri.pathname || "0,0").slice(1).split(',')
    this.format = uri.query.format || "png";
    this.tileSize = 256;
    this.headers = {'Content-Type': 'image/png'};
    return callback(null, this);
  };

  Fractal.prototype.getTile = function(z, x, y, callback) {
    var module = this;
    var zoom = 8.0/Math.pow(2, (z + 1));
    var offsetx = x * zoom - 2.0;
    var offsety = y * zoom - 2.0;
    var cRe = parseFloat(this.fractalParams[0]);
    var cIm = parseFloat(this.fractalParams[1]);
    ffi.julia(this.tileSize, this.tileSize, offsetx, offsety, zoom, cRe, cIm, function (pixels) {
      pixelsToIm(module.tileSize, pixels, function (err, pngData) {
        return callback(null, pngData, module.headers);
      })
    });
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