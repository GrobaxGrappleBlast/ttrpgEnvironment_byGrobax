#!/bin/bash


## KILL DOCKER FIRST 
# Define the commands to find and stop processes
COMMAND_DOCKER="docker ps -q --filter ancestor=my_db"

# Stop the Docker container
DOCKER_CONTAINER_ID=$($COMMAND_DOCKER)
if [ -n "$DOCKER_CONTAINER_ID" ]; then
    docker stop $DOCKER_CONTAINER_ID
    echo "Stopped Docker container: $DOCKER_CONTAINER_ID"
else
    echo "No running Docker container found."
fi


# Clean up PID files
rm -f npm.pid net.pid

echo "All processes have been stopped."
