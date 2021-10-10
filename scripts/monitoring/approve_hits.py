import argparse
import json
import requests
import sys
import time

from tqdm import tqdm


SERVER = "https://habitatonweb.cloudcv.org:8000"
APPROVE_HIT_API = "/api/v0/approve_hit"


def get_url(server, api):
    return "{}{}".format(server, api)


def read_json(path):
    f = open(path)
    return json.loads(f.read())


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
        time.sleep(1)


def read_all_hits(path="instructions.json"):
    hit_data = read_json(path)
    hit_ids = [ep["episodeId"]for ep in hit_data]
    return hit_ids


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--path", type=str, default="instructions.json"
    )
    args = parser.parse_args()
    # hit_ids = read_all_hits(args.path)
    hit_ids = ['A3FSDH6HUZPNQ8:3EFVCAY5L5CY5TCSAOJ6PA6E8G1J8U', 'A21ZK49H9LSSRY:39LOEL67OU8NKFA373RJ93PPCJG383', 'A2TUUIV61CR0C7:35GMH2SV3GKTF5DG34XBPGJMID6EO4', 'A2TUUIV61CR0C7:3OVR4I9USRME8FT3TBD25Z2VKPU4QW', 'debugXMMYj:debugugziu', 'A2TUUIV61CR0C7:3PZDLQMM0VO0B04XKFTJSFGGWWXC23', 'A2TUUIV61CR0C7:38YMOXR4MW2X7ZT3O85NUM4V4HH6WN', 'A3FSDH6HUZPNQ8:3TMSXRD2X8320DS6I2T6ZQDEW611WK', 'A2TUUIV61CR0C7:30OG32W0SWEBXKD42PXYARJHS31ENP', 'A2TUUIV61CR0C7:3YW4XOSQKSOP8931N2E5H2SHBQQ1UL', 'A21ZK49H9LSSRY:3IOEN3P9S9M46YD0RKG21WE184C16N', 'A272X64FOZFYLB:3Z4AIRP3C8GHPDXWS7PS19RL5871XD', 'A3FSDH6HUZPNQ8:3OS46CRSLH2KSATYYY0R8KLHX8F6VD', 'A2TUUIV61CR0C7:34HJIJKLP7Z6DNPKFA7CBM131H94VQ', 'A2TUUIV61CR0C7:3LRKMWOKB7KDJTF7CTDR3DH15EMZ2S', 'A2TUUIV61CR0C7:39GAF6DQWT3PLOS1SSOADOU0PX71VI', 'A3FSDH6HUZPNQ8:3570Y55XZRM3TXD9FMWXRA2093KGYY', 'A3FSDH6HUZPNQ8:3EJPLAJKEOJ11UY8ZVPUTQYDLJL6ZD', 'A2TUUIV61CR0C7:34T446B1C2HTFQ1J5SP59RN1ZYDC0J', 'A21ZK49H9LSSRY:3ZOTGHDK5KEUPOIY4ZHGEXN1J4MOSM']
    print("Total submitted HITs: {}".format(len(hit_ids)))
    approve_all_hits(hit_ids)
