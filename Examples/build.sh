
for ex in */; do
  cd $ex;
  #rm -rf node_modules;
  #npm i;
  npm i gl-react-native;
  react-native bundle --minify;
  cd ..;
done;
