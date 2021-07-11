import json
import requests
import time

from tqdm import tqdm


SERVER = "https://habitatonweb.cloudcv.org:8000"
APPROVE_HIT_API = "/api/v0/approve_hit"


def get_url(server, api):
    return "{}{}".format(server, api)


def post_request(url, data):
    response = requests.post(url, data=data)
    return response


def approve_hits(hit_id):
    data = {
        "authToken": "",
        "mode": "live",
        "uniqueId": hit_id,
        "isApproved": True
    }
    url = get_url(SERVER, APPROVE_HIT_API)
    response = post_request(url, json.dumps(data))
    return response


def approve_all_hits(hit_ids):
    for hit_id in tqdm(hit_ids):
        response = approve_hits(hit_id)
        time.sleep(2)


if __name__ == "__main__":
    hit_ids = [] #
    approve_all_hits(hit_ids)
