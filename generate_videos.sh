#!/usr/bin/env bash
wget https://habitatonweb.cloudcv.org:8000/data/hit_data/visualisation/unapproved_hits.zip
unzip unapproved_hits.zip -d data/hit_data/
python psiturk_dataset/parser.py --replay-path data/hit_data/unapproved_hits --output-path data/hit_data/hit_visualisation/hits_2021_01_16.json
python examples/rearrangement_replay.py --replay-episode data/hit_data/hit_visualisation/hits_2021_01_16.json.gz --output-prefix demo --restore-state
zip -r unapproved_hits_demos.zip demos/
zip -r unapproved_hits_instructions.zip instructions.json
rm unapproved_hits.zip
