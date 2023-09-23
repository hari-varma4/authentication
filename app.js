const express = require("express");
const app = express();
const path = require("path");
let db = null;
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbpath = path.join(__dirname, "userData.db");
app.use(express.json());
const bcrypt = require("bcrypt");
const initser = async () => {
  db = await open({
    filename: dbpath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => {
    console.log("Running");
  });
};
initser();

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const haspassw = await bcrypt.hash(password, 10);
  const qur = `
    select * from user where username="${username}"
    `;
  const qre = await db.run(qur);
  if (qre === undefined) {
    const qurr = `
        insert into user (username,name,password,gender,location)
        values("${username}","${name}",'${haspassw}',"${gender}","${location}")
        `;
    if (password.length < 5) {
      //checking the length of the password
      response.status(400);
      response.send("Password is too short");
    } else {
      const res = await db.run(qurr);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;

  const qur = `
    select * from user where username="${username}"
    `;
  const res = await db.get(qur);
  console.log(res);
  if (res === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const comp = await bcrypt.compare(password, res.password);

    if (comp === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const qu = `
    select * from user where username="${username}"
    `;
  const resq = await db.get(qu);
  if (resq === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const com = await bcrypt.compare(oldPassword, resq.password);
    if (com === true) {
      if (newPassword.lenght < 4) {
        response.status(400);
        response.send("Password is too short");
      } else {
        const pass = await bcrypt.hash(newPassword, 10);
        const qu = `update user set password="${pass}"
            where username="${username}"`;
        const ress = await db.run(qu);
        response.status(200);
        response.send("Password updated");
      }
    } else {
      response.status(400);
      response.send("Invalid current password");
    }
  }
});
module.exports = app;
