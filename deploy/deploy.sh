#!/bin/bash

git pull && npm version patch && git push &&

TIMESTAMP=`date +%Y-%m-%d-%H-%M-%S` &&
RELEASE_DIR="/srv/web/frameboy.xyz" &&
BUN="/home/ubuntu/.bun/bin/bun" &&

echo "Copy .env.production to the shared directory and link..." &&
scp .env.production oracle:$RELEASE_DIR/.env &&

ssh oracle "
  cd $RELEASE_DIR &&
  git checkout bun.lockb &&
  git pull &&
  $BUN install" &&

echo "Reloading process..." &&
ssh oracle "pm2 reload frameboy --update-env --node-args='--no-warnings=ExperimentalWarning'" &&

echo "_________" &&
echo "Deploy completed successfully on $TIMESTAMP"

