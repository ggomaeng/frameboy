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
  $BUN install &&
  npx prisma migrate deploy &&
  npx prisma generate &&
  mkdir .next-$TIMESTAMP &&
  BUILD_DIR=".next-$TIMESTAMP" npm run build &&
  ln -sfn .next-$TIMESTAMP .next" &&

echo "Reloading process..." &&
ssh oracle "pm2 reload derivative-art --update-env --node-args='--no-warnings=ExperimentalWarning'" &&

echo "_________" &&
echo "Deploy completed successfully on $TIMESTAMP" &&

echo "Cleaning up old releases..." &&
ssh oracle "find $RELEASE_DIR/.next-20* -mtime +3 -type d -exec rm -rf {} \;" &&
ssh oracle "df -lh | grep root" 

