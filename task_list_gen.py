import json
import requests
import time

from collections import defaultdict


API_ENDPOINT = ""


def post_request(url, data):
    response = requests.post(url, data=data)
    return response


def create_hits(tasks=[], start_episode_index=0, end_episode_index=10, batch_size=10):
    episode_data = defaultdict(list)

    batch_end_index = start_episode_index + batch_size
    while start_episode_index < batch_end_index and start_episode_index < end_episode_index:
        for task_id in tasks:
            episode_data[task_id].append(start_episode_index)
        start_episode_index += 1

    data = {
        "authToken": "",
        "mode": "live",
        "numAssignments": 1,
        "numWorkers": 1,
        "reward": 0.5,
        "duration": 1.5,
        "taskEpsiodeMap": episode_data
    }
    print(data)
    response = post_request(API_ENDPOINT, json.dumps(data))
    return response


def create_all_hits(tasks, start_episode_index, end_episode_index, batch_size):
    while start_episode_index < end_episode_index:
        response = create_hits(tasks, start_episode_index, end_episode_index, batch_size)
        print(response)
        print("\n")
        time.sleep(20)
        start_episode_index += batch_size


if __name__ == "__main__":
    task_ids = [6, 7, 8, 9]
    start_episode_index = 145
    end_episode_index = 150
    batch_size = 5
    create_all_hits(task_ids, start_episode_index, end_episode_index, batch_size)
