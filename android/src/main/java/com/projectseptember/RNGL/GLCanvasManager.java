package com.projectseptember.RNGL;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.bridge.JavaScriptModule;

public class GLCanvasManager extends SimpleViewManager<GLCanvasView> {

  public static final String REACT_CLASS = "GLCanvas";

  // TODO... props

  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Override
  public GLCanvasView createViewInstance(ThemedReactContext context) {
    return new GLCanvasView(context, Fresco.newDraweeControllerBuilder(), mCallerContext);
  }

  @Override
  public void updateView(final ReactImageView view, final CatalystStylesDiffMap props) {
    super.updateView(view, props);
    // TODO... call setters with props
    view.maybeUpdateView();
  }
}
