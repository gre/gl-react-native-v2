Pod::Spec.new do |s|

  s.name         = "RNGL"
  s.version      = "2.42.1"
  s.author       = "Project September"
  s.summary      = "OpenGL bindings for React Native to implement complex effects over images and components"
  s.homepage     = "https://github.com/ProjectSeptemberInc/gl-react-native"
  s.platform     = :ios, "8.0"
  s.source       = { :git => "https://github.com/ProjectSeptemberInc/gl-react-native.git", :tag => "v2.42.1" }
  s.source_files = "ios/*.{h,m}"
  s.license      = "MIT"

end
