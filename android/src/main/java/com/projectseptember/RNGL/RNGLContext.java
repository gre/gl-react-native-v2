package com.projectseptember.RNGL;

import android.telecom.Call;
import android.view.View;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.PromiseImpl;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.UIManagerModule;

import java.util.HashMap;
import java.util.Map;

public class RNGLContext extends ReactContextBaseJavaModule {

    private static String STATIC_VERT =
    "attribute vec2 position;"+
    "varying vec2 uv;"+
    "void main() {"+
        "gl_Position = vec4(position,0.0,1.0);"+
        "uv = vec2(0.5, 0.5) * (position+vec2(1.0, 1.0));"+
    "}";

    private Map<Integer, GLShaderData> shaders = new HashMap<>();
    private Map<Integer, GLFBO> fbos = new HashMap<>();

    public RNGLContext (ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "RNGLContext";
    }

    public GLShaderData getShader (Integer id) {
        return shaders.get(id);
    }

    @ReactMethod
    public void capture (int tag, Promise promise) {
        throw new Error("GLCanvas#captureFrame is not yet implemented on Android");
        /*
        UIManagerModule uiManager = getReactApplicationContext().getNativeModule(UIManagerModule.class);
        View view = uiManager.getViewByTag(tag);
        if (view != null && view instanceof GLCanvas) {
            ((GLCanvas)view).capture(promise);
        }
        else {
            throw new Error("Expecting a GLCanvas, got: "+view);
        }
        */
    }

    @ReactMethod
    public void addShader (final Integer id, final ReadableMap config) {
        final String frag = config.getString("frag");
        final String name = config.getString("name");
        shaders.put(id, new GLShaderData(name, STATIC_VERT, frag));
    }
}
