package com.projectseptember.RNGL;

import android.util.Log;

import static android.opengl.GLES20.*;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

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
    private Map<Integer, Callback> onCompileCallbacks = new HashMap<>();

    public RNGLContext (ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "RNGLContext";
    }

    public GLShaderData getShader (Integer id) {
        GLShaderData data;
        synchronized (this) {
            data = shaders.get(id);
        }
        return data;
    }

    @ReactMethod
    public void addShader (final Integer id, final ReadableMap config, final Callback onCompile) {
        final String frag = config.getString("frag");
        final String name = config.getString("name");
        GLShaderData data = new GLShaderData(name, STATIC_VERT, frag);
        synchronized (this) {
            shaders.put(id, data);
            if (onCompile != null) {
                onCompileCallbacks.put(id, onCompile);
            }
        }
    }

    @ReactMethod
    public void removeShader (final Integer id) {
        GLShaderData shader;
        synchronized (this) {
            shader = shaders.remove(id);
        }
        if (shader == null) {
            throw new Error("removeShader("+id+"): shader does not exist");
        }
    }

    public void shaderFailedToCompile(Integer id, GLShaderCompilationFailed e) {
        Callback onCompile;
        synchronized (this) {
            onCompile = onCompileCallbacks.get(id);
            onCompileCallbacks.remove(id);
        }
        if (onCompile == null) {
            Log.e("RNGLContext", e.getMessage());
        }
        else {
            onCompile.invoke(e.compileError);
        }
    }

    public void shaderSucceedToCompile(Integer id, Map<String, Integer> uniformTypes) {
        Callback onCompile;
        synchronized (this) {
            onCompile = onCompileCallbacks.get(id);
            onCompileCallbacks.remove(id);
        }
        if (onCompile != null) {
            WritableMap res = Arguments.createMap();
            WritableMap uniforms = Arguments.createMap();
            for (String key : uniformTypes.keySet()) {
                uniforms.putString(key, glTypeString(uniformTypes.get(key)));
            }
            res.putMap("uniforms", uniforms);
            onCompile.invoke(null, res);
        }
    }

    static String glTypeString (int type) {
        switch (type) {
            case GL_FLOAT: return "float";
            case GL_FLOAT_VEC2: return "vec2";
            case GL_FLOAT_VEC3: return "vec3";
            case GL_FLOAT_VEC4: return "vec4";
            case GL_INT: return "int";
            case GL_INT_VEC2: return "ivec2";
            case GL_INT_VEC3: return "ivec3";
            case GL_INT_VEC4: return "ivec4";
            case GL_BOOL: return "bool";
            case GL_BOOL_VEC2: return "bvec2";
            case GL_BOOL_VEC3: return "bvec3";
            case GL_BOOL_VEC4: return "bvec4";
            case GL_FLOAT_MAT2: return "mat2";
            case GL_FLOAT_MAT3: return "mat3";
            case GL_FLOAT_MAT4: return "mat4";
            case GL_SAMPLER_2D: return "sampler2D";
            case GL_SAMPLER_CUBE: return "samplerCube";
        }
        return "";
    }
}
