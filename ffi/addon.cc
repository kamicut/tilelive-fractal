#include <node.h>
#include <uv.h>
#include <v8.h>

using namespace v8;

typedef struct {
  void *data;
  int len;
} array_t;

typedef struct {
  int imgx;
  int imgy;
  double offsetx;
  double offsety;
  double zoom;
  double cRe;
  double cIm;
} julia_args;

struct Work {
  uv_work_t  request;
  Persistent<Function> callback;

  array_t results;
  julia_args args;
};


extern "C" array_t julia (int imgx, int imgy, double offsetx, double offsety,
    double zoom, double cRe, double cIm);

static void WorkAsync(uv_work_t * req) {
  Work * work = static_cast<Work *>(req->data);
  array_t pixels = julia(
      work->args.imgx, work->args.imgy,
      work->args.offsetx, work->args.offsety,
      work->args.zoom, work->args.cRe, work->args.cIm);
  work->results = pixels;
}

static void WorkAsyncComplete(uv_work_t * req, int status) {
  Isolate * isolate = Isolate::GetCurrent();
  v8::HandleScope handleScope(isolate); // Required for Node 4.x
  
  Work *work = static_cast<Work *>(req->data);

  int * pixelData = ((int *) work->results.data);
  Local<Array> tileData = Array::New(isolate);
  for (int i = 0; i < work->results.len; i ++) {
    tileData->Set(i, Number::New(isolate, pixelData[i]));
  }
  Handle<Value> argv[] = {tileData};

  Local<Function>::New(isolate, work->callback)->
    Call(isolate->GetCurrentContext()->Global(), 1, argv);

  work->callback.Reset();

  delete work;
}

void JuliaSet(const v8::FunctionCallbackInfo<v8::Value> & args) {
  Isolate* isolate = args.GetIsolate();

  // Get the julia args
  Local<Number> imgx = Local<Number>::Cast(args[0]);
  Local<Number> imgy = Local<Number>::Cast(args[1]);
  Local<Number> offsetx = Local<Number>::Cast(args[2]);
  Local<Number> offsety = Local<Number>::Cast(args[3]);
  Local<Number> zoom = Local<Number>::Cast(args[4]);
  Local<Number> cRe = Local<Number>::Cast(args[5]);
  Local<Number> cIm = Local<Number>::Cast(args[6]);

  // Get the callback
  Local<Function> callback = Local<Function>::Cast(args[7]);

  // Create the work object
  Work * work = new Work();
  work->request.data = work;
  work->args.imgx = imgx->Value();
  work->args.imgy = imgy->Value();
  work->args.offsetx = offsetx->Value();
  work->args.offsety = offsety->Value();
  work->args.zoom = zoom->Value();
  work->args.cRe = cRe->Value();
  work->args.cIm = cIm->Value();
  work->callback.Reset(isolate, callback);

  uv_queue_work(uv_default_loop(), &work->request,
      WorkAsync, WorkAsyncComplete);
}


void init (Handle <Object> exports, Handle <Object> module) {
  NODE_SET_METHOD(exports, "julia", JuliaSet);
}

NODE_MODULE(fractal, init)