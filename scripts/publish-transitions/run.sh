#!/bin/bash

cd `dirname $0`

NOW_VERSION=`date '+%Y.%-m.%-d'`
SERVER=${1-"https://glsl.io"}
VERSION=${1-$NOW_VERSION}

cd target || exit 1

git pull origin master || exit 2

rm -f transitions.glsl
curl $SERVER/api/snapshots/transitions > transitions.json || exit 3

node test.js || exit 4

npm version $VERSION || exit 5

npm publish || exit 6

git commit -a -m"$VERSION" && git push origin master
