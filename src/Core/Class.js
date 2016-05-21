import { valMerge } from "Support";

/**
 * Fiber Core Class
 * @class
 **/
export default class CoreClass {

  constructor(options) {
    this.options = valMerge(options, {});
  }
}
