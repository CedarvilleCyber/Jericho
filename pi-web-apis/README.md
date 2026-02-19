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
chmod 755 sound-api
chown pi:pi sound-api
```

Next, set up the project with `uv` and run it with `gunicorn`:
Run these commands from the project directory.
```
uv sync
uv run gunicorn -b 0.0.0.0:8000 main:app
```

If you get an error about a Python interpreter version, make sure the project's
pyproject.toml doesn't require a Python version that's higher than the version
on your Pi. 

To log to a file, use the --access-logfile option to specify a path.
(Example: --access-logfile /var/log/scenario.log).
- Note: you'll have to configure permissions on the log file.
