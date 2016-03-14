# tilelive-fractal

## Build Requirements
- [Rust](https://www.rust-lang.org/)
- [Node.js and npm](https://nodejs.org/)

```
npm install
npm run build
```

## Running

The quadratic julia set has been implemented, you can pass parameters for
the complex number `c` using `fractal:julia/c_re,c_im` where `c_re` and `c_im` are the real and imaginary parts of `c`.

```
npm start fractal:julia/-0.8,0.156
```