from mfrc522 import SimpleMFRC522
import time
import pycurl

# method to request to play
def request(id):
	print("Requesting....")
	print("http://localhost:5000/play?id="+id)
	# make post request on the running server
	curl("http://localhost:5000/play?id="+id)

# another way to request from the server
def curl(url):
	c = pycurl.Curl()

	c.setopt(c.URL, url)
	c.setopt(c.CUSTOMREQUEST, "POST")

	c.perform()
	c.close()

# continous reading method
def read(reader):
    curl("http://localhost:5000/nfc_ready?nfc_ready=true")
    while True:
        print("Reading...")
        nId, nText = reader.read()
        print("ID: %s\nText: %s \n" % (nId,nText))
        request(nText);
        # only read all 10 seconds
        time.sleep(10)
