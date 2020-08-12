## Psiturk Habitat Sim

### Setup

1. Optionally create and activate a Python virtual env for psiTurk.
2. `pip install -r requirements.txt` in the `psiturk-habitat` directory.
3. Optionally set a unique psiturk server port in `config.txt` and point to it in `nginx.conf`. (default:8080)
4. Optionally set an additional unique HTTP endpoint port in `nginx.conf`. (default: 8000)
5. Run `psiturk -e "server on"` from within the `psiturk-habitat` directory.
6. Copy/move the `nginx.conf` file to `/etc/nginx/sites-available/some-unique-config-name`
7. `ln -s /etc/nginx/sites-available/name-of-your-config /etc/nginx/sites-enabled/` to enable the new nginx server conf.
8. `service nginx reload`
9. You likely want to add the following to your local `.ssh/config` to access the server locally: `LocalForward 8000 127.0.0.1:8000`, replacing 8000 with your endpoint port.
10. Open http://localhost:8000/ or http://localhost:YOUR_ENDPOINT_PORT/ in your browser. Note that you must use 'localhost' instead of '127.0.0.1' as the compiled habitat-sim application will attempt to load scene data from S3 otherwise.
