const Config = {
  queues: [
    {
      name: "A",
      port: 6379,
      host: "127.0.0.1",
      hostId: "QueueManager-A",
      type: "bee"
    },
    {
      name: "B",
      port: 6379,
      host: "127.0.0.1",
      hostId: "QueueManager-B",
      type: "bee"
    },
    {
      name: "C",
      port: 6379,
      host: "127.0.0.1",
      hostId: "QueueManager-C",
      type: "bee"
    }
  ]
}

module.exports = Config