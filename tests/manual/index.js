let Class = new Fiber.Class();
let State = new Fiber.State({'key': 7});

let serializedClass = Class.serialize();
let serializedState = State.serialize();

let upState = State.set('new', 'value');
