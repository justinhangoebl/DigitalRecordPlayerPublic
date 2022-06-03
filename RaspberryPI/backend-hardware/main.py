from read import read
from configure import write
from mfrc522 import SimpleMFRC522
import sys
import RPi.GPIO as GPIO

if __name__ == "__main__":

    print("Configuring NFC RFID\n")
    reader = SimpleMFRC522()
    print("Successfully Configure NFC RFID\n")

    # When the configure Flag is set we want to write a new Song onto the Card
    try:
        if(sys.argv[0] == 'config' or sys.argv[0] == 'Config'):
            write(reader)
        read(reader)
    finally:
        GPIO.cleanup()
