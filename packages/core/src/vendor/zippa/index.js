import * as zip from './zipper';
import { preWalk, walk } from './walk';
import ArrayZipper from './array_zipper';
import * as visit from './visit';

export {preWalk, walk};
export * from './visit';
export * from './zipper';
export { zip, ArrayZipper };

const mainExport = {
    ...zip,
    ...visit,
    ArrayZipper,
    preWalk,
    walk,
    makeZipper: zip.makeZipper,
    visit,
    zip,
};

export default mainExport;
