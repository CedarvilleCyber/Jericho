# Overview
This README document walks through the process of setting up one of these API
services on a Raspberry Pi Zero.

First, install UV on the Pi: 
```
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Next, reboot your shell so you can use UV. (Close, then re-open the terminal.)
Now, copy the project directory onto the pi. You can use SCP or git clone.

Move the project directory (ex: `sound-api`) into `/opt`. Next, set permissions
and ownership on the project directory to your chosen user. 
To set the sound API up, do this (assuming the user is named "pi"):
```
mv sound-api /opt
chmod 644 /opt/sound-api/
chown pi:pi /opt/sound-api/
```

Next, set up the project with `uv` and run it with `gunicorn`:
Run these commands from the project directory.
```
uv sync
uv run gunicorn -b 0.0.0.0:8000 main:app

# to log to /var/log/api: 
uv run gunicorn -b 0.0.0.0:8000 main:app --access-logfile /var/log/api

# to log to stdout (the terminal): 
uv run gunicorn -b 0.0.0.0:8000 main:app --access-logfile -
```
# Python Interpreter Errors
If you get an error about a Python interpreter version:
- `uv python list` -> write down python version
- make sure python version in pyproject.toml is less than or equal to your version
- `rm .python-version` (could be a relic from a machine with a higher python version)
# Logging
Note that if you choose to set up logging with --acccess-logfile, you will likely
have to configure permissions to allow gunicorn to access that file. Ex: 
```
sudo chown pi:pi /var/log/api
sudo chmod 644 /var/log/api
```
