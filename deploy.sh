#!/bin/bash
 
branch=`git rev-parse --abbrev-ref HEAD`
# We assume that branch==domain if you are using this script (convention)

REMOTE=play@$branch
REMOTE_APP=/home/play/$branch/

echo "Will upload to... "$REMOTE":"$REMOTE_APP;
sleep 2 || exit;

cd images;
./generate.sh || exit -1;
cd -;

export NODE_ENV="production";
cd client;
npm install || exit 1;
grunt build || exit 2;
cd -;

cd server;
sbt stage || exit 3;
rsync -va target/ $REMOTE:$REMOTE_APP/target
ssh $REMOTE "cd $REMOTE_APP; ./stop.sh";
ssh $REMOTE "cd $REMOTE_APP; ./start.sh";
