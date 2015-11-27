package com.projectseptember.RNGL;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import java.util.ArrayList;
import java.util.List;

public class GLData {

    final Integer shader;
    final ReadableMap uniforms;
    final Integer width;
    final Integer height;
    final Integer fboId;
    final List<GLData> contextChildren;
    final List<GLData> children;

    public GLData(Integer shader, ReadableMap uniforms, Integer width, Integer height, Integer fboId, List<GLData> contextChildren, List<GLData> children) {
        this.shader = shader;
        this.uniforms = uniforms;
        this.width = width;
        this.height = height;
        this.fboId = fboId;
        this.contextChildren = contextChildren;
        this.children = children;
    }

    public static List<GLData> fromArray (ReadableArray arr) {
        ArrayList<GLData> list = new ArrayList<>();
        for (int i=0; i < arr.size(); i++) {
            list.add(fromMap(arr.getMap(i)));
        }
        return list;
    }

    public static GLData fromMap (ReadableMap map) {
        Integer shader = map.getInt("shader");
        ReadableMap uniforms = map.getMap("uniforms");
        Integer width = map.getInt("width");
        Integer height = map.getInt("height");
        Integer fboId = map.getInt("fboId");
        List<GLData> children = fromArray(map.getArray("children"));
        List<GLData> contextChildren = fromArray(map.getArray("contextChildren"));
        return new GLData(shader, uniforms, width, height, fboId, contextChildren, children);
    }
}
