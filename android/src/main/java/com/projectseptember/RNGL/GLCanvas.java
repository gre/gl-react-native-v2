package com.projectseptember.RNGL;

import static android.opengl.GLES20.*;

import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.PixelFormat;
import android.net.Uri;
import android.opengl.GLException;
import android.opengl.GLSurfaceView;
import android.util.Base64;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

import com.facebook.imagepipeline.core.ExecutorSupplier;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.PointerEvents;
import com.facebook.react.uimanager.ReactPointerEventsView;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import java.nio.IntBuffer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;
import java.util.concurrent.Executor;

import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;

public class GLCanvas extends GLSurfaceView
        implements GLSurfaceView.Renderer, Executor, ReactPointerEventsView {

    private ReactContext reactContext;
    private RNGLContext rnglContext;
    private boolean dirtyOnLoad = true;
    private boolean neverRendered = true;
    private boolean deferredRendering = false;
    private GLRenderData renderData;
    private int defaultFBO;

    private int nbContentTextures;
    private boolean autoRedraw;
    private GLData data;
    private List<Uri> imagesToPreload = new ArrayList<>();
    private List<Uri> preloaded = new ArrayList<>();

    private Map<Uri, GLImage> images = new HashMap<>();
    private List<GLTexture> contentTextures = new ArrayList<>();
    private List<Bitmap> contentBitmaps = new ArrayList<>();

    private Map<Integer, GLShader> shaders;
    private Map<Integer, GLFBO> fbos;
    private ExecutorSupplier executorSupplier;
    private final Queue<Runnable> mRunOnDraw = new LinkedList<>();

    private List<CaptureConfig> captureConfigs = new ArrayList<>();
    private float pixelRatio;

    private float displayDensity;

    public GLCanvas(ThemedReactContext context, ExecutorSupplier executorSupplier) {
        super(context);
        reactContext = context;
        this.executorSupplier = executorSupplier;
        rnglContext = context.getNativeModule(RNGLContext.class);
        setEGLContextClientVersion(2);

        DisplayMetrics dm = reactContext.getResources().getDisplayMetrics();
        displayDensity = dm.density;
        pixelRatio = dm.density;

        setEGLConfigChooser(8, 8, 8, 8, 16, 0);
        getHolder().setFormat(PixelFormat.RGB_888);
        setZOrderOnTop(false);

        setRenderer(this);
        setRenderMode(GLSurfaceView.RENDERMODE_WHEN_DIRTY);
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        syncContentBitmaps();
        requestRender();
    }

    public GLFBO getFBO (Integer id) {
        if (!fbos.containsKey(id)) {
            fbos.put(id, new GLFBO(this));
        }
        return fbos.get(id);
    }

    public GLShader getShader (Integer id) {
        if (!shaders.containsKey(id)) {
            GLShaderData shaderData = rnglContext.getShader(id);
            if (shaderData == null) return null;
            shaders.put(id, new GLShader(shaderData, id, rnglContext));
        }
        return shaders.get(id);
    }

    @Override
    public void onSurfaceCreated(GL10 gl, EGLConfig config) {
        fbos = new HashMap<>();
        shaders = new HashMap<>();
        images = new HashMap<>();
        contentTextures = new ArrayList<>();
        contentBitmaps = new ArrayList<>();
        renderData = null;
        requestSyncData();
    }

    @Override
    public void onSurfaceChanged(GL10 gl, int width, int height) {}

    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        syncSize(w, h, pixelRatio);
    }

    @Override
    public void onDrawFrame(GL10 gl) {
        runAll(mRunOnDraw);

        if (contentTextures.size() != this.nbContentTextures)
            resizeUniformContentTextures(nbContentTextures);

        if (haveRemainingToPreload()) {
            if (neverRendered) {
                neverRendered = false;
                glClearColor(0.0f, 0.0f, 0.0f, 0.0f);
                glClear(GL_COLOR_BUFFER_BIT);
            }
            return;
        }
        neverRendered = false;

        final boolean shouldRenderNow = deferredRendering || autoRedraw || nbContentTextures == 0;
        if (nbContentTextures > 0) {
            reactContext.runOnUiQueueThread(new Runnable() {
                public void run() {
                    syncContentBitmaps();
                    if (!deferredRendering) {
                        deferredRendering = true;
                        requestRender();
                    }
                }
            });
        }

        if (shouldRenderNow) {
            this.render();
            deferredRendering = false;
            if (captureConfigs.size() > 0) {
                capture(); // FIXME: maybe we should schedule this?
            }
        }
    }

    private void capture () {
        Bitmap capture = createSnapshot();
        ReactContext reactContext = (ReactContext)getContext();
        RCTEventEmitter eventEmitter = reactContext.getJSModule(RCTEventEmitter.class);

        for (CaptureConfig config : captureConfigs) {
            String result = null, error = null;
            boolean isPng = config.type.equals("png");
            boolean isJpeg = !isPng && (config.type.equals("jpg")||config.type.equals("jpeg"));
            boolean isWebm = !isPng && !isJpeg && config.type.equals("webm");
            boolean isBase64 = config.format.equals("base64");
            boolean isFile = !isBase64 && config.format.equals("file");

            Bitmap.CompressFormat compressFormat =
                isPng ? Bitmap.CompressFormat.PNG :
                isJpeg ? Bitmap.CompressFormat.JPEG :
                isWebm ? Bitmap.CompressFormat.WEBP :
                null;

            int quality = (int)(100 * config.quality);

            if (compressFormat == null) {
                error = "Unsupported capture type '"+config.type+"'";
            }
            else if (isBase64) {
                try {
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    capture.compress(compressFormat, quality, baos);
                    String frame = "data:image/png;base64,"+
                            Base64.encodeToString(baos.toByteArray(), Base64.DEFAULT);
                    baos.close();
                    result = frame;
                }
                catch (Exception e) {
                    e.printStackTrace();
                    error = "Could not capture as base64: "+e.getMessage();
                }
            }
            else if (isFile) {
                try {
                    FileOutputStream fileOutputStream = new FileOutputStream(config.filePath);
                    capture.compress(compressFormat, quality, fileOutputStream);
                    fileOutputStream.close();
                    result = "file://"+config.filePath;
                }
                catch (Exception e) {
                    e.printStackTrace();
                    error = "Could not write file: "+e.getMessage();
                }
            }
            else {
                error = "Unsupported capture format '"+config.format+"'";
            }

            WritableMap response = Arguments.createMap();
            response.putMap("config", config.toMap());
            if (error != null) response.putString("error", error);
            if (result != null) response.putString("result", result);
            eventEmitter.receiveEvent(getId(), "captureFrame", response);
        }

        captureConfigs = new ArrayList<>();
    }

    private boolean haveRemainingToPreload() {
        for (Uri uri: imagesToPreload) {
            if (!preloaded.contains(uri)) {
                return true;
            }
        }
        return false;
    }

    public void setNbContentTextures(int n) {
        this.nbContentTextures = n;
        requestRender();
    }

    public void setRenderId(int renderId) {
        if (nbContentTextures > 0) {
            if (!haveRemainingToPreload()) syncContentBitmaps();
            requestRender();
        }
    }

    @Override
    public void setBackgroundColor(int color) {
        super.setBackgroundColor(color & 0xFFFFFF);
        if (color == Color.TRANSPARENT) {
            this.getHolder().setFormat(PixelFormat.TRANSLUCENT);
        }
        else {
            this.getHolder().setFormat(PixelFormat.RGB_888);
        }
        this.requestRender();
    }

    public void setAutoRedraw(boolean autoRedraw) {
        this.autoRedraw = autoRedraw;
        this.setRenderMode(autoRedraw ? GLSurfaceView.RENDERMODE_CONTINUOUSLY : GLSurfaceView.RENDERMODE_WHEN_DIRTY);
    }

    public void setData (GLData data) {
        this.data = data;
        renderData = null;
        if (!haveRemainingToPreload()) syncContentBitmaps();
        requestSyncData();
    }


    public void setImagesToPreload (ReadableArray imagesToPreloadRA) {
        List<Uri> imagesToPreload = new ArrayList<>();
        for (int i=0; i<imagesToPreloadRA.size(); i++) {
            imagesToPreload.add(resolveSrc(imagesToPreloadRA.getMap(i).getString("uri")));
        }
        this.imagesToPreload = imagesToPreload;
        requestSyncData();
    }

    // Sync methods

    @Override
    public void execute (final Runnable runnable) {
        synchronized (mRunOnDraw) {
            mRunOnDraw.add(runnable);
            requestRender();
        }
    }
    private void runAll(Queue<Runnable> queue) {
        synchronized (queue) {
            while (!queue.isEmpty()) {
                queue.poll().run();
            }
        }
    }

    public void requestSyncData () {
        execute(new Runnable() {
            public void run() {
                // FIXME: maybe should set a flag so we don't do it twice??
                try {
                    if (!syncData())
                        requestSyncData();
                }
                catch (GLShaderCompilationFailed e) {
                    // This is ignored. It will be handled by RNGLContext.shaderFailedToCompile
                }
            }
        });
    }

    public static Bitmap captureView (View view) {
        int w = view.getWidth();
        int h = view.getHeight();
        if (w <= 0 || h <= 0)
            return Bitmap.createBitmap(2, 2, Bitmap.Config.ARGB_8888);
        Bitmap bitmap = view.getDrawingCache();
        if (bitmap == null)
            view.setDrawingCacheEnabled(true);
        bitmap = view.getDrawingCache();
        if (bitmap == null) {
            Log.e("GLCanvas", "view.getDrawingCache() is null. view="+view);
            return Bitmap.createBitmap(2, 2, Bitmap.Config.ARGB_8888);
        }
        Matrix matrix = new Matrix();
        matrix.postScale(1, -1);
        Bitmap reversed = Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
        return reversed;
    }

    /**
     * Snapshot the content views and save to contentBitmaps (must run in UI Thread)
     */
    public int syncContentBitmaps() {
        List<Bitmap> bitmaps = new ArrayList<>();
        ViewGroup parent = (ViewGroup) this.getParent();
        int count = parent == null ? 0 : parent.getChildCount() - 1;
        for (int i = 0; i < count; i++) {
            View view = parent.getChildAt(i);
            if (view instanceof ViewGroup) {
                ViewGroup group = (ViewGroup) view;
                if (group.getChildCount() == 1) {
                    // If the content container only contain one other container,
                    // we will use it for rasterization. That way we screenshot without cropping.
                    view = group.getChildAt(0);
                }
            }
            bitmaps.add(captureView(view));
        }
        contentBitmaps = bitmaps;

        return count;
    }

    /**
     * Draw contentBitmaps to contentTextures (must run in GL Thread)
     */
    public int syncContentTextures() {
        int size = Math.min(contentTextures.size(), contentBitmaps.size());
        for (int i=0; i<size; i++)
            contentTextures.get(i).setPixels(contentBitmaps.get(i));
        return size;
    }

    public void resizeUniformContentTextures (int n) {
        int length = contentTextures.size();
        if (length == n) return;
        if (n < length) {
            contentTextures = contentTextures.subList(0, n);
        }
        else {
            for (int i = contentTextures.size(); i < n; i++) {
                contentTextures.add(new GLTexture(this));
            }
        }
    }


    private int countPreloaded () {
        int nb = 0;
        for (Uri toload: imagesToPreload) {
            if (preloaded.contains(toload)) {
                nb++;
            }
        }
        return nb;
    }

    private void onImageLoad (Uri loaded) {
        preloaded.add(loaded);
        int count = countPreloaded();
        int total = imagesToPreload.size();
        double progress = ((double) count) / ((double) total);
        dispatchOnProgress(progress, count, total);
        dirtyOnLoad = true;
        requestSyncData();
    }

    public Uri resolveSrc (String src) {
        Uri uri = null;
        if (src != null) {
            try {
                uri = Uri.parse(src);
                // Verify scheme is set, so that relative uri (used by static resources) are not handled.
                if (uri.getScheme() == null) {
                    uri = null;
                }
            } catch (Exception e) {
                // ignore malformed uri, then attempt to extract resource ID.
            }
            if (uri == null) {
                uri = GLImage.getResourceDrawableUri(reactContext, src);
            }
        }
        return uri;
    }

    public Uri srcResource (ReadableMap res) {
        String src = null;
        boolean isStatic = res.hasKey("isStatic") && res.getBoolean("isStatic");
        if (res.hasKey("path")) src = res.getString("path");
        if (src==null || isStatic) src = res.getString("uri");
        return resolveSrc(src);
    }

    private GLRenderData recSyncData (GLData data, HashMap<Uri, GLImage> images) {
        Map<Uri, GLImage> prevImages = this.images;

        GLShader shader = getShader(data.shader);
        if (shader == null || !shader.ensureCompile()) return null;
        Map<String, Integer> uniformsInteger = new HashMap<>();
        Map<String, Float> uniformsFloat = new HashMap<>();
        Map<String, IntBuffer> uniformsIntBuffer = new HashMap<>();
        Map<String, FloatBuffer> uniformsFloatBuffer = new HashMap<>();
        Map<String,GLTexture> textures = new HashMap<>();
        List<GLRenderData> contextChildren = new ArrayList<>();
        List<GLRenderData> children = new ArrayList<>();

        for (GLData child: data.contextChildren) {
            GLRenderData node = recSyncData(child, images);
            if (node == null) return null;
            contextChildren.add(node);
        }

        for (GLData child: data.children) {
            GLRenderData node = recSyncData(child, images);
            if (node == null) return null;
            children.add(node);
        }

        Map<String, Integer> uniformTypes = shader.getUniformTypes();
        List<String> uniformNames = shader.getUniformNames();
        Map<String, Integer> uniformSizes = shader.getUniformSizes();

        int units = 0;
        ReadableMapKeySetIterator iterator = data.uniforms.keySetIterator();
        while (iterator.hasNextKey()) {
            String uniformName = iterator.nextKey();
            int type = uniformTypes.get(uniformName);
            int size = uniformSizes.get(uniformName);

            ReadableMap dataUniforms = data.uniforms;

            if (type == GL_SAMPLER_2D || type == GL_SAMPLER_CUBE) {
                uniformsInteger.put(uniformName, units++);

                if (dataUniforms.isNull(uniformName)) {
                    GLTexture emptyTexture = new GLTexture(this);
                    emptyTexture.setPixelsEmpty();
                    textures.put(uniformName, emptyTexture);
                }
                else {
                    ReadableMap value = null;
                    try {
                        value = dataUniforms.getMap(uniformName);
                    }
                    catch (Exception e) {
                        shader.runtimeException(
                        "texture uniform '"+uniformName+"': you cannot directly give require('./img.png') "+
                        "to gl-react, use resolveAssetSource(require('./img.png')) instead."
                        );
                        return null;
                    }
                    String t = value.getString("type");
                    if (t.equals("content")) {
                        int id = value.getInt("id");
                        if (id >= contentTextures.size()) {
                            resizeUniformContentTextures(id+1);
                        }
                        textures.put(uniformName, contentTextures.get(id));
                    }
                    else if (t.equals("fbo")) {
                        int id = value.getInt("id");
                        GLFBO fbo = getFBO(id);
                        textures.put(uniformName, fbo.color.get(0));
                    }
                    else if (t.equals("uri")) {
                        final Uri src = srcResource(value);
                        if (src == null) {
                            shader.runtimeException("texture uniform '"+uniformName+"': Invalid uri format '"+value+"'");
                        }

                        GLImage image = images.get(src);
                        if (image == null) {
                            image = prevImages.get(src);
                            if (image != null)
                                images.put(src, image);
                        }
                        if (image == null) {
                            image = new GLImage(this, executorSupplier.forDecode(), new Runnable() {
                                public void run() {
                                    onImageLoad(src);
                                }
                            });
                            image.setSrc(src);
                            images.put(src, image);
                        }
                        textures.put(uniformName, image.getTexture());
                    }
                    else {
                        shader.runtimeException("texture uniform '" + uniformName + "': Unexpected type '" + type + "'");
                    }
                }
            }
            else {
                if (size == 1) {
                    switch (type) {
                        case GL_INT:
                            uniformsInteger.put(uniformName, dataUniforms.getInt(uniformName));
                            break;

                        case GL_BOOL:
                            uniformsInteger.put(uniformName, dataUniforms.getBoolean(uniformName) ? 1 : 0);
                            break;

                        case GL_FLOAT:
                            uniformsFloat.put(uniformName, (float) dataUniforms.getDouble(uniformName));
                            break;

                        case GL_FLOAT_VEC2:
                        case GL_FLOAT_VEC3:
                        case GL_FLOAT_VEC4:
                        case GL_FLOAT_MAT2:
                        case GL_FLOAT_MAT3:
                        case GL_FLOAT_MAT4:
                            ReadableArray arr = dataUniforms.getArray(uniformName);
                            if (arraySizeForType(type) != arr.size()) {
                                shader.runtimeException(
                                        "uniform '"+uniformName+
                                                "': Invalid array size: "+arr.size()+
                                                ". Expected: "+arraySizeForType(type));
                            }
                            uniformsFloatBuffer.put(uniformName, parseAsFloatArray(arr));
                            break;

                        case GL_INT_VEC2:
                        case GL_INT_VEC3:
                        case GL_INT_VEC4:
                        case GL_BOOL_VEC2:
                        case GL_BOOL_VEC3:
                        case GL_BOOL_VEC4:
                            ReadableArray arr2 = dataUniforms.getArray(uniformName);
                            if (arraySizeForType(type) != arr2.size()) {
                                shader.runtimeException(
                                        "uniform '"+uniformName+
                                                "': Invalid array size: "+arr2.size()+
                                                ". Expected: "+arraySizeForType(type));
                            }
                            uniformsIntBuffer.put(uniformName, parseAsIntArray(arr2));
                            break;

                        default:
                            shader.runtimeException(
                                    "uniform '"+uniformName+
                                            "': type not supported: "+type);
                    }
                }
                else {
                    ReadableArray array = dataUniforms.getArray(uniformName);
                    if (size != array.size()) {
                        shader.runtimeException(
                                "uniform '"+uniformName+
                                        "': Invalid array size: "+array.size()+
                                        ". Expected: "+size);
                    }
                    for (int i=0; i<size; i++) {
                        String name = uniformName+"["+i+"]";
                        switch (type) {
                            case GL_INT:
                                uniformsInteger.put(name, array.getInt(i));
                                break;

                            case GL_BOOL:
                                uniformsInteger.put(name, array.getBoolean(i) ? 1 : 0);
                                break;

                            case GL_FLOAT:
                                uniformsFloat.put(name, (float) array.getDouble(i));
                                break;

                            case GL_FLOAT_VEC2:
                            case GL_FLOAT_VEC3:
                            case GL_FLOAT_VEC4:
                            case GL_FLOAT_MAT2:
                            case GL_FLOAT_MAT3:
                            case GL_FLOAT_MAT4:
                                ReadableArray arr = array.getArray(i);
                                if (arraySizeForType(type) != arr.size()) {
                                    shader.runtimeException(
                                            "uniform '"+name+
                                                    "': Invalid array size: "+arr.size()+
                                                    ". Expected: "+arraySizeForType(type));
                                }
                                uniformsFloatBuffer.put(name, parseAsFloatArray(arr));
                                break;

                            case GL_INT_VEC2:
                            case GL_INT_VEC3:
                            case GL_INT_VEC4:
                            case GL_BOOL_VEC2:
                            case GL_BOOL_VEC3:
                            case GL_BOOL_VEC4:
                                ReadableArray arr2 = array.getArray(i);
                                if (arraySizeForType(type) != arr2.size()) {
                                    shader.runtimeException(
                                            "uniform '"+name+
                                                    "': Invalid array size: "+arr2.size()+
                                                    ". Expected: "+arraySizeForType(type));
                                }
                                uniformsIntBuffer.put(name, parseAsIntArray(arr2));
                                break;

                            default:
                                shader.runtimeException(
                                        "uniform '"+name+
                                                "': type not supported: "+type);
                        }
                    }
                }
            }
        }

        int[] maxTextureUnits = new int[1];
        glGetIntegerv(GL_MAX_TEXTURE_IMAGE_UNITS, maxTextureUnits, 0);
        if (units > maxTextureUnits[0]) {
            shader.runtimeException("Maximum number of texture reach. got " + units + " >= max " + maxTextureUnits);
        }

        for (String uniformName: uniformNames) {
            int size = uniformSizes.get(uniformName);
            if (size == 1) {
                if (!uniformsFloat.containsKey(uniformName) &&
                        !uniformsInteger.containsKey(uniformName) &&
                        !uniformsFloatBuffer.containsKey(uniformName) &&
                        !uniformsIntBuffer.containsKey(uniformName)) {
                    shader.runtimeException("All defined uniforms must be provided. Missing '" + uniformName + "'");
                }
            }
            else {
                for (int i=0; i<size; i++) {
                    String name = uniformName+"["+i+"]";
                    if (!uniformsFloat.containsKey(name) &&
                            !uniformsInteger.containsKey(name) &&
                            !uniformsFloatBuffer.containsKey(name) &&
                            !uniformsIntBuffer.containsKey(name)) {
                        shader.runtimeException("All defined uniforms must be provided. Missing '" + name + "'");
                    }
                }
            }
        }

        return new GLRenderData(
                shader,
                uniformsInteger,
                uniformsFloat,
                uniformsIntBuffer,
                uniformsFloatBuffer,
                textures,
                (int)(data.width * data.pixelRatio),
                (int)(data.height * data.pixelRatio),
                data.fboId,
                contextChildren,
                children);
    }

    private FloatBuffer parseAsFloatArray(ReadableArray array) {
        int size = array.size();
        FloatBuffer buf = ByteBuffer.allocateDirect(size * 4)
                .order(ByteOrder.nativeOrder())
                .asFloatBuffer();
        for (int i=0; i<size; i++)
            buf.put((float) array.getDouble(i));
        buf.position(0);
        return buf;
    }

    private IntBuffer parseAsIntArray(ReadableArray array) {
        int size = array.size();
        IntBuffer buf = ByteBuffer.allocateDirect(size * 4)
                .order(ByteOrder.nativeOrder())
                .asIntBuffer();
        for (int i=0; i<size; i++)
            buf.put(array.getInt(i));
        buf.position(0);
        return buf;
    }

    private int arraySizeForType(int type) {
        switch (type) {
            case GL_FLOAT_VEC2:
            case GL_INT_VEC2:
            case GL_BOOL_VEC2:
                return 2;

            case GL_FLOAT_VEC3:
            case GL_INT_VEC3:
            case GL_BOOL_VEC3:
                return 3;

            case GL_FLOAT_VEC4:
            case GL_INT_VEC4:
            case GL_BOOL_VEC4:
            case GL_FLOAT_MAT2:
                return 4;

            case GL_FLOAT_MAT3:
                return 9;

            case GL_FLOAT_MAT4:
                return 16;

            default:
                throw new Error("Invalid array type: "+type);
        }
    }



    private boolean syncData () {
        if (data == null) return true;
        HashMap<Uri, GLImage> newImages = new HashMap<>();
        GLRenderData node = recSyncData(data, newImages);
        if (node == null) return false;
        Set<Uri> imagesGone = diff(this.images.keySet(), images.keySet());
        images = newImages;
        preloaded.removeAll(imagesGone);
        renderData = node;
        return true;
    }

    private void recRender (GLRenderData renderData) {
        int w = renderData.width;
        int h = renderData.height;
        for (GLRenderData child: renderData.contextChildren)
            recRender(child);

        for (GLRenderData child: renderData.children)
            recRender(child);

        if (renderData.fboId == -1) {
            glBindFramebuffer(GL_FRAMEBUFFER, defaultFBO);
            glViewport(0, 0, w, h);
            glBlendFunc(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
        }
        else {
            GLFBO fbo = getFBO(renderData.fboId);
            fbo.setShape(w, h);
            fbo.bind();
            glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        }

        renderData.shader.bind();

        for (String uniformName: renderData.textures.keySet()) {
            GLTexture texture = renderData.textures.get(uniformName);
            int unit = renderData.uniformsInteger.get(uniformName);
            texture.bind(unit);
        }

        Map<String, Integer> uniformTypes = renderData.shader.getUniformTypes();
        for (String uniformName: renderData.uniformsInteger.keySet()) {
            renderData.shader.setUniform(uniformName, renderData.uniformsInteger.get(uniformName));
        }
        for (String uniformName: renderData.uniformsFloat.keySet()) {
            renderData.shader.setUniform(uniformName, renderData.uniformsFloat.get(uniformName));
        }
        for (String uniformName: renderData.uniformsFloatBuffer.keySet()) {
            renderData.shader.setUniform(uniformName, renderData.uniformsFloatBuffer.get(uniformName), uniformTypes.get(uniformName));
        }
        for (String uniformName: renderData.uniformsIntBuffer.keySet()) {
            renderData.shader.setUniform(uniformName, renderData.uniformsIntBuffer.get(uniformName), uniformTypes.get(uniformName));
        }

        glClearColor(0.0f, 0.0f, 0.0f, 0.0f);
        glClear(GL_COLOR_BUFFER_BIT);
        glDrawArrays(GL_TRIANGLES, 0, 3);
    }

    private void render () {
        GLRenderData rd = renderData;
        if (rd == null) return;
        syncContentTextures();

        int[] defaultFBOArr = new int[1];
        glGetIntegerv(GL_FRAMEBUFFER_BINDING, defaultFBOArr, 0);
        defaultFBO = defaultFBOArr[0];
        glEnable(GL_BLEND);
        recRender(rd);
        glDisable(GL_BLEND);
        glBindFramebuffer(GL_FRAMEBUFFER, defaultFBO);
        glBindBuffer(GL_ARRAY_BUFFER, 0);

        if (dirtyOnLoad && !haveRemainingToPreload()) {
            dirtyOnLoad = false;
            dispatchOnLoad();
        }
    }

    private void dispatchOnProgress (double progress, int loaded, int total) {
        WritableMap event = Arguments.createMap();
        event.putDouble("progress", Double.isNaN(progress) ? 0.0 : progress);
        event.putInt("loaded", loaded);
        event.putInt("total", total);
        ReactContext reactContext = (ReactContext)getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "progress",
                event);
    }

    private void dispatchOnLoad () {
        WritableMap event = Arguments.createMap();
        ReactContext reactContext = (ReactContext)getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "load",
                event);
    }

    public void requestCaptureFrame (CaptureConfig config) {
        this.requestRender();
        for (CaptureConfig existing : captureConfigs) {
            if (existing.equals(config)) {
                return;
            }
        }
        captureConfigs.add(config);
    }

    private Bitmap createSnapshot () {
        return createSnapshot(0, 0, renderData.width, renderData.height);
    }

    private Bitmap createSnapshot (int x, int y, int w, int h) {
        int bitmapBuffer[] = new int[w * h];
        int bitmapSource[] = new int[w * h];
        IntBuffer intBuffer = IntBuffer.wrap(bitmapBuffer);
        intBuffer.position(0);

        try {
            glReadPixels(x, y, w, h, GL_RGBA, GL_UNSIGNED_BYTE, intBuffer);
            int offset1, offset2;
            for (int i = 0; i < h; i++) {
                offset1 = i * w;
                offset2 = (h - i - 1) * w;
                for (int j = 0; j < w; j++) {
                    int texturePixel = bitmapBuffer[offset1 + j];
                    int blue = (texturePixel >> 16) & 0xff;
                    int red = (texturePixel << 16) & 0x00ff0000;
                    int pixel = (texturePixel & 0xff00ff00) | red | blue;
                    bitmapSource[offset2 + j] = pixel;
                }
            }
        } catch (GLException e) {
            return null;
        }

        return Bitmap.createBitmap(bitmapSource, w, h, Bitmap.Config.ARGB_8888);
    }

    private PointerEvents mPointerEvents = PointerEvents.AUTO;

    @Override
    public PointerEvents getPointerEvents() {
        return mPointerEvents;
    }

    void setPointerEvents(PointerEvents pointerEvents) {
        mPointerEvents = pointerEvents;
    }

    static <A> Set<A> diff(Set<A> a, Set<A> b) {
        Set<A> d = new HashSet<>();
        d.addAll(a);
        d.removeAll(b);
        return d;
    }


    public void setPixelRatio(float pixelRatio) {
        this.pixelRatio = pixelRatio;
        syncSize(this.getWidth(), this.getHeight(), pixelRatio);
    }

    private void syncSize (int w, int h, float pixelRatio) {
        int width  = (int) (w * pixelRatio / displayDensity);
        int height = (int) (h * pixelRatio / displayDensity);
        getHolder().setFixedSize(width, height);
    }
}
