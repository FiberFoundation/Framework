import Serializer from './Serializer/Serializer';
import Serializable from './Foundation/Serializable';
import Emitter from './Events/Emitter';
import Class from './Foundation/Class';
import Synthetic from './Foundation/Synthetic';
import State from './Foundation/State';
import Model from './Model/Model';
import Schema from './Model/Schema';
import Types from './Support/Types'
import Log from './Foundation/Log';
import Container from './Container/Container';
import * as Extend from './Support/Extend';

import Immutable from 'immutable';

/**
 *  Framework
 * @type {Framework}
 */
const Framework = {
  Serializer,
  Serializable,

  Emitter,

  Class,
  Synthetic,
  State,

  Model,
  Schema,

  Types,

  Log,

  Container,

  Extend,

  Immutable
};

/** Export Framework. */
export default Framework;
