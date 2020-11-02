import json
import numpy as np
import pandas as pd

from sqlalchemy import create_engine, MetaData, Table

db_url = "sqlite:///experiment_data/data_10_31_2020_1.db"
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
statusess = []
for row in rows:
    # only use subjects who completed experiment and aren't excluded
    statusess.append(row['status'])
    if row['status'] in statuses and row['uniqueid'] not in exclude:
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

# Put all subjects' trial data into a dataframe object from the
# 'pandas' python library: one option among many for analysis
data_frame = pd.DataFrame(output_data)
data_frame.to_csv("./data_1.csv", index=False, headers=False)

print(data_frame.columns.values)