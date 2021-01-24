#!/bin/bash
mode=$1

prefix=/home/ubuntu/psiturk-habitat-sim
source venv/bin/activate && \
python "${prefix}/download_unapproved_hits.py" --db_path "${prefix}/participants.db" --dump_path "${prefix}/data/hit_data/visualisation/unapproved_hits" --prefix demo --mode $mode
cd "${prefix}/data/hit_data/visualisation"
zip -r unapproved_hits.zip unapproved_hits

