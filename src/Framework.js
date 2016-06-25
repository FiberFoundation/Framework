import 'babel-polyfill';
import Tags from './Support/DocTags';
import Serializer from './Serializer/Serializer';
import Serializable from './Foundation/Serializable';
import Emitter from './Events/Emitter';
import Class from './Foundation/Class';
import State from './Foundation/State';
import Model from './Model/Model';
import Log from './Logger/Log';
import Monitor from './Monitor/Monitor';
import Container from './Container/Container';
import * as Mixins from './Support/Extend';

/**
 * Fiber Framework
 * @type {Framework}
 */
let Framework = {
  Serializer,
  Serializable,
  Emitter,
  Class,
  State,
  Model,
  Log,
  Monitor,
  Container,
  Mixins,
};

/** Export Framework. */
export default Framework;
