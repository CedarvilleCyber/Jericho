# Overview
This README document walks through the process of setting up one of these API
services on a Raspberry Pi Zero.

First, install UV on the Pi: 
```
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Next, reboot your shell so you can use UV. (Close, then re-open the terminal.)
Now, copy the project directory onto the pi. You can use SCP or git clone.

Next, set up the project with `uv` and run it with `gunicorn`:
```
uv sync
uv run gunicorn -b 0.0.0.0:8000 main:app
```

To log to a file, use the --access-logfile option to specify a path.
(Example: --access-logfile /var/log/scenario.log).
- Note: you'll have to configure permissions on the log file.
