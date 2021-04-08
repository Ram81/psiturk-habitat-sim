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
    time.sleep(15)
    response = post_request(API_ENDPOINT, json.dumps(data))
    return response


def create_hits_from_list(tasks=[], episode_ids=[], batch_size=10):
    episode_data = defaultdict(list)
    start_episode_index = 0
    for i in range(0, len(episode_ids), batch_size):
        start_episode_index = i
        batch_end_index = start_episode_index + batch_size
        for task_id in tasks:
            episode_data[task_id] = episode_ids[start_episode_index:batch_end_index]

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
        time.sleep(15)
        response = post_request(API_ENDPOINT, json.dumps(data))
        print(response)


def create_all_hits(tasks, start_episode_index, end_episode_index, batch_size):
    while start_episode_index < end_episode_index:
        response = create_hits(tasks, start_episode_index, end_episode_index, batch_size)
        print(response)
        print("\n")
        start_episode_index += batch_size


if __name__ == "__main__":
    task_ids = [15, 16, 17, 18, 19]
    start_episode_index = 0
    end_episode_index = 5
    batch_size = 5
    create_all_hits(task_ids, start_episode_index, end_episode_index, batch_size)
    # tasks = [14]
    # episode_ids = [530, 36]
    # create_hits_from_list(tasks, episode_ids)

