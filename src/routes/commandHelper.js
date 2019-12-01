const exec = require("child_process").exec;

function execute(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error, stderr);
        return;
      }
      resolve(stdout);
    });
  });
}

module.exports = {
  execute
};
