# syntax=docker/dockerfile:1

# FROM python:3.11-alpine
FROM jupyter/minimal-notebook

#RUN apk update 
#RUN apk add tmux bash

# switch to root to install packages
USER root 

# The --no-cache removes the need for apk update and
# keeps the resulting image smaller
# bash git gcc linux-headers py3-psutil

RUN apt-get update && apt-get install bash 
RUN pip install ipython svgwrite ipykernel jupyterlab

# Switch back to jovyan to avoid accidental container runs as root
USER ${NB_UID}