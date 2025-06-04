# Use the official Node.js runtime as the base image
FROM node:18-bullseye

# Set the working directory in the container
WORKDIR /workspace

# Install additional system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages that are commonly useful for development
RUN npm install -g \
    @types/node \
    typescript \
    ts-node \
    nodemon \
    prettier \
    eslint

# Create a non-root user for development
RUN useradd -m -s /bin/bash devcontainer && \
    usermod -aG sudo devcontainer && \
    echo "devcontainer ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Switch to the non-root user
USER devcontainer

# Set the working directory for the user
WORKDIR /workspace

# Copy package files if they exist (this will be done when container starts)
# COPY package*.json ./

# The container will start in /workspace which will be mapped to your project directory

# Keep the container running
CMD ["tail", "-f", "/dev/null"] 