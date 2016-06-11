import TestSuite from '../support/TestSuite';
import Events  from '../../src/Events/Events';
import chai from 'chai';

const expect = chai.expect;
const Broadcast = Events.Broadcast;

var Suite = new TestSuite('Events', function () {

  before(function() {
    this.vent = new Events();
  });

  beforeEach(function() {
    this.vent.resetNsAndCatalog();
    this.vent.destroy();
    this.vent.destroyBroadcastEvents();
  });

  after(function() {
    delete this.vent;
  });

  it('`event`: should properly handled event with namespace and catalog look up.', function() {
    let eventName = this.vent.event('event');
    expect(eventName).to.equal('event');

    this.vent.ns = 'ns';
    eventName = this.vent.event('event');
    expect(eventName).to.equal('ns:event');

    this.vent.catalog.event = 'cataloged:event';
    eventName = this.vent.event('event');
    expect(eventName).to.equal('ns:cataloged:event');

    this.vent.ns = '';
    eventName = this.vent.event('event');
    expect(eventName).to.equal('cataloged:event');

    eventName = this.vent.event('!event');
    expect(eventName).to.equal('event');
  });

  it('`trigger`: should emit event with empty namespace and catalog.', function(done) {
    this.vent.ns = '';
    this.vent.catalog = {};

    this.vent.on('event', function(payload) {
      expect(payload).to.equal('PAYLOAD');
      done();
    });
    this.vent.trigger('event', 'PAYLOAD');
  });

  it('`fire`: should emit event with namespace and catalog.', function(done) {
    this.vent.ns = 'ns';
    this.vent.catalog = {event: 'cataloged:event'};

    this.vent.on('event', function(payload) {
      expect(payload).to.equal('PAYLOAD');
      done();
    });
    this.vent.fire('event', 'PAYLOAD');
  });

  it('`on`: should bind event.', function() {
    this.vent.on('event', function() {});
    expect(this.vent._listenId).to.be.string;
    expect(this.vent._listeningTo).to.have.property(this.vent._listenId);
  });

  it('`once`: should bind event and after first call must remove listener.', function() {
    this.vent.once('event', function() {});
    expect(this.vent._listenId).to.be.string;
    expect(this.vent._listeningTo).to.have.property(this.vent._listenId);
    this.vent.fire('event');
    expect(this.vent._listeningTo).to.not.have.property(this.vent._listenId);
  });

  it('`when`: should bind inversion of control event.', function() {
    this.vent.when('event', function(payload) {
      expect(payload).to.equal('PAYLOAD');
    });

    expect(this.vent._listenId).to.be.string;
    expect(this.vent._listeningTo).to.have.property(this.vent._listenId);
    this.vent.fire('event', 'PAYLOAD');
  });

  it('`after`: should bind inversion of control event and after first call must remove listener.', function() {
    this.vent.after('event', function(payload) {
      expect(payload).to.equal('PAYLOAD');
    });

    expect(this.vent._listenId).to.be.string;
    expect(this.vent._listeningTo).to.have.property(this.vent._listenId);
    this.vent.fire('event', 'PAYLOAD');
    expect(this.vent._listeningTo).to.not.have.property(this.vent._listenId);
  });

  it('`off`: should unbind event.', function() {
    this.vent.on('event', function() {});
    expect(this.vent._listenId).to.be.string;
    expect(this.vent._listeningTo).to.have.property(this.vent._listenId);
    this.vent.off('event');
    expect(this.vent._listeningTo).to.not.have.property(this.vent._listenId);

    let listener = function listener() {};

    this.vent.on('event', listener);
    this.vent.on('event', function() {});
    expect(this.vent._listeningTo).to.have.property(this.vent._listenId);
    expect(this.vent._listeningTo).to.satisfy(function(value) {
      return Object.keys(value).length === 1;
    });
    this.vent.off('event', listener);
    expect(this.vent._listeningTo).to.have.property(this.vent._listenId);
  });

  it('`whenBroadcast`: should listen to global event.', function() {
    this.vent.whenBroadcast('global', function(payload) {
      expect(payload).to.equal('PAYLOAD');
    });

    this.vent.broadcast('global', 'PAYLOAD');
  });

  it('`afterBroadcast`: should listen to global event and after first call must remove listener.', function() {
    var afterBroadcast = Suite.setSpy(this.vent, 'afterBroadcast');
    afterBroadcast('global', function(payload) {
      expect(payload).to.equal('PAYLOAD');
    });

    this.vent.broadcast('global', 'PAYLOAD');
    this.vent.broadcast('global', 'PAYLOAD');
    expect(afterBroadcast).to.be.calledOnce;
  });

  it('`broadcast`: should fire global event.', function() {
    this.vent.whenBroadcast('global', function(payload) {
      expect(payload).to.equal('PAYLOAD');
    });

    this.vent.broadcast('global', 'PAYLOAD');
  });

  it('`stopBroadcast`: should remove bound global event.', function() {
    var stopBroadcast = Suite.setSpy(this.vent, 'stopBroadcast');
    stopBroadcast('global', function(payload) {
      expect(payload).to.equal('PAYLOAD');
    });

    this.vent.broadcast('global', 'PAYLOAD');
    this.vent.broadcast('global', 'PAYLOAD');
    expect(stopBroadcast).to.not.be.called;
  });

  it('`channel`: should create new Events channel.', function() {
    let channel = this.vent.channel('channel');
    expect(channel).to.be.instanceof(Events);
    let sameChannel = this.vent.channel('channel');
    expect(channel).to.be.equal(sameChannel);
  });

  it('`createEventListener`: should create listener only for functions.', function() {
    var listener = this.vent.createEventListener();
    expect(listener).to.be.undefined;
    listener = this.vent.createEventListener('string');
    expect(listener).to.be.undefined;
    listener = this.vent.createEventListener(function() {});
    expect(listener).to.be.function;
  });

  it('`destroy`: should clear all bound events to the object.', function() {
    expect(this.vent._listenId).to.be.string;
    var cbs = {event: function() {}, 'new:event': function() {}, global: function() {}};
    var spies = {};

    for (var event in cbs) {
      var cb = cbs[event];
      spies[event] = cb = Suite.setSpy(cbs, event);
      if (event === 'global') return this.vent.whenBroadcast(event, cb);
      this.vent.on(event, cb);
    }

    expect(this.vent._listeningTo).to.have.property(this.vent._listenId);
    expect(Broadcast._listeningTo).to.have.property(this.vent._listenId);

    this.vent.destroy();
    this.vent.trigger('event');

    expect(spies.event).to.not.be.called;
    expect(this.vent._listeningTo).to.not.have.property(this.vent._listenId);
    expect(Broadcast._listeningTo).to.have.property(this.vent._listenId);
  });

  it('`resetNsAndCatalog`: should reset namespace and catalog.', function() {
    expect(this.vent.ns).to.be.string;
    expect(this.vent.catalog).to.be.object;

    this.vent.ns = 'ns';
    this.vent.catalog = {eventTest: 'event:test'};

    expect(this.vent.ns).to.be.string;
    expect(this.vent.catalog).to.be.object;
    this.vent.resetNsAndCatalog();

    expect(this.vent.ns).to.be.equal('');
    expect(this.vent.catalog).to.be.eql({});
  });
});
