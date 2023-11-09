const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
/////////////////////////////////////////////////
// Exception Handling
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message, err);
  console.log(`UNHANDLED EXPECTION # # #`);
  process.exit(1);
});
/////////////////////////////////////////////////
const app = require('./app');
//////////////////////////////////////////////////
// DB connection
let now = new Date().getSeconds();
mongoose
  .connect(process.env.DB_URL)
  .then((_) => {
    console.log(
      `Connected . . . (IN => ${Math.abs(
        new Date().getSeconds() - now
      )} Seconds) .`
    );
  })
  .catch((err) => {
    console.log(err.message);
  });
//////////////////////////////////////////////////////
// starting the server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server started (using port ${process.env.PORT})🦥`);
});
///////////////////////////////////////////////////////
// Rejection handling
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log(`unhandled promise rejection ! ! !`);
  server.close((_) => {
    process.exit(1);
  });
});
