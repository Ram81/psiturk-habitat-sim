#!/bin/bash
mode=$1

prefix=/home/ubuntu/psiturk-habitat-sim

rm ${prefix}/data/hit_data/visualisation/unapproved_hits.zip

source /home/ubuntu/venv/bin/activate && \
python "${prefix}/download_unapproved_hits.py" --db_path "participants" --dump_path "${prefix}/data/hit_data/visualisation/unapproved_hits" --prefix demo --mode $mode

zip -r ${prefix}/data/hit_data/visualisation/unapproved_hits.zip data/hit_data/visualisation/unapproved_hits

python upload_hits_to_s3.py