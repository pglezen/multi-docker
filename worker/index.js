const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const sub = redisClient.duplicate();

function fib(index) {
  if (index < 2) return 1;
  return fib(index-1) + fib(index-2);
}

sub.on('subscribe', (channel, count) => {
  console.log(`Worker subscribed to ${channel}. Subscription count = ${count}.`);
});

sub.on('message', (channel, message) => {
  console.log(`Worker received ${channel} message: ${message}.`);
  const fibValue = fib(parseInt(message));
  console.log(`Worker calculated Fib value ${fibValue}.`);
  redisClient.hset('values', message, fibValue);
});

sub.subscribe('insert');
