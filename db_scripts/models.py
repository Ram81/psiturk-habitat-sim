from psiturk.db import db_session, engine
from psiturk.models import Base
from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean, func, inspect


Base.query = db_session.query_property()

def object_as_dict(self, filter_these: list = None):
    if filter_these is None:
        filter_these = []
    return {c.key: getattr(self, c.key) for c in
            inspect(self).mapper.column_attrs if c.key not in filter_these}


Base.object_as_dict = object_as_dict


class WorkerHitData(Base):
    """
    Object representation of a task performed by a participant in the database.
    """
    __tablename__ = "worker_hit_data"

    uniqueid = Column(String(128), primary_key=True)
    hit_id = Column(String(128), nullable=False)
    assignment_id = Column(String(128), nullable=False)
    worker_id = Column(String(128), nullable=False)
    task_id = Column(Integer)
    episode_id = Column(Integer)
    task_in_progress = Column(Boolean)
    task_start_time = Column(DateTime)
    flythrough_complete = Column(Boolean)
    training_task_complete = Column(Boolean)
    task_complete = Column(Boolean)
    task_end_time = Column(DateTime)
    training_end_time = Column(DateTime)
    flythrough_end_time = Column(DateTime)
    mode = Column(String(128))

    def __repr__(self):
        return "<User(uniqueid='%s')>" % (self.uniqueid)


def create_table():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    create_table()

