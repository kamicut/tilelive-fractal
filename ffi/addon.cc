#include <node.h>
#include <v8.h>

using namespace v8;

typedef struct {
  void *data;
  int len;
} array_t;

extern "C" array_t julia (int imgx, int imgy, double offsetx, double offsety,
    double zoom, double cRe, double cIm);

void JuliaSet(const v8::FunctionCallbackInfo<v8::Value> & args) {
  Isolate* isolate = args.GetIsolate();
  Local<Number> imgx = Local<Number>::Cast(args[0]);
  Local<Number> imgy = Local<Number>::Cast(args[1]);
  Local<Number> offsetx = Local<Number>::Cast(args[2]);
  Local<Number> offsety = Local<Number>::Cast(args[3]);
  Local<Number> zoom = Local<Number>::Cast(args[4]);
  Local<Number> cRe = Local<Number>::Cast(args[5]);
  Local<Number> cIm = Local<Number>::Cast(args[6]);

  array_t pixels = julia(
      imgx->Value(), imgy->Value(), offsetx->Value(), offsety->Value(),
      zoom->Value(), cRe->Value(), cIm->Value());
  int * pixelData = ((int *) pixels.data);
  Local<Array> tileData = Array::New(isolate);
  for (int i = 0; i < pixels.len; i ++) {
    tileData->Set(i, Number::New(isolate, pixelData[i]));
  }
  args.GetReturnValue().Set(tileData);
}

void init (Handle <Object> exports, Handle <Object> module) {
  NODE_SET_METHOD(exports, "julia", JuliaSet);
}

NODE_MODULE(fractal, init)