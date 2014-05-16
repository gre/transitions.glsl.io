#!/bin/bash
 
REMOTE=play@glsl.io
REMOTE_APP=/home/play/glsl.io/

cd client;
grunt build-prod || exit 1;
cd ..;
cd server;
sbt stage || exit 2;
ssh $REMOTE "cd $REMOTE_APP; ./stop.sh";
rsync -va target/ $REMOTE:$REMOTE_APP/target
ssh $REMOTE "cd $REMOTE_APP; ./start.sh";
