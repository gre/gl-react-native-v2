package com.projectseptember.RNGL;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.opengl.GLUtils;
import android.view.View;

import static android.opengl.GLES20.*;

public class GLTexture {
    public int handle;
    public Bitmap bitmapCurrentlyUploaded = null;

    private void dealloc () {
        int[] handleArr = new int[] { handle };
        glDeleteTextures(1, handleArr, 0);
        bitmapCurrentlyUploaded = null;
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

    public void setPixelsWithView (View view) {
        Bitmap bitmap = Bitmap.createBitmap( view.getLayoutParams().width, view.getLayoutParams().height, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        view.layout(view.getLeft(), view.getTop(), view.getRight(), view.getBottom());
        view.draw(canvas);
        setPixels(bitmap);
    }

    public void setShape (int width, int height) {
        bind();
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, null);
    }
}
