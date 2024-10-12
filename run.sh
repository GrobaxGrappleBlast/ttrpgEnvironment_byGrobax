#!/bin/bash

# Define the directories and commands
DIR1="./"
DIR2="./srcFileServer/main/"
DIR3="./TSFrontEnd/"

COMMAND_DOCKER="docker run -it -p 9001:3306 my_db  "
COMMAND_NET="dotnet run"
COMMAND_NPM="npm run dev2"


xfce4-terminal -e "bash -c 'cd \"$DIR1\" && $COMMAND_DOCKER; exec bash'" &
DOCKER_PID=$!
xfce4-terminal -e "bash -c 'cd \"$DIR3\" && $COMMAND_NPM; exec bash'" &
NPM_PID=$!
xfce4-terminal -e "bash -c 'cd \"$DIR2\" && $COMMAND_NET; exec bash'" &
NET_PID=$!

# Wait for all background processes to completebra
wait $DOCKER_PID
wait $NPM_PID
wait $NET_PID

echo "All commands have been executed."
echo "$NPM_PID" > npm.pid
echo "$NET_PID" > net.pid