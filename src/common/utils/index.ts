import { KafkaContext, RmqContext } from '@nestjs/microservices';

export const ackMessage = (context: RmqContext) => {
  const channel = context.getChannelRef();
  const originalMsg = context.getMessage();

  channel.ack(originalMsg);
};

export const commitMessage = async (context: KafkaContext) => {
  const { offset } = context.getMessage();
  const consumer = context.getConsumer();
  const topic = context.getTopic();
  const partition = context.getPartition();

  await consumer.commitOffsets([
    { topic, partition, offset: (Number(offset) + 1).toString() },
  ]);
};
