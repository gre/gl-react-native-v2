
for ex in */; do
  cd $ex;
  rm -rf node_modules;
  npm i;
  cd ..;
done;
