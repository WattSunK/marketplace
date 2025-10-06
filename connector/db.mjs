import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('./db.js');
export default pkg;
