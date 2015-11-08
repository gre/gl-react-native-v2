package com.projectseptember.RNGL;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public class RNGLContext extends ReactContextBaseJavaModule {

    public RNGLContext (ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "RNGLContext";
    }

    @ReactMethod
    public void addShader (Integer id, ReadableMap config) {
        String frag = config.getString("frag");
        String name = config.getString("name");
        System.out.println("TODO... addShader: "+id+" "+name);
    }
}
