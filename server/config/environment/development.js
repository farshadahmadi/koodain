'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
            undefined,

  // Server port
  port:     process.env.PORT ||
            10012,

  // MongoDB connection options
  mongo: {
    uri:    process.env.MONGO_DB_URL ||
            'mongodb://localhost/koodain-dev'
  },

  git: {
    projects: process.env.WORKSPACE ||
              '/home/ubuntu/idiotgit-dev'
  }
};
