#!/bin/bash

formats="512x512 600x400 1024x768"

in="./raw";
dist="../server/public/images"
tmp="./tmp_out";

rm -rf $tmp;
for format in $formats; do
  mkdir -p $tmp/$format;
  for name in `ls $in`; do
    echo "Generating $format/$name";
    convert $in/$name -resize "$format^" -gravity center -crop "$format+0+0" +repage $tmp/$format/$name;
  done;
done;

rm -rf $dist;
mv $tmp $dist;
