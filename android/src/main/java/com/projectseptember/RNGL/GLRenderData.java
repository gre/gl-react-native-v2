package com.projectseptember.RNGL;

import java.nio.FloatBuffer;
import java.nio.IntBuffer;
import java.util.List;
import java.util.Map;

public class GLRenderData {

    final GLShader shader;
    final Map<String, Integer> uniformsInteger;
    final Map<String, Float> uniformsFloat;
    final Map<String, IntBuffer> uniformsIntBuffer;
    final Map<String, FloatBuffer> uniformsFloatBuffer;
    final Map<String, GLTexture> textures;
    final Integer width;
    final Integer height;
    final Integer fboId;
    final List<GLRenderData> contextChildren;
    final List<GLRenderData> children;

    public GLRenderData(
            GLShader shader,
            Map<String, Integer> uniformsInteger,
            Map<String, Float> uniformsFloat,
            Map<String, IntBuffer> uniformsIntBuffer,
            Map<String, FloatBuffer> uniformsFloatBuffer,
            Map<String, GLTexture> textures,
            Integer width,
            Integer height,
            Integer fboId,
            List<GLRenderData> contextChildren,
            List<GLRenderData> children) {
        this.shader = shader;
        this.uniformsInteger = uniformsInteger;
        this.uniformsFloat = uniformsFloat;
        this.uniformsIntBuffer = uniformsIntBuffer;
        this.uniformsFloatBuffer = uniformsFloatBuffer;
        this.textures = textures;
        this.width = width;
        this.height = height;
        this.fboId = fboId;
        this.contextChildren = contextChildren;
        this.children = children;
    }
}
