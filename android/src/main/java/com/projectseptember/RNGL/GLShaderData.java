package com.projectseptember.RNGL;

public class GLShaderData {
    public final String name;
    public final String vert;
    public final String frag;

    public GLShaderData(String name, String vert, String frag) {
        this.name = name;
        this.vert = vert;
        this.frag = frag;
    }
}
