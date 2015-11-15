package com.projectseptember.RNGL;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.util.HashMap;
import java.util.Map;

import javax.microedition.khronos.egl.EGLContext;

public class RNGLContext extends ReactContextBaseJavaModule {

    // Share GL Context ?
    // http://developer.android.com/training/graphics/opengl/environment.html
    // http://stackoverflow.com/questions/8845491/sharing-the-egl2-0-context-between-2-glsurfaceviews-caused-egl-bad-access-on-and
    // http://stackoverflow.com/questions/5675355/sharing-the-gles20-context-and-textures-between-different-glsurfaceviews

    private static String STATIC_VERT =
    "attribute vec2 position;"+
    "varying vec2 uv;"+
    "void main() {"+
        "gl_Position = vec4(position,0.0,1.0);"+
        "uv = vec2(0.5, 0.5) * (position+vec2(1.0, 1.0));"+
    "}";

    private Map<Integer, GLShader> shaders = new HashMap<>();
    private Map<Integer, GLFBO> fbos = new HashMap<>();

    public RNGLContext (ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "RNGLContext";
    }

    public GLShader getShader (Integer id) {
        return shaders.get(id);
    }

    public GLFBO getFBO (Integer id) {
        if (!fbos.containsKey(id)) {
            fbos.put(id, new GLFBO());
        }
        return fbos.get(id);
    }

    @ReactMethod
    public void addShader (final Integer id, final ReadableMap config) {
        final String frag = config.getString("frag");
        final String name = config.getString("name");
        shaders.put(id, new GLShader(name, STATIC_VERT, frag));
    }
}
