'use strict';

export const mix = (superClass) => new MixinBuilder(superClass);

class MixinBuilder {

  constructor(superclass) {
    this.superclass = superclass;
  }

  with() {
    return Array.from(arguments).reduce((c, m) => m(c), this.superclass);
  }
}
