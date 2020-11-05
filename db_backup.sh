#!/usr/bin/env bash
path=$(date +'%m-%d-%Y-%H')
mkdir -p /home/ubuntu/backup/db/$path/
cp ${PWD}/participants.db /home/ubuntu/backup/db/$path/participants.db