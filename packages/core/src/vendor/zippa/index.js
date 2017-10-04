import * as zip from './zipper';
import * as walk from './walk';
import ArrayZipper from './array_zipper';
import * as visit from './visit';


export * from './walk';
export * from './visit';
export * from './zipper';
export { zip, ArrayZipper };

const mainExport = {
    ...zip,
    ...visit,
    ArrayZipper,
    walk,
    makeZipper: zip.makeZipper,
    visit,
    zip,
};

export default mainExport;
