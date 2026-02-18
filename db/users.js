var records = [
  { id: 1, username: 'westcliff', password: 'secret', displayName: 'WestCliff', emails: [{ value: 'west@example.com' }] },
  { id: 2, username: 'westcliffclass', password: 'birthday', displayName: 'WestCliff University', emails: [{ value: 'cliff@example.com' }] }
];

exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.username === username) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
};

exports.findById = function(id, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.id === id) {
        return cb(null, record);
      }
    }
    return cb(new Error('User ' + id + ' does not exist'));
  });
};