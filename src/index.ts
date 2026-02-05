export * from './pedersen';

import pedersen from './pedersen';

pedersen.generator().then(g => console.log(g));
