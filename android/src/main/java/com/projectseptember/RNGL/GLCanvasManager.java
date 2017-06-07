package com.projectseptember.RNGL;

import android.support.annotation.Nullable;

import com.facebook.imagepipeline.core.DefaultExecutorSupplier;
import com.facebook.imagepipeline.core.ExecutorSupplier;
import com.facebook.imagepipeline.memory.PoolConfig;
import com.facebook.imagepipeline.memory.PoolFactory;
import com.facebook.infer.annotation.Assertions;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.PointerEvents;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Locale;
import java.util.Map;


public class GLCanvasManager extends SimpleViewManager<GLCanvas> {

    public static final String REACT_CLASS = "GLCanvas";

    public static final int COMMAND_CAPTURE_FRAME = 1;

    private ExecutorSupplier executorSupplier;

    @ReactProp(name="pixelRatio")
    public void setPixelRatio (GLCanvas view, float pixelRatio) {
        view.setPixelRatio(pixelRatio);
    }

    @ReactProp(name="nbContentTextures")
    public void setNbContentTextures (GLCanvas view, int nbContentTextures) {
        view.setNbContentTextures(nbContentTextures);
    }

    @ReactProp(name="renderId")
    public void setRenderId (GLCanvas view, int renderId) {
        view.setRenderId(renderId);
    }

    @ReactProp(name = "autoRedraw")
    public void setAutoRedraw (GLCanvas view, boolean autoRedraw) {
        view.setAutoRedraw(autoRedraw);
    }

    @ReactProp(name = "overlay")
    public void setZOrderMediaOverlay(GLCanvas view, boolean overlay) {
        view.setZOrderMediaOverlay(overlay);
    }

    @ReactProp(name = "setZOrderOnTop")
    public void setZOrderOnTop (GLCanvas view, boolean setZOrderOnTop) {
        view.setZOrderOnTop(setZOrderOnTop);
    }

    @ReactProp(name = "backgroundColor")
    public void setBackgroundColor (GLCanvas view, Integer color) {
        view.setBackgroundColor(color);
    }

    @ReactProp(name = "pointerEvents")
    public void setPointerEvents(GLCanvas view, @Nullable String pointerEventsStr) {
        if (pointerEventsStr != null) {
            PointerEvents pointerEvents = PointerEvents.valueOf(pointerEventsStr.toUpperCase(Locale.US).replace("-", "_"));
            view.setPointerEvents(pointerEvents);
        }
    }

    @ReactProp(name = "data")
    public void setData (GLCanvas view, @Nullable ReadableMap data) {
        view.setData(data == null ? null : GLData.fromMap(data));
    }

    @ReactProp(name="imagesToPreload")
    public void setImagesToPreload (GLCanvas view, @Nullable ReadableArray imageToPreload) {
        view.setImagesToPreload(imageToPreload);
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public GLCanvas createViewInstance (ThemedReactContext context) {
        if (executorSupplier == null) {
            PoolFactory poolFactory = new PoolFactory(PoolConfig.newBuilder().build());
            int numCpuBoundThreads = poolFactory.getFlexByteArrayPoolMaxNumThreads();
            executorSupplier = new DefaultExecutorSupplier(numCpuBoundThreads);
        }
        return new GLCanvas(context, executorSupplier);
    }

    @Override
    public void receiveCommand(
            GLCanvas canvas,
            int commandType,
            @Nullable ReadableArray args) {
        Assertions.assertNotNull(canvas);
        Assertions.assertNotNull(args);
        switch (commandType) {
            case COMMAND_CAPTURE_FRAME: {
                canvas.requestCaptureFrame(CaptureConfig.fromMap(args.getMap(0)));
                return;
            }
            default:
                throw new IllegalArgumentException(String.format(
                        "Unsupported command %d received by %s.",
                        commandType,
                        getClass().getSimpleName()));
        }
    }

    @Override
    public @Nullable Map getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.of(
                "captureFrame",
                MapBuilder.of("registrationName", "onGLCaptureFrame"),
                "load",
                MapBuilder.of("registrationName", "onGLLoad"),
                "progress",
                MapBuilder.of("registrationName", "onGLProgress")
        );
    }

    @Override
    public Map<String,Integer> getCommandsMap() {
        return MapBuilder.of(
                "captureFrame",
                COMMAND_CAPTURE_FRAME);
    }
}
