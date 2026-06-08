const crypto = require('crypto');

module.exports = {
  v4: () => crypto.randomUUID(),
  v7: () => crypto.randomUUID()
};
