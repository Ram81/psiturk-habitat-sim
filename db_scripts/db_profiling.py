import datetime
import json
import os

from psiturk.db import db_session, engine
from psiturk.models import Base, Participant
from psiturk.psiturk_statuses import *

from sqlalchemy import or_, exc
from collections import Counter
from random import choice



def get_worker_assignment(worker_id, assignment_id):
    cutofftime = datetime.timedelta(minutes=-30)
    starttime = datetime.datetime.now(datetime.timezone.utc) + cutofftime

    numconds = 1
    numcounts = 1
    mode = 'live'

    participants = Participant.query.\
        filter(Participant.codeversion == 1.0).\
        filter(Participant.mode == mode).\
        filter(or_(Participant.status == COMPLETED,
                   Participant.status == CREDITED,
                   Participant.status == SUBMITTED,
                   Participant.status == BONUSED,
                   Participant.beginhit > starttime)).all()
    counts = Counter()
    for cond in range(numconds):
        for counter in range(numcounts):
            counts[(cond, counter)] = 0
    for participant in participants:
        condcount = (participant.cond, participant.counterbalance)
        if condcount in counts:
            counts[condcount] += 1
    mincount = min(counts.values())
    minima = [hsh for hsh, count in counts.items() if count == mincount]
    chosen = choice(minima)
    print(chosen)



if __name__ == "__main__":
    get_worker_assignment("A2CWA5VQZ6IWMQ", "36GJS3V78XTBCOKG3KQTS3RNDGQGJI")