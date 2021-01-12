import argparse
import json
import numpy as np
import pandas as pd
import sys

from sqlalchemy import create_engine, MetaData, Table
from psiturk.db import db_session, engine
from db_scripts.models import ApprovedHits
from datetime import datetime, timedelta


def get_approved_unique_ids():
    try:
        all_approved_hits = ApprovedHits.query.all()
        unique_ids = [hit.uniqueid for hit in all_approved_hits]
        return unique_ids
    except:
        print("Fetch all approved HITs failed!!")
        #sys.exit(1)
        return []


def dump_hit_data(db_path, dump_path, dump_prefix, from_date, mode="sandbox"):
    db_url = "sqlite:///" + db_path
    table_name = "turkdemo"
    data_column_name = "datastring"
    # boilerplace sqlalchemy setup
    engine = create_engine(db_url)
    metadata = MetaData()
    metadata.bind = engine
    table = Table(table_name, metadata, autoload=True)
    # make a query and loop through
    s = table.select()
    rows = s.execute()

    data = []
    #status codes of subjects who completed experiment
    statuses = [3, 4, 5, 7]
    # if you have workers you wish to exclude, add them here
    exclude = []

    # Exclude already approved hits    
    already_approved_unique_ids = get_approved_unique_ids()
    exclude.extend(already_approved_unique_ids)

    #print(rows[0].keys())

    for row in rows:
        #hit_date = datetime.strptime(row['endhit'], "%Y-%m-%d %H:%M:%S.%f")
        hit_date = row['endhit']
        if row['mode'] != mode:
            continue
        # only use subjects who completed experiment and aren't excluded
        if row['status'] in statuses and row['uniqueid'] not in exclude and from_date < hit_date:
            data.append(row[data_column_name])

    # Now we have all participant datastrings in a list.
    # Let's make it a bit easier to work with:

    # parse each participant's datastring as json object
    # and take the 'data' sub-object
    output_data = []

    for part in data:
        output_data.extend(json.loads(part)['data'])

    # insert uniqueid field into trialdata in case it wasn't added
    # in experiment:
    for record in output_data:
        record['trialdata']['uniqueid'] = record['uniqueid']
        record['trialdata'] = json.dumps(record['trialdata'])
    
    df = pd.DataFrame(output_data)
    print(df.columns.values)
    print(len(df.uniqueid.unique()))

    split_hit_data_as_csv(df, dump_path, dump_prefix)


def split_hit_data_as_csv(df, dump_path, dump_prefix):
    gdf = df.groupby("uniqueid")
    group_indices = [gdf.get_group(key) for key in gdf.groups]

    i = 0
    for group in group_indices:
        group_df = group.copy()
        group_df = group_df.reset_index(drop=True)
        
        print("HIT: {}, Length: {}".format(i, len(group_df)))
        group_df.to_csv("{}/{}_{}.csv".format(dump_path, dump_prefix, i), index=False, header=False)
        i += 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--db_path", type=str, default="participants.db"
    )
    parser.add_argument(
        "--dump_path", type=str, default="../habitat-lab/data/hit_data"
    )
    parser.add_argument(
        "--prefix", type=str, default="hit_data"
    )
    parser.add_argument(
        "--mode", type=str, default="sandbox"
    )
    parser.add_argument(
        "--from-date", type=str, default="2020-11-01"
    )
    args = parser.parse_args()

    from_date = datetime.strptime(args.from_date, "%Y-%m-%d %H:%M")
    print("from: " + str(from_date))

    dump_hit_data(args.db_path, args.dump_path, args.prefix, from_date, args.mode)
