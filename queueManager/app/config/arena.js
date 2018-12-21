const Config = {
  queues: [
    {
      name: "A",
      port: 6379,
      host: "127.0.0.1",
      hostId: "QueueManager-A"
    },
    {
      name: "B",
      port: 6379,
      host: "127.0.0.1",
      hostId: "QueueManager-B"
    },
    {
      name: "C",
      port: 6379,
      host: "127.0.0.1",
      hostId: "QueueManager-C"
    }
  ]
}

module.exports = Config