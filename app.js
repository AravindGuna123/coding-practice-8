const express = require("express");
const app = express();

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running successfully");
    });
  } catch (e) {
    console.log(`DB Error`);
    process.exit(1);
  }
};
initializeDbAndServer();
app.use(express.json());
app.get("/todos/", async (request, response) => {
  let { status } = request.query;
  let firstQuery1 = `SELECT * FROM todo where status like '%${status}%'`;
  let result1 = await db.all(firstQuery1);
  response.send(result1);
});
app.get("/todos/", async (request, response) => {
  let { priority } = request.query;
  let firstQuery2 = `SELECT * FROM todo where priority like '%${priority}%'`;
  let result2 = await db.all(firstQuery2);
  response.send(result2);
});
app.get("/todos/", async (request, response) => {
  let { status, priority } = request.query;
  let firstQuery3 = `SELECT * FROM todo where priority like '%${priority}%' UNION SELECT * FROM todo where status like '%${status}%'`;
  let result3 = await db.all(firstQuery3);
  response.send(result3);
});
app.get("/todos/", async (request, response) => {
  let { search_q } = request.query;
  let firstQuery4 = `SELECT * FROM todo where todo like '%${search_q}%'`;
  let result4 = await db.all(firstQuery4);
  response.send(result3);
});
app.get("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let secondQuery1 = `SELECT * FROM todo where id=${todoId}`;
  let result5 = await db.get(secondQuery1);
  response.send(result5);
});
app.post("/todos/", async (request, response) => {
  let { todo, priority, status } = request.body;
  let thirdQuery = `INSERT INTO todo(todo,priority,status) values('${todo}','${priority}','${status}')`;
  await db.run(thirdQuery);
  response.send("Todo Successfully Added");
});
app.put("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;

  let updateCol = "";
  let requestConstraint = request.body;
  if (requestConstraint.todo !== undefined) {
    updateCol = "Todo";
  } else if (requestConstraint.status !== undefined) {
    updateCol = "Status";
  } else if (requestConstraint.priority !== undefined) {
    updateCol = "Priority";
  }

  let previousTodoQuery = `SELECT * FROM todo where id=${todoId}`;
  let preTodo = await db.get(previousTodoQuery);
  let {
    todo = preTodo.todo,
    priority = preTodo.priority,
    status = preTodo.status,
  } = request.body;

  let actualQuery = `UPDATE todo
SET 
  todo='${todo}',
  priority='${priority}',
  status='${status}' 
where 
  id=${todoId}`;
  await db.run(actualQuery);
  response.send(`${updateCol} Updated`);
});

module.exports = app;
