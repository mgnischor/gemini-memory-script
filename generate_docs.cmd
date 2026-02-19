@echo off
pdoc "%~dp0src\run.py" --output-dir "%~dp0docs\api"
echo Documentation generated in docs\api\
