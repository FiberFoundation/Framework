import Tags from './Support/DocTags';
import Events from './Events/Events';
import Class from './Foundation/Class';
import Log from './Logger/Log';
import Monitor from './Monitor/Monitor';
import Bag from './Foundation/Bag';
import Container from './Container/Container';
import * as Mixins from './Mixins/Extend';

/**
 * Fiber Framework
 * @typedef {Object} Framework
 */
let Framework = {
  Events,
  Class,
  Bag,
  Log,
  Monitor,
  Container,
  Mixins
};

/** Export Framework. */
export default Framework;
