package com.projectseptember.RNGL;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.net.Uri;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.common.references.CloseableReference;
import com.facebook.common.util.UriUtil;
import com.facebook.datasource.DataSource;
import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.imagepipeline.datasource.BaseBitmapDataSubscriber;
import com.facebook.imagepipeline.image.CloseableImage;
import com.facebook.imagepipeline.request.ImageRequest;
import com.facebook.imagepipeline.request.ImageRequestBuilder;

import java.util.concurrent.Executor;

/*
This class is maintained and inspired from
https://github.com/facebook/react-native/blob/master/ReactAndroid/src/main/java/com/facebook/react/views/image/ReactImageView.java
 */
public class GLImage {

    private Uri src;
    private GLTexture texture;
    private Runnable onLoad;
    private Executor glExecutor;
    private Executor decodeExecutor;
    private DataSource<CloseableReference<CloseableImage>> pending;

    public GLImage (Executor glExecutor, Executor decodeExecutor, Runnable onLoad) {
        this.onLoad = onLoad;
        this.glExecutor = glExecutor;
        this.decodeExecutor = decodeExecutor;
        this.texture = new GLTexture(glExecutor);
    }

    public void setSrc (Uri src) {
        if (this.src == src || this.src!=null && this.src.equals(src)) return;
        this.src = src;
        reloadImage();
    }

    private void reloadImage () {
        if (pending != null && !pending.isFinished())
            pending.close();

        final Uri uri = src;
        ImageRequest imageRequest = ImageRequestBuilder
                .newBuilderWithSource(uri)
                .setAutoRotateEnabled(false) // I don't really understand why need to disable this. but it actually fixes the image is properly rotated according to EXIF data
                .build();

        pending = Fresco.getImagePipeline().fetchDecodedImage(imageRequest, null);

        pending.subscribe(new BaseBitmapDataSubscriber() {
            @Override
            protected void onNewResultImpl(@Nullable Bitmap bitmap) {
                onLoad(bitmap);
            }
            @Override
            protected void onFailureImpl(DataSource<CloseableReference<CloseableImage>> dataSource) {
                Log.e("GLImage", "Failed to load '" + uri.getPath() + "'", dataSource.getFailureCause());
            }
        }, decodeExecutor);
    }

    public void onLoad (final Bitmap source) {
        Matrix matrix = new Matrix();
        matrix.postScale(1, -1);
        final Bitmap bitmap = Bitmap.createBitmap(source, 0, 0, source.getWidth(), source.getHeight(), matrix, true);
        bitmap.setHasAlpha(true);
        glExecutor.execute(new Runnable() {
            public void run() {
                texture.setPixels(bitmap);
                bitmap.recycle();
                onLoad.run();
            }
        });
    }

    public GLTexture getTexture() {
        return texture;
    }

    public static @Nullable Uri getResourceDrawableUri (Context context, @Nullable String name) {
        if (name == null || name.isEmpty()) {
            return null;
        }
        name = name.toLowerCase().replace("-", "_");
        int resId = context.getResources().getIdentifier(
                name,
                "drawable",
                context.getPackageName());
        return new Uri.Builder()
                .scheme(UriUtil.LOCAL_RESOURCE_SCHEME)
                .path(String.valueOf(resId))
                .build();
    }
}
