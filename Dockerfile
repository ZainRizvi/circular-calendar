# syntax=docker/dockerfile:1

FROM python:3.11-alpine

#RUN apk update 
#RUN apk add tmux bash

# The --no-cache removes the need for apk update and
# keeps the resulting image smaller
RUN apk add --no-cache bash git
RUN pip install ipython svgwrite