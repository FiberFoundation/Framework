/**
 * Fiber Core Class
 * @class
 **/
export default class CoreClass {

  constructor(options = {}) {
    this.options = options;
  }

  destroy() {
    this.options = null;
  }
}
