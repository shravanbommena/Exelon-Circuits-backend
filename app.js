const express = require("express");
const cors = require("cors");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, "database.db");
let db;

const initilizeDBAndServer = async () => {
  try {
    db = await open({
      driver: sqlite3.Database,
      filename: dbPath,
    });

    app.listen(3000, () => {
      console.log("Server started running at localhost:3000 ");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
  }
};
initilizeDBAndServer();

app.get("/city", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortField = "name",
      sortOrder = "ASC",
      search = "",
    } = req.query;
    const offset = limit * (page - 1);
    const dbQuery = `SELECT * FROM city WHERE name like "%${search}%" ORDER BY ${sortField} ${sortOrder} LIMIT ${limit} OFFSET ${offset};`;
    const dbResponse = await db.all(dbQuery);
    res.send(dbResponse);
  } catch (e) {
    res.send(e.message);
  }
});

app.post("/city", async (req, res) => {
  try {
    const { name, population, country, latitude, longitude } = req.body;
    // console.log(req.body);

    const dbQuery = `INSERT INTO city (name, population, country, latitude, longitude) VALUES ('${name}',${population}, '${country}',${latitude}, ${longitude});`;
    const dbResponse = await db.run(dbQuery);
    res.send({ name, population, country, latitude, longitude });
  } catch (e) {
    if (e.message.includes("UNIQUE") && e.message.includes("city.name")) {
      res.send("City name already exists");
    } else {
      res.send(`Error:${e.message}`);
    }
  }
});

app.put("/city/:id", async (req, res) => {
  const { name, population, country, latitude, longitude } = req.body;
  const { id } = req.params;
  const dbQuery = `UPDATE city SET name='${name}', population=${population}, country='${country}', latitude=${latitude},longitude=${longitude} WHERE name='${id}';`;
  const dbResponse = await db.run(dbQuery);
  res.send([
    { success: true },
    { name, population, country, latitude, longitude },
  ]);
});

app.delete("/city/:id", async (req, res) => {
  const { id } = req.params;
  const dbQuery = `DELETE FROM city WHERE name='${id}';`;
  await db.run(dbQuery);
  res.send("Deleted Successfully");
});
