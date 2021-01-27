#!/bin/bash

unzip unapproved_hits_demos.zip
unzip unapproved_hits_instructions.zip

cp /home/ubuntu/visualisation/instructions.json /home/ubuntu/psiturk-habitat-sim/data/hit_data/
cp /home/ubuntu/visualisation/demos/* /home/ubuntu/psiturk-habitat-sim/data/hit_data/video/