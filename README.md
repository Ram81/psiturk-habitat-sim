## Psiturk Habitat Sim

### Setup

1. Optionally create and activate a Python virtual env for psiTurk.
2. Download the test data from this [link](https://drive.google.com/file/d/1lhyv4Xh4rmGeQauJBOOWpV3mJl2CbRdN/view?usp=sharing) and extract locally.
3. `pip install -r requirements.txt` in the `psiturk-habitat` directory.
4. Optionally set a unique psiturk server port in `config.txt` and point to it in `nginx.conf`. (default:8080)
5. Optionally set an additional unique HTTP endpoint port in `nginx.conf`. (default: 8000)
6. Run `psiturk -e "server on"` from within the `psiturk-habitat` directory.
7. Copy/move the `nginx.conf` file to `/etc/nginx/sites-available/some-unique-config-name`
8. `ln -s /etc/nginx/sites-available/name-of-your-config /etc/nginx/sites-enabled/` to enable the new nginx server conf.
9. `service nginx reload`
10. You likely want to add the following to your local `.ssh/config` to access the server locally: `LocalForward 8000 127.0.0.1:8000`, replacing 8000 with your endpoint port.
11. Open http://localhost:8000/ or http://localhost:YOUR_ENDPOINT_PORT/ in your browser. Note that you must use 'localhost' instead of '127.0.0.1' as the compiled habitat-sim application will attempt to load scene data from S3 otherwise.
