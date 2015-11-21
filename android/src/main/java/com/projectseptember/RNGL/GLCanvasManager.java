package com.projectseptember.RNGL;

import android.support.annotation.Nullable;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ReactProp;

import java.util.Locale;


public class GLCanvasManager extends SimpleViewManager<GLCanvas> {

    public static final String REACT_CLASS = "GLCanvas";

    @ReactProp(name="nbContentTextures")
    public void setNbContentTextures (GLCanvas view, int nbContentTextures) {
        view.setNbContentTextures(nbContentTextures);
    }
    @ReactProp(name="renderId")
    public void setRenderId (GLCanvas view, int renderId) {
        view.setRenderId(renderId);
    }

    @ReactProp(name="opaque")
    public void setOpaque (GLCanvas view, boolean opaque) {
        view.setOpaque(opaque);
    }

    @ReactProp(name="autoRedraw")
    public void setAutoRedraw (GLCanvas view, boolean autoRedraw) {
        view.setAutoRedraw(autoRedraw);
    }

    @ReactProp(name="eventsThrough")
    public void setEventsThrough (GLCanvas view, boolean eventsThrough) {
        view.setEventsThrough(eventsThrough);
    }

    @ReactProp(name="visibleContent")
    public void setVisibleContent (GLCanvas view, boolean visibleContent) {
        view.setVisibleContent(visibleContent);
    }

    @ReactProp(name="captureNextFrameId")
    public void setCaptureNextFrameId (GLCanvas view, int captureNextFrameId) {
        view.setCaptureNextFrameId(captureNextFrameId);
    }

    @ReactProp(name="data")
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
        return new GLCanvas(context);
    }
}
