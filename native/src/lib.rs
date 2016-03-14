extern crate libc;
extern crate num;
extern crate rayon;

use std::slice;
use std::mem;
use num::complex::Complex;
use rayon::prelude::*;

#[repr(C)]
pub struct Array {
    data: *const libc::c_void,
    len: i32,
}

impl Array {
    fn from_vec<T>(mut vec: Vec<T>) -> Array {
        vec.shrink_to_fit();
        let array = Array { data: vec.as_ptr() as *const libc::c_void, len: vec.len() as i32 };

        mem::forget(vec);

        array
    }
}

fn hue_to_rgb(i: f64) -> f64 {
    let mut h = i;
    if h > 1.0 {
        h = h - 1.0;
    }
    let ret = match h {
        h if h < 0.0 => 0.0,
        h if h < 0.16 => 6.0 * h,
        h if h < 0.5 => 1.0,
        h if h < 0.67 => (0.67 - h) * 6.0,
        _ => 1.0
    };
    ret * 255.0
}

fn pack_rgb(lum: f64) -> i32 {
    let red = hue_to_rgb(lum/255.0 - 0.3) as i32;
    let blue = hue_to_rgb(lum/255.0) as i32;
    let green = hue_to_rgb(lum/255.0 + 0.3) as i32;

    65536 * red + 256 * green + blue
}

#[no_mangle]
pub extern fn julia(imgx: i32, imgy: i32, offsetx: f64, offsety: f64,
    zoom: f64, cRe: f64, cIm: f64) -> Array {

    let max_iterations = 255u16;
    let scalex = zoom / imgx as f64;
    let scaley = zoom / imgy as f64;

   let c = Complex::new(cRe, cIm);

   let num_pixels = imgx * imgy;
   let mut v = Vec::new();
   let r = (0..num_pixels).into_par_iter().map(|i| {
         let x: i32 = i / imgx;
         let y: i32 = i % imgx;

         let cy = (y as f64 * scaley) + offsety;
         let cx = (x as f64 * scalex) + offsetx;

         let mut z = Complex::new(cx, cy);
         let mut i = 0;

         for t in 0..max_iterations {
             if z.norm() > 2.0 {
                 break
             }
             z = z * z + c;
             i = t;
         }
         let lum = i as f64;
         pack_rgb(lum)
       }).collect_into(&mut v);

    Array::from_vec(v.clone())
}
