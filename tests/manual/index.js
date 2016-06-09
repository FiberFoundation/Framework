var obj = Fiber.Events.$new();

obj.after('event', function() {
  console.log('Event triggered'); // todo: remove
});

obj.fire('event');
