
const http = require("http"),
  fs = require("fs"),
  // IMPORTANT: you must run `npm install` in the directory for this assignment
  // to install the mime library if you"re testing this on your local machine.
  // However, Glitch will install it automatically by looking in your package.json
  // file.
  mime = require("mime"),
  dir = "public/",
  port = 3001

const appdata = [
  {
    taskTitle: "HW2",
    taskDescription: "Webware Shortstack application",
    taskDueDate: "2025-09-08",
    completed: false,
    daysLeft: NaN
  }
]

const server = http.createServer(function (request, response) {
  if (request.method === "GET") {
    handleGet(request, response)
  } else if (request.method === "POST") {
    handlePost(request, response)
  }
})

const handleGet = function (request, response) {
  if (request.url === "/") {
    sendFile(response, "public/index.html")
  } else if (request.url === "/todos") {
    // Send todo list as JSON
    response.writeHead(200, { "Content-Type": "application/json" })
    response.end(JSON.stringify(appdata))
  } else {
    const filename = dir + request.url.slice(1)
    sendFile(response, filename)
  }
}

const handlePost = function (request, response) {
  let dataString = ""
  request.on("data", function (data) {
    dataString += data
  })

  request.on("end", function () {
    if (request.url === "/submit") {
      const todo = JSON.parse(dataString);

      // Derived field: days left until due date
      const dueDate = new Date(todo.taskDueDate);
      const today = new Date();
      const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      todo.daysLeft = daysLeft;
      appdata.push(todo);
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(appdata));
      console.log(appdata)
    } else if (request.url === "/delete") {
      const { idx } = JSON.parse(dataString);

      appdata.splice(idx, 1);
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(appdata));
      console.log(appdata)
    } else if (request.url === "/toggle") {
      const { idx, completed } = JSON.parse(dataString);
      appdata[idx].completed = completed;
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(appdata));
      console.log(appdata)
    } else if (request.url === "/edit") {
      const { idx, taskTitle, taskDescription, taskDueDate } = JSON.parse(dataString);
      if (appdata[idx]) {
        appdata[idx].taskTitle = taskTitle;
        appdata[idx].taskDescription = taskDescription;
        appdata[idx].taskDueDate = taskDueDate;
        // recalculate daysLeft
        const dueDate = new Date(taskDueDate);
        const today = new Date();
        appdata[idx].daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      }
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(appdata));
      console.log(appdata)
    }
  });
}

const sendFile = function (response, filename) {
  const type = mime.getType(filename)

  fs.readFile(filename, function (err, content) {

    // if the error = null, then we"ve loaded the file successfully
    if (err === null) {
      // status code: https://httpstatuses.com
      response.writeHeader(200, { "Content-Type": type })
      response.end(content)

    } else {
      // file not found, error code 404
      response.writeHeader(404)
      response.end("404 Error: File Not Found")

    }
  })
}

server.listen(process.env.PORT || port)
