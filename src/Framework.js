import Tags from './Support/DocTags';
import Events from './Events/Emitter';
import Class from './Foundation/Class';
import Log from './Logger/Log';
import Monitor from './Monitor/Monitor';
import Bag from './Foundation/Bag';
import Container from './Container/Container';
import Serializer from './Serializer/Serializer';
import * as Mixins from './Mixins/Extend';

/**
 * Fiber Framework
 * @type {Framework}
 */
let Framework = {
  Events,
  Class,
  Bag,
  Log,
  Monitor,
  Container,
  Serializer,
  Mixins,
};

/** Export Framework. */
export default Framework;
