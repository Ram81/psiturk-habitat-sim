#!/usr/bin/env bash

python download_unapproved_hits.py --db_path participants.db --dump_path data/hit_data/visualisation/unapproved_hits --prefix demo --mode live
cd data/hit_data/visualisation/
zip -r unapproved_hits.zip unapproved_hits