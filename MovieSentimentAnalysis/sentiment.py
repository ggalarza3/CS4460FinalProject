import csv
import requests
import json
from collections import defaultdict

import time

columns = defaultdict(list)
api_key = "9d09e3eaf5c9d83571571676c9b52bc4"
endpoint = "https://api.meaningcloud.com/sentiment-2.1"

def RateLimited(maxPerSecond):
    minInterval = 1.0 / float(maxPerSecond)
    def decorate(func):
        lastTimeCalled = [0.0]
        def rateLimitedFunction(*args,**kargs):
            elapsed = time.clock() - lastTimeCalled[0]
            leftToWait = minInterval - elapsed
            if leftToWait>0:
                time.sleep(leftToWait)
            ret = func(*args,**kargs)
            lastTimeCalled[0] = time.clock()
            return ret
        return rateLimitedFunction
    return decorate

@RateLimited(2)
def sendRequest(keywords):
	if keywords == "":
		csvwriter.writerow({'Sentiment': '', 'Confidence': ''})
		return
	payload = {'key': api_key, 'lang': 'en', 'txt': keywords}
	r = requests.post(endpoint, data=payload)
	jsonResponse = json.loads(r.text)
	print r.text
	score_tag = jsonResponse['score_tag']
	print score_tag
	confidence = jsonResponse["confidence"]
	if score_tag == "P+":
		csvwriter.writerow({'Sentiment': 'Strong Positive', 'Confidence': confidence})
	elif score_tag == "P":
		csvwriter.writerow({'Sentiment': 'Positive', 'Confidence': confidence})
	elif score_tag == "NEU":
		csvwriter.writerow({'Sentiment': 'Neutral', 'Confidence': confidence})
	elif score_tag == "N":
		csvwriter.writerow({'Sentiment': 'Negative', 'Confidence': confidence})
	elif score_tag == "N+":
		csvwriter.writerow({'Sentiment': 'Strong Negative', 'Confidence': confidence})
	else:
		csvwriter.writerow({'Sentiment': 'Without Sentiment', 'Confidence': confidence})

if __name__ == "__main__":
	with open('movie_metadata.csv', 'rb') as csvfile, open('newmovie_data.csv', 'wb') as newcsv:
		sentimentReader = csv.DictReader(csvfile)
		fieldnames = ['Sentiment'] + ['Confidence']
		csvwriter = csv.DictWriter(newcsv, fieldnames)
		csvwriter.writeheader()
		
		for row in sentimentReader:
			for (k, v) in row.items():
				columns[k].append(v)
			length = len(columns[k])
		for x in range(1574, length):
			keywords = columns['plot_keywords'][x]
			print keywords
			sendRequest(keywords)
		



