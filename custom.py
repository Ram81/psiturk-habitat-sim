# this file imports custom routes into the experiment server
import datetime
import pytz
import numpy as np

from flask import Blueprint, render_template, request, jsonify, Response, abort, current_app
from jinja2 import TemplateNotFound
from functools import wraps
from sqlalchemy import or_, and_

from psiturk.psiturk_config import PsiturkConfig
from psiturk.experiment_errors import ExperimentError, InvalidUsage
from psiturk.user_utils import PsiTurkAuthorization, nocache

# # Database setup
from psiturk.db import db_session, init_db
from psiturk.models import Participant
from json import dumps, loads

from db_scripts.models import WorkerHitData

# load the configuration options
config = PsiturkConfig()
config.load_config()
# if you want to add a password protect route use this
myauth = PsiTurkAuthorization(config)

# explore the Blueprint
custom_code = Blueprint('custom_code', __name__,
                        template_folder='templates', static_folder='static')


utc=pytz.UTC


def is_valid_request(request_data):
    if not "hitId" in request_data.keys() or not "workerId" in request_data.keys() or not "assignmentId" in request_data.keys():
        return False
    return True


def get_unique_task_id(task_id, episode_id):
    return "{}:{}".format(task_id, episode_id)


def get_current_time():
    return datetime.datetime.now(datetime.timezone.utc)


def is_incomplete_hit_data(worker_hit_data):
    current_time = get_current_time()
    # Check if HIT was completed
    if worker_hit_data.task_complete:
        return False

    # Check if HIT was started 30 minutes ago and is still in progress
    task_start_time = worker_hit_data.task_start_time.replace(tzinfo=utc)
    time_diff_in_minutes = (current_time - task_start_time).total_seconds() / 60.0
    if time_diff_in_minutes > 10 and worker_hit_data.task_in_progress:
        return True
    return False


def get_worker_hit_data(unique_id):
    try:
        return WorkerHitData.query.get(unique_id)
    except Exception:
        return None


def create_worker_hit_data(unique_id, task_id, worker_id, assignment_id, hit_id, episode_id):
    try:
        worker_hit_data = get_worker_hit_data(unique_id)
        if worker_hit_data is None:
            worker_hit_data = WorkerHitData(
                uniqueid=unique_id,
                task_id=task_id,
                worker_id=worker_id,
                assignment_id=assignment_id,
                hit_id=hit_id,
                episode_id=episode_id,
                task_in_progress=True,
                task_start_time=get_current_time()
            )
            db_session.add(worker_hit_data)
        else:
            if worker_hit_data.task_complete:
                return None, "already_complete"
            worker_hit_data.task_id = task_id
            worker_hit_data.worker_id = worker_id
            worker_hit_data.assignment_id = assignment_id
            worker_hit_data.hit_id = hit_id
            worker_hit_data.episode_id = episode_id
            worker_hit_data.task_in_progress = True
            worker_hit_data.task_start_time = get_current_time()
        db_session.commit()

        return worker_hit_data, None
    except Exception as e:
        current_app.logger.error("Error saving {}".format(e))
        return None, "error"


@custom_code.route("/api/v0/completed_episodes", methods=['POST'])
def get_completed_episodes():
    # Print message to server.log for debugging
    current_app.logger.info("Reached /api/v0/completed_episodes")

    request_data = loads(request.data)
    if not is_valid_request(request_data) or not request_data.get("taskIds") or not request_data.get("episodeIds") or not request_data.get("perEpisodeLimit"):
        current_app.logger.error("Error /api/v0/completed_episodes misssing inputs!")
        raise ExperimentError("improper_inputs")

    try:
        hit_id = request_data["hitId"]
        worker_id = request_data["workerId"]
        assignment_id = request_data["assignmentId"]
        task_ids = request_data["taskIds"]
        episode_ids = request_data["episodeIds"]
        task_episode_limit = request_data["perEpisodeLimit"]

        episodes = WorkerHitData.query.\
            filter(WorkerHitData.hit_id == hit_id)

        task_episode_id_hit_count_map = {}
        for episode in episodes:
            task_id = episode.task_id
            episode_id = episode.episode_id
            unique_task_id = get_unique_task_id(task_id, episode_id)

            # Ignore incomplete HITs when counting in limit
            if is_incomplete_hit_data(episode):
                continue
            if not task_episode_id_hit_count_map.get(unique_task_id):
                task_episode_id_hit_count_map[unique_task_id] = 0
            task_episode_id_hit_count_map[unique_task_id] += 1

        worker_episodes = WorkerHitData.query.\
            filter(WorkerHitData.worker_id == worker_id)
        
        worker_task_episode_map = {}
        for worker_episode in worker_episodes:
            task_id = worker_episode.task_id
            episode_id = worker_episode.episode_id
            unique_task_id = get_unique_task_id(task_id, episode_id)
            # Ignore incomplete HITs when counting in limit
            if is_incomplete_hit_data(worker_episode):
                continue
            if not worker_task_episode_map.get(unique_task_id):
                worker_task_episode_map[unique_task_id] = 0
            worker_task_episode_map[unique_task_id] += 1
        
        # Check if worker has already completed all episodes and find available episodes
        all_episode_completed = True
        eligible_task_episode = []
        for task_id in task_ids:
            for episode_id in episode_ids:
                unique_task_id = get_unique_task_id(task_id, episode_id)
                if not worker_task_episode_map.get(unique_task_id):
                    all_episode_completed = False
                    # Fetch episode count and check if it is less than limit
                    episode_count = task_episode_id_hit_count_map.get(unique_task_id)
                    if not episode_count or episode_count < task_episode_limit:
                        eligible_task_episode.append(unique_task_id)

        if all_episode_completed:
            response = {"all_episodes_completed": all_episode_completed}
            return jsonify(**response)
        
        if len(eligible_task_episode) == 0:
            response = {"no_episodes_available": True}
            return jsonify(**response)
        
        # Allocate the task episode slot
        idx = np.random.choice(len(eligible_task_episode))
        task_id = int(eligible_task_episode[idx].split(":")[0])
        episode_id = int(eligible_task_episode[idx].split(":")[1])

        unique_id = "{}:{}".format(worker_id, assignment_id)
        worker_hit_data, result = create_worker_hit_data(
            unique_id, task_id, worker_id,
            assignment_id, hit_id, episode_id
        )

        if worker_hit_data is None or result == "error":
            response = {"retry": True}
            return jsonify(**response)
        
        if result == "already_complete":
            response = {"already_complete": True}
            return jsonify(**response)

        response = {
            "taskId": task_id,
            "episodeId": episode_id
        }
        return jsonify(**response)

    except TemplateNotFound:
        abort(404)


@custom_code.route('/api/v0/worker_hit_complete', methods=['POST'])
def worker_hit_complete():
    request_data = loads(request.data)
    current_app.logger.error("Data /api/v0/worker_hit_complete {}".format(request_data))
    if not is_valid_request(request_data):
        raise ExperimentError('improper_inputs')
    unique_id = "{}:{}".format(request_data["workerId"], request_data["assignmentId"])
    try:
        worker_hit_data = get_worker_hit_data(unique_id)

        worker_hit_data.flythrough_complete = request_data["flythroughComplete"]
        worker_hit_data.training_task_complete = request_data["trainingTaskComplete"]
        worker_hit_data.task_complete = request_data["taskComplete"]
        worker_hit_data.task_end_time = datetime.datetime.now(datetime.timezone.utc)
        db_session.commit()
        resp = {"worker_hit_data_added": "success"}
        return jsonify(**resp)
    except Exception as e:
        current_app.logger.error("Error /api/v0/worker_hit_complete {}".format(e))
        abort(404)  # again, bad to display HTML, but...


@custom_code.route('/api/v0/worker_flythrough_training_skip', methods=['POST'])
def worker_flythrough_training_skip():
    request_data = loads(request.data)
    current_app.logger.error("Data /api/v0/worker_hit_complete {}".format(request_data))
    if not "workerId" in request_data.keys():
        raise ExperimentError('improper_inputs')

    try:
        worker_id = request_data["workerId"]
        flythrough_seen_count = WorkerHitData.query.\
            filter(and_(WorkerHitData.flythrough_complete == True, WorkerHitData.worker_id == worker_id)).count()

        flythrough_seen = (flythrough_seen_count > 0)
        
        training_task_seen_count = WorkerHitData.query.\
            filter(and_(WorkerHitData.training_task_complete == True, WorkerHitData.worker_id == worker_id)).count()
        
        training_task_seen = (training_task_seen_count > 0)

        resp = {
            "flythrough_complete": flythrough_seen,
            "training_task_complete": training_task_seen,
        }
        current_app.logger.error("Data /api/v0/completed_episodes misssing {}".format(resp))
        return jsonify(**resp)
    except Exception as e:
        current_app.logger.error("Error /api/v0/worker_hit_complete {}".format(e))
        abort(404)  # again, bad to display HTML, but...
