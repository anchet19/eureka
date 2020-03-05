const mysql = require('mysql2');
const socks = require('socksv5');
const Client = require('ssh2').Client;
const ssh = new Client();

const db = new Promise((resolve, reject) => {
  ssh.on('ready', function () {
    ssh.forwardOut(
      // source address, this can usually be any valid address
      '127.0.0.1',
      // source port, this can be any valid port number
      5001,
      // destination address (localhost here refers to the SSH server)
      '127.0.0.1',
      // destination port
      3306,
      function (err, stream) {
        if (err) consle.error(`error connecting: ${err.stack}`); // SSH error: can also send error in promise ex. reject(err)
        // use `sql` connection as usual
        const connection = mysql.createConnection({
          host: '127.0.0.1',
          user: 'root',
          password: '',
          database: 'test',
          stream: stream
        });

        // send connection back in variable depending on success or not
        connection.connect(function (err) {
          if (err) {
            resolve(connection);
          } else {
            reject(err);
          }
        });
      });
  }).connect({
    host: 'ec2-54-208-52-176.compute-1.amazonaws.com',
    username: 'ubuntu',
    privateKey: require('fs').readFileSync('/home/chris/.ssh/busDiscovery.pem')
  });
});

module.exports = db;