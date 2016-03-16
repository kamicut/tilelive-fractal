# tilelive-fractal

A tilelive provider that generates fractals. Inspired by [tilelive-solid](https://github.com/mojodna/tilelive-solid)

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

<img width="1260" alt="localhost_8080__6_16_699_2_988" src="https://cloud.githubusercontent.com/assets/719357/13823125/b291f79a-eb7e-11e5-8718-158507169f7b.png">
