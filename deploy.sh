#!/bin/bash

branch=`git rev-parse --abbrev-ref HEAD`
# We assume that branch==domain if you are using this script (convention)

REMOTE_USER=play
REMOTE=$branch
REMOTE_APP=/home/play/

echo "Will upload to... "$REMOTE_USER@$REMOTE":"$REMOTE_APP;
sleep 2 || exit;

cd scripts;
./pre-deploy.sh || exit -1;
cd -;

export NODE_ENV="production";
cd client;
npm install || exit 1;
grunt build || exit 2;
cd -;

cd server;
sbt stage || exit 3;
rsync -va target/ $REMOTE_USER@$REMOTE:$REMOTE_APP/target
ssh $REMOTE "service playapp restart"
