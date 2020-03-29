const express = require('express')

const app = express()

const port = process.env.PORT || 8080

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
    res.render("index");
})

const server = app.listen(port, () => console.log(`Server ready on port ${port}`))

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated')
  })
})