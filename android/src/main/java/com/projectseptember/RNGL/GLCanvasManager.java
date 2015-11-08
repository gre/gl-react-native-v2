package com.projectseptember.RNGL;

import android.opengl.GLSurfaceView;

import com.facebook.react.uimanager.CatalystStylesDiffMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;


public class GLCanvasManager extends SimpleViewManager<GLSurfaceView> {

  public static final String REACT_CLASS = "GLCanvas";

  // TODO... props

  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Override
  public GLSurfaceView createViewInstance(ThemedReactContext context) {
    GLSurfaceView view = new GLSurfaceView(context);
    view.setRenderer(new GLSurfaceView.Renderer() {
      @Override
      public void onSurfaceCreated(GL10 gl, EGLConfig config) {

      }

      @Override
      public void onSurfaceChanged(GL10 gl, int width, int height) {
        gl.glViewport(0, 0, width, height);
      }

      @Override
      public void onDrawFrame(GL10 gl) {
        gl.glClearColor(1.0f, 0.0f, 0.0f, 1.0f);
        gl.glClear(GL10.GL_COLOR_BUFFER_BIT);
      }
    });
    return view;
  }

  @Override
  public void updateView(final GLSurfaceView view, final CatalystStylesDiffMap props) {
    super.updateView(view, props);
    // TODO... call setters with props
    // view.requestRender();
  }
}
