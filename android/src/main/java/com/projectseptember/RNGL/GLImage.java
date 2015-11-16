package com.projectseptember.RNGL;

import android.content.Context;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.net.Uri;
import android.os.AsyncTask;
import android.provider.MediaStore;
import android.support.annotation.Nullable;

import com.facebook.common.util.UriUtil;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

/*
This class is maintained and inspired from
https://github.com/facebook/react-native/blob/master/ReactAndroid/src/main/java/com/facebook/react/views/image/ReactImageView.java
also inspired from
https://github.com/CyberAgent/android-gpuimage/blob/master/library/src/jp/co/cyberagent/android/gpuimage/GPUImage.java
 */
public class GLImage {
    private final Context context;
    private Uri src;
    private GLTexture texture;

    private boolean isDirty;
    private AsyncTask<Void, Void, Bitmap> task;
    private Runnable onload;
    private RunInGLThread glScheduler;

    public GLImage (Context context, RunInGLThread glScheduler, Runnable onload) {
        this.context = context;
        this.onload = onload;
        this.glScheduler = glScheduler;
        this.texture = new GLTexture();
    }

    public void setSrc(Uri src) {
        if (this.src == src) return;
        this.src = src;
        reloadImage();
    }

    private void reloadImage () {
        isDirty = true;
    }

    public void onLoad (final Bitmap bitmap) {
        glScheduler.runInGLThread(new Runnable() {
            public void run() {
                texture.setPixels(bitmap);
                onload.run();
            }
        });
    }

    public GLTexture getTexture() {
        if (isDirty) {
            if (task != null) task.cancel(true);
            task = new LoadImageUriTask(this, src).execute();
            isDirty = false;
        }
        return texture;
    }

    public static @Nullable Uri getResourceDrawableUri(Context context, @Nullable String name) {
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


    private class LoadImageUriTask extends LoadImageTask {

        private final Uri mUri;

        public LoadImageUriTask(GLImage gpuImage, Uri uri) {
            super(gpuImage);
            mUri = uri;
        }

        @Override
        protected Bitmap decode(BitmapFactory.Options options) {
            try {
                InputStream inputStream;
                if (mUri.getScheme().startsWith("http") || mUri.getScheme().startsWith("https")) {
                    inputStream = new URL(mUri.toString()).openStream();
                } else {
                    inputStream = context.getContentResolver().openInputStream(mUri);
                }
                return BitmapFactory.decodeStream(inputStream, null, options);
            } catch (Exception e) {
                e.printStackTrace();
            }
            return null;
        }

        @Override
        protected int getImageOrientation() throws IOException {
            Cursor cursor = context.getContentResolver().query(mUri,
                    new String[] { MediaStore.Images.ImageColumns.ORIENTATION }, null, null, null);

            if (cursor == null || cursor.getCount() != 1) {
                return 0;
            }

            cursor.moveToFirst();
            int orientation = cursor.getInt(0);
            cursor.close();
            return orientation;
        }
    }

    /*
    private class LoadImageFileTask extends LoadImageTask {

        private final File mImageFile;

        public LoadImageFileTask(GLImage gpuImage, File file) {
            super(gpuImage);
            mImageFile = file;
        }

        @Override
        protected Bitmap decode(BitmapFactory.Options options) {
            return BitmapFactory.decodeFile(mImageFile.getAbsolutePath(), options);
        }

        @Override
        protected int getImageOrientation() throws IOException {
            ExifInterface exif = new ExifInterface(mImageFile.getAbsolutePath());
            int orientation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, 1);
            switch (orientation) {
                case ExifInterface.ORIENTATION_NORMAL:
                    return 0;
                case ExifInterface.ORIENTATION_ROTATE_90:
                    return 90;
                case ExifInterface.ORIENTATION_ROTATE_180:
                    return 180;
                case ExifInterface.ORIENTATION_ROTATE_270:
                    return 270;
                default:
                    return 0;
            }
        }
    }
    */

    private abstract class LoadImageTask extends AsyncTask<Void, Void, Bitmap> {

        private GLImage glImage;

        public LoadImageTask (GLImage glImage) {
            this.glImage = glImage;
        }

        @Override
        protected Bitmap doInBackground(Void... params) {
            return loadResizedImage();
        }

        @Override
        protected void onPostExecute(Bitmap bitmap) {
            super.onPostExecute(bitmap);
            glImage.onLoad(bitmap);
        }

        protected abstract Bitmap decode(BitmapFactory.Options options);

        private Bitmap loadResizedImage() {
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;
            decode(options);
            options = new BitmapFactory.Options();
            options.inPreferredConfig = Bitmap.Config.RGB_565;
            options.inTempStorage = new byte[32 * 1024];
            Bitmap bitmap = decode(options);
            if (bitmap == null) {
                return null;
            }

            Bitmap transformedBitmap;
            Matrix matrix = new Matrix();

            try {
                int orientation = getImageOrientation();
                if (orientation != 0) {
                    matrix.postRotate(orientation);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }

            matrix.postScale(1, -1);

            transformedBitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
            bitmap.recycle();

            return transformedBitmap;
        }

        protected abstract int getImageOrientation() throws IOException;
    }
}
