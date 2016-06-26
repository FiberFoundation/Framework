/**
 * Path Support for the Immutable.
 * @type {Object}
 */
export default Path = {
  
  /**
   * Converts `key` to path
   * @param {Array|string} key
   * @returns {Array}
   */
  to(key) {
    return _.toPath(key);
  },

  /**
   * Determines if given `key` is a path.
   * @param {Array|string} key
   * @returns {boolean}
   */
  is(key) {
    return _.isArray(key) || key.split('.').length > 1;
  },
  
  /**
   * Determines if given `key` is not a path.
   * @param {Array|string} key
   * @returns {boolean}
   */
  isNot(key) {
    return ! Path.is(key);
  }
}
