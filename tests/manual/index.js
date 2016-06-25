let Class = new Fiber.Class();
let State = new Fiber.State({'key': 7});

let Bag = new Fiber.Bag({item: 1, key: 2});

for (let [key, value] of Bag.iterator()) {
  console.log(key, value); // todo: remove
}

let Model = new Fiber.Model({
  name: 'Igor',
  surname: 'Krimerman'
}, {

  schema: true

});

console.log(Model.serialize()); // todo: remove

Model.set('account', '1000000000$');
console.log(Model.all()); // todo: remove


let Monitor = new Fiber.Monitor();
Monitor.watch(Model);
