package com.projectseptember.RNGL;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import java.util.ArrayList;
import java.util.List;

public class GLData {

    final Integer shader;
    final ReadableMap uniforms;
    final Double width;
    final Double height;
    final Double pixelRatio;
    final Integer fboId;
    final List<GLData> contextChildren;
    final List<GLData> children;

    public GLData(Integer shader, ReadableMap uniforms, Double width, Double height, Double pixelRatio, Integer fboId, List<GLData> contextChildren, List<GLData> children) {
        this.shader = shader;
        this.uniforms = uniforms;
        this.width = width;
        this.height = height;
        this.pixelRatio = pixelRatio;
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
        Double width = map.getDouble("width");
        Double height = map.getDouble("height");
        Double pixelRatio = map.getDouble("pixelRatio");
        Integer fboId = map.getInt("fboId");
        List<GLData> children = fromArray(map.getArray("children"));
        List<GLData> contextChildren = fromArray(map.getArray("contextChildren"));
        return new GLData(shader, uniforms, width, height, pixelRatio, fboId, contextChildren, children);
    }
}
