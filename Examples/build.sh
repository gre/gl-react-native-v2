
for ex in */; do
  cd $ex;
  react-native bundle --minify;
  cd ..;
done;
