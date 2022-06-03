from kafka import KafkaConsumer#
import json

# server on which the Broker runs
bootstrap_servers = ['localhost:9092']

# desired topic name for the Consumer
topicName = 'ID'


consumer = KafkaConsumer (topicName, group_id ='group1',bootstrap_servers = bootstrap_servers)

if __name__ == "__main__":
    # Read and print message from consumer
    for msg in consumer:
        print("Topic Name=%s,Message=%s"%(msg.topic,msg.value))

        # Terminate the script
        sys.exit()
