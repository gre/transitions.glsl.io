#!/bin/bash

in=Sintel.2010.720p.mkv
out=../../server/public/videos/sintel
opts="-vcodec libvpx -quality good -b:v 3000k -an"
test -f $in || wget http://ftp.nluug.nl/pub/graphics/blender/demo/movies/$in
ffmpeg -i $in -ss 00:06:09.0 -t 00:00:05.0 $opts $out/cut1.webm
ffmpeg -i $in -ss 00:06:20.0 -t 00:00:05.0 $opts $out/cut2.webm
ffmpeg -i $in -ss 00:06:26.0 -t 00:00:05.0 $opts $out/cut3.webm

