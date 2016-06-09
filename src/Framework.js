import Events from './Events/Events';
import BaseObject from './Foundation/Object';
import Log from './Logger/Log';
import Monitor from './Monitor/Monitor';
import Bag from './Foundation/Bag';
import Container from './Container/Container';

/**
 * Export Framework.
 * @type {Object}
 * @typedef {Framework}
 */
export default {
  Events,
  Object: BaseObject,
  Bag,
  Log,
  Monitor,
  Container
};
