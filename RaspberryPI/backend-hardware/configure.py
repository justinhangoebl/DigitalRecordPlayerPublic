from mfrc522 import SimpleMFRC522

# Write the Input to the Tag
def write(reader):
    print("Place your tag to write")
    text = input('Input Song ID:')
    reader.write(text)
    print("Written")
