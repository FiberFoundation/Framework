import 'babel-polyfill';
import Tags from './Support/DocTags';
import Serializer from './Serializer/Serializer';
import Serializable from './Serializer/Serializable';
import Emitter from './Events/Emitter';
import Class from './Foundation/Class';
import Synthetic from './Foundation/Synthetic';
import State from './Foundation/State';
import Record from './Foundation/Record';
import Model from './Model/Model';
import Log from './Logger/Log';
import Monitor from './Monitor/Monitor';
import Container from './Container/Container';
import * as Extend from './Support/Extend';

import Immutable from 'immutable';

/**
 * Fiber Framework
 * @type {Framework}
 */
const Framework = {
  Serializer,
  Serializable,

  Emitter,

  Class,
  Synthetic,
  Record,
  State,

  Model,

  Log,

  Monitor,

  Container,

  Extend,

  Immutable
};

/** Export Framework. */
export default Framework;
