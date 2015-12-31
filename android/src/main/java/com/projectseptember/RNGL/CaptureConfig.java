package com.projectseptember.RNGL;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;


public class CaptureConfig {
    String format;
    String type;
    String filePath;
    Double quality;

    public CaptureConfig(String format, String type, String filePath, Double quality) {
        this.format = format;
        this.type = type;
        this.filePath = filePath;
        this.quality = quality;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        CaptureConfig that = (CaptureConfig) o;

        if (format != null ? !format.equals(that.format) : that.format != null) return false;
        if (type != null ? !type.equals(that.type) : that.type != null) return false;
        if (filePath != null ? !filePath.equals(that.filePath) : that.filePath != null)
            return false;
        return !(quality != null ? !quality.equals(that.quality) : that.quality != null);

    }

    @Override
    public int hashCode() {
        int result = format != null ? format.hashCode() : 0;
        result = 31 * result + (type != null ? type.hashCode() : 0);
        result = 31 * result + (filePath != null ? filePath.hashCode() : 0);
        result = 31 * result + (quality != null ? quality.hashCode() : 0);
        return result;
    }

    public static CaptureConfig fromMap (ReadableMap map) {
        return new CaptureConfig(
                map.getString("format"),
                map.getString("type"),
                map.getString("filePath"),
                map.getDouble("quality")
        );
    }

    public WritableMap   toMap () {
        WritableMap map = Arguments.createMap();
        map.putString("format", format);
        map.putString("type", type);
        map.putString("filePath", filePath);
        map.putDouble("quality", quality);
        return map;
    }

}
