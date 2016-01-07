package com.projectseptember.RNGL;

public class GLShaderCompilationFailed extends RuntimeException {
    public final String shaderName;
    public final String compileError;

    public GLShaderCompilationFailed(String shaderName, String compileError) {
        super("Shader '"+shaderName+"': "+compileError);
        this.compileError = compileError;
        this.shaderName = shaderName;
    }
}
