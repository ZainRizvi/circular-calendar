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

RUN apt-get update && apt-get install bash imagemagick -y
RUN pip install ipython svgwrite ipykernel jupyterlab 

# setup imagemagick as per https://stackoverflow.com/a/53180170/21539
# invoke via `convert mygraph.svg mygraph.pdf`
RUN head -n -1 /etc/ImageMagick-6/policy.xml > tmp.xml && cat tmp.xml > /etc/ImageMagick-6/policy.xml && rm tmp.xml && \
    echo '  <policy domain="coder" rights="read | write" pattern="PDF" />' >> /etc/ImageMagick-6/policy.xml && \
    echo '</policymap>' >> /etc/ImageMagick-6/policy.xml

# Switch back to jovyan to avoid accidental container runs as root
USER ${NB_UID}