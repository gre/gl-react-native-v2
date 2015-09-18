
for ex in */; do
  cd $ex;
  rm -rf node_modules;
  npm i;
  react-native bundle --minify;
  cd ..;
done;
