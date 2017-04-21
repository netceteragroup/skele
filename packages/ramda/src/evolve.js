'use strict';

export default function evolve(xforms, obj) {
  return obj.withMutations(m => {
    m.forEach((v, key) => {
      const xform = xforms[key];
      const type = typeof xform;
      switch (type) {
        case 'function':
          m.update(key, xform);
          break;
        case 'object':
          if (xform) m.set(key, evolve(xform, v));
          break;
      }
    });
  });
}
