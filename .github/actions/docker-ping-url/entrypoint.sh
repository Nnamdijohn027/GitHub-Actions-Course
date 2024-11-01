# .github/actions/docker-ping-url/entrypoint.sh

#!/bin/sh
url=$1
max_trials=$2
delay=$3

for i in $(seq 1 "$max_trials"); do
  echo "Pinging $url - Trial $i of $max_trials"
  curl -s --head "$url" || echo "Ping failed"
  sleep "$delay"
done
