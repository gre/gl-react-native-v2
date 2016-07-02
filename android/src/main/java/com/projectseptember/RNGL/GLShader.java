package com.projectseptember.RNGL;


import static android.opengl.GLES20.*;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import java.nio.IntBuffer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GLShader {

    private final String name;
    private final String vert;
    private final String frag;
    private Map<String, Integer> uniformTypes;
    private List<String> uniformNames;
    private int program; // Program of the shader
    private int buffer[]; // the buffer currently contains 2 static triangles covering the surface
    private int pointerLoc; // The "pointer" attribute is used to iterate over vertex
    private Map<String, Integer> uniformLocations; // The uniform locations cache
    private Map<String, Integer> uniformSizes; // The size of the uniform variable

    private Integer id;
    private RNGLContext rnglContext;
    private GLShaderCompilationFailed compilationFailed;

    public GLShader(GLShaderData data, Integer id, RNGLContext rnglContext) {
        this.name = data.name;
        this.vert = data.vert;
        this.frag = data.frag;
        this.id = id;
        this.rnglContext = rnglContext;
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        if (buffer != null) {
            // TODO: need to check if this works properly
            glDeleteProgram(program);
            glDeleteBuffers(1, buffer, 0);
        }
    }

    public void runtimeException (String msg) {
        throw new GLShaderCompilationFailed(name, msg);
    }

    public void bind () {
        ensureCompile();

        if (!glIsProgram(program)) {
            runtimeException("not a program");
        }
        glUseProgram(program);
        glBindBuffer(GL_ARRAY_BUFFER, buffer[0]);
        glEnableVertexAttribArray(pointerLoc);
        glVertexAttribPointer(pointerLoc, 2, GL_FLOAT, false, 0, 0);
    }

    public void validate () {
        glValidateProgram(program);
        int[] validSuccess = new int[1];
        glGetProgramiv(program, GL_VALIDATE_STATUS, validSuccess, 0);
        if (validSuccess[0] == GL_FALSE) {
            glGetProgramInfoLog(program);
            runtimeException(glGetProgramInfoLog(program));
        }
    }

    public void setUniform (String name, Integer i) {
        glUniform1i(uniformLocations.get(name), i);
    }
    public void setUniform (String name, Float f) {
        glUniform1f(uniformLocations.get(name), f);
    }
    public void setUniform (String name, FloatBuffer buf, int type) {
        switch (type) {
            case GL_FLOAT_VEC2:
                glUniform2fv(uniformLocations.get(name), 1, buf);
                break;
            case GL_FLOAT_VEC3:
                glUniform3fv(uniformLocations.get(name), 1, buf);
                break;
            case GL_FLOAT_VEC4:
                glUniform4fv(uniformLocations.get(name), 1, buf);
                break;
            case GL_FLOAT_MAT2:
                glUniformMatrix2fv(uniformLocations.get(name), 1, false, buf);
                break;
            case GL_FLOAT_MAT3:
                glUniformMatrix3fv(uniformLocations.get(name), 1, false, buf);
                break;
            case GL_FLOAT_MAT4:
                glUniformMatrix4fv(uniformLocations.get(name), 1, false, buf);
                break;
            default:
                runtimeException("Unsupported case: uniform '" + name + "' type: " + type);
        }
    }
    public void setUniform (String name, IntBuffer buf, int type) {
        switch (type) {
            case GL_INT_VEC2:
            case GL_BOOL_VEC2:
                glUniform2iv(uniformLocations.get(name), 1, buf);
                break;
            case GL_INT_VEC3:
            case GL_BOOL_VEC3:
                glUniform3iv(uniformLocations.get(name), 1, buf);
                break;
            case GL_INT_VEC4:
            case GL_BOOL_VEC4:
                glUniform4iv(uniformLocations.get(name), 1, buf);
                break;
            default:
                runtimeException("Unsupported case: uniform '"+name+"' type: "+type);
        }
    }

    public String getName() {
        return name;
    }

    public Map<String, Integer> getUniformTypes() {
        return uniformTypes;
    }
    public Map<String, Integer> getUniformSizes() {
        return uniformSizes;
    }
    public List<String> getUniformNames() { return uniformNames; }

    private int compileShader (String code, int shaderType) {
        int shaderHandle = glCreateShader(shaderType);
        glShaderSource(shaderHandle, code);
        glCompileShader(shaderHandle);
        int compileSuccess[] = new int[1];
        glGetShaderiv(shaderHandle, GL_COMPILE_STATUS, compileSuccess, 0);
        if (compileSuccess[0] == GL_FALSE) {
            runtimeException(glGetShaderInfoLog(shaderHandle));
            return -1;
        }
        return shaderHandle;
    }

    private void computeMeta () {
        Map<String, Integer> uniforms = new HashMap<>();
        Map<String, Integer> locations = new HashMap<>();
        Map<String, Integer> sizes = new HashMap<>();
        ArrayList<String> uniformNames = new ArrayList<>();

        int[] nbUniforms = new int[1];
        int[] typePointer = new int[1];
        int[] sizePointer = new int[1];
        glGetProgramiv(program, GL_ACTIVE_UNIFORMS, nbUniforms, 0);
        for (int i=0; i < nbUniforms[0]; i++) {
            String uniformName = glGetActiveUniform(program, i, sizePointer, 0, typePointer, 0);
            int size = sizePointer[0];
            int type = typePointer[0];
            if (uniformName.contains("[0]")) {
                uniformName = uniformName.substring(0, uniformName.length()-3);
            }
            uniformNames.add(uniformName);
            uniforms.put(uniformName, type);
            sizes.put(uniformName, size);
            if (size == 1) {
                int location = glGetUniformLocation(program, uniformName);
                locations.put(uniformName, location);
            }
            else {
                for (int j=0; j<size; j++) {
                    String uniformIndexName = uniformName+ "[" + j + "]";
                    int location = glGetUniformLocation(program, uniformIndexName);
                    locations.put(uniformIndexName, location);
                    uniforms.put(uniformIndexName, type);
                    sizes.put(uniformIndexName, 1);
                }
            }

        }
        this.uniformTypes = uniforms;
        this.uniformLocations = locations;
        this.uniformSizes = sizes;
        this.uniformNames = uniformNames;
    }

    private void makeProgram () throws GLShaderCompilationFailed {
        int vertex = compileShader(vert, GL_VERTEX_SHADER);
        if (vertex == -1) return;

        int fragment = compileShader(frag, GL_FRAGMENT_SHADER);
        if (fragment == -1) return;

        program = glCreateProgram();
        glAttachShader(program, vertex);
        glAttachShader(program, fragment);
        glLinkProgram(program);

        int[] linkSuccess = new int[1];
        glGetProgramiv(program, GL_LINK_STATUS, linkSuccess, 0);
        if (linkSuccess[0] == GL_FALSE) {
            runtimeException(glGetProgramInfoLog(program));
        }

        glUseProgram(program);

        validate();

        computeMeta();

        pointerLoc = glGetAttribLocation(program, "position");

        buffer = new int[1];
        glGenBuffers(1, buffer, 0);
        glBindBuffer(GL_ARRAY_BUFFER, buffer[0]);

        float buf[] = {
            -1.0f, -1.0f,
            -1.0f, 4.0f,
             4.0f,  -1.0f
        };
        FloatBuffer bufferData = ByteBuffer.allocateDirect(buf.length * 4)
                .order(ByteOrder.nativeOrder())
                .asFloatBuffer();
        bufferData.put(buf).position(0);

        glBufferData(GL_ARRAY_BUFFER, buf.length * 4, bufferData, GL_STATIC_DRAW);
    }

    public boolean isReady () {
        return buffer != null && uniformLocations != null;
    }

    public boolean ensureCompile() {
        if (!isReady()) {
            if (compilationFailed != null) throw compilationFailed;
            try {
                makeProgram();
                rnglContext.shaderSucceedToCompile(id, uniformTypes);
            }
            catch (GLShaderCompilationFailed e) {
                compilationFailed = e;
                rnglContext.shaderFailedToCompile(id, e);
                throw e;
            }
        }
        return isReady();
    }
}
