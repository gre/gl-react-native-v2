package com.projectseptember.RNGL;

import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Matrix;
import android.opengl.GLUtils;
import android.view.View;

import java.util.concurrent.Executor;

import static android.opengl.GLES20.*;

public class GLTexture {
    private int handle;
    private Bitmap bitmapCurrentlyUploaded = null;
    private Executor glExecutor;

    /**
     * GLTexture constructor as well as all methods must be called in GL Thread
     * @param glExecutor is only required for finalize()
     */
    public GLTexture (Executor glExecutor) {
        this.glExecutor = glExecutor;
        makeTexture();
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        bitmapCurrentlyUploaded = null;
        glExecutor.execute(new Runnable() {
            @Override
            public void run() {
                int[] handleArr = new int[] { handle };
                glDeleteTextures(1, handleArr, 0);
            }
        });
    }

    private void makeTexture () {
        int[] handleArr = new int[1];
        glGenTextures(1, handleArr, 0);
        handle = handleArr[0];
        glBindTexture(GL_TEXTURE_2D, handle);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    }

    public int bind (int unit) {
        glActiveTexture(GL_TEXTURE0 + unit);
        glBindTexture(GL_TEXTURE_2D, handle);
        return unit;
    }

    public void bind () {
        glBindTexture(GL_TEXTURE_2D, handle);
    }


    public void setPixels (Bitmap bitmap) {
        if (bitmap != bitmapCurrentlyUploaded) {
            bitmapCurrentlyUploaded = bitmap;
            bind();
            GLUtils.texImage2D(GL_TEXTURE_2D, 0, bitmap, 0);
        }
    }

    public void setPixelsRandom (int width, int height) {
        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                bitmap.setPixel(x, y, Color.rgb(
                    (int)(255.0 * Math.random()),
                    (int)(255.0 * Math.random()),
                    (int)(255.0 * Math.random())));
            }
        }
        setPixels(bitmap);
    }

    public void setPixelsEmpty () {
        Bitmap bitmap = Bitmap.createBitmap(2, 2, Bitmap.Config.ARGB_8888);
        setPixels(bitmap);
    }

    public void setShape (int width, int height) {
        bind();
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, null);
    }

    public int getHandle() {
        return handle;
    }
}
