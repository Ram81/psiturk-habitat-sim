import json
import requests
import time

from collections import defaultdict


API_ENDPOINT = "https://habitatonweb.cloudcv.org:8000/api/v0/approve_hit"


def post_request(url, data):
    response = requests.post(url, data=data)
    return response


def approve_hits(hit_id):
    data = {
        "authToken": "mySNBpBySb",
        "mode": "live",
        "uniqueId": hit_id,
        "isApproved": True
    }
    print(data)
    response = post_request(API_ENDPOINT, json.dumps(data))
    return response


def approve_all_hits(hit_ids):
    for hit_id in hit_ids:
        print("Approving hit: {}".format(hit_id))
        response = approve_hits(hit_id)
        print(response)
        print("\n")
        time.sleep(2)


if __name__ == "__main__":
    hit_ids = [
    ]
    approve_all_hits(hit_ids)
