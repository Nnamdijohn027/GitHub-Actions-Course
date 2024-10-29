import os
import time
import requests

def ping_url(url, delay, max_trials):
    trials = 0
    while trials < max_trials:
        try:
            response = requests.get(url)
            if response.status_code == 200:
                return True
            else:
                trials += 1
                time.sleep(delay)
        except requests.exceptions.RequestException:
            trials += 1
            time.sleep(delay)
    return False

def run():
    url = os.environ['INPUT_URL']
    delay = int(os.environ['INPUT_DELAY'])
    max_trials = int(os.environ['INPUT_MAX_TRIALS'])

    if not ping_url(url, delay, max_trials):
        raise Exception(f"Failed to reach {url} after {max_trials} trials.")

if __name__ == "__main__":
    run()
