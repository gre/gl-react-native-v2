package com.projectseptember.RNGL;

import java.util.ArrayList;
import java.util.List;

import static android.opengl.GLES20.*;

public class GLFBO {
    public final List<GLTexture> color = new ArrayList<>();
    private int handle;
    private int width = 0;
    private int height = 0;

    private static GLTexture initTexture (int width, int height, int attachment) {
        GLTexture texture = new GLTexture();
        texture.bind();
        texture.setShape(width, height);
        glFramebufferTexture2D(GL_FRAMEBUFFER, attachment, GL_TEXTURE_2D, texture.getHandle(), 0);
        return texture;
    }

    class FBOState {

        private int fbo;

        public FBOState() {
            int[] fbo = new int[1];
            glGetIntegerv(GL_FRAMEBUFFER_BINDING, fbo, 0);
            this.fbo = fbo[0];
        }

        private void restore() {
            glBindFramebuffer(GL_FRAMEBUFFER, fbo);
        }
    }

    public GLFBO() {
        FBOState state = new FBOState();

        int[] handleArr = new int[1];
        glGenFramebuffers(1, handleArr, 0);
        handle = handleArr[0];

        int numColors = 1;

        glBindFramebuffer(GL_FRAMEBUFFER, handle);

        for(int i=0; i<numColors; ++i) {
            color.add(initTexture(width, height, GL_COLOR_ATTACHMENT0 + i));
        }
        state.restore();
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        int[] handleArr = new int[] { handle };
        glDeleteFramebuffers(1, handleArr, 0);
    }


    void checkStatus () {
        int status = glCheckFramebufferStatus(GL_FRAMEBUFFER);
        if(status != GL_FRAMEBUFFER_COMPLETE) {
            switch (status) {
                case GL_FRAMEBUFFER_UNSUPPORTED:
                    throw new RuntimeException("Framebuffer unsupported");
                case GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                    throw new RuntimeException("Framebuffer incomplete attachment");
                case GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                    throw new RuntimeException("Framebuffer incomplete dimensions");
                case GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                    throw new RuntimeException("Framebuffer incomplete missing attachment");
                default:
                    throw new RuntimeException("Failed to create framebuffer: " + status);
            }
        }
    }

    public void bind () {
        glBindFramebuffer(GL_FRAMEBUFFER, handle);
        glViewport(0, 0, width, height);
    }

    public void setShape(int w, int h) {
        if (w == width && h == height) return;
        int[] maxFBOSize = new int[1];
        glGetIntegerv(GL_MAX_RENDERBUFFER_SIZE, maxFBOSize, 0);
        if( w < 0 || w > maxFBOSize[0] || h < 0 || h > maxFBOSize[0]) {
            throw new IllegalArgumentException("Can't resize framebuffer. Invalid dimensions");
        }
        width = w;
        height = h;

        FBOState state = new FBOState();

        for (GLTexture clr: color) {
            clr.setShape(w, h);
        }

        glBindFramebuffer(GL_FRAMEBUFFER, handle);
        checkStatus();

        state.restore();
    }
}
