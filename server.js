var express = require("express");
var exphbs = require("express-handlebars")
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });


app.get("/", function (req, res) {
    db.Article.find({ saved: false }).then(function (data) {
        var hbsObject = {
            articles: data
        };
        console.log(hbsObject);
        res.render("index", hbsObject);
    });
});

app.get("/saved", function (req, res) {
    db.Article.find({ saved: true })
        .populate("note")
        .then(function (data) {

            var hbsObject = {
                articles: data
            };
            console.log(hbsObject);
            res.render("saved", hbsObject);
        });
});


// get articles from IGN
app.get("/scrape", function (req, res) {

    axios.get("https://www.ign.com/articles/").then(function (response) {
        console.log("scrape beginning")

        var $ = cheerio.load(response.data);

        $(".listElmnt").each(function (i, element) {

            console.log("scraping Item")
            var result = {};

            result.saved = false;
            result.title = $(this)
                .find(".listElmnt-storyHeadline")
                .text();
            result.link = $(this)
                .find(".listElmnt-storyHeadline")
                .attr("href");

            var fullText = $(this)
                .find("p")
                .text();

            result.blurb = fullText.substring(fullText.indexOf("-") + 2, fullText.lastIndexOf(" R"))

            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });

        res.redirect("/");

    });
});

// Get all articles from DB
app.get("/articles", function (req, res) {

    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Get article by ID and its notes
app.get("/articles/:id", function (req, res) {

    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// save an article by id
app.post("/saveArticle/:id", function (req, res) {
    db.Article.update(
        {
            _id: req.params.id
        },
        {
            $set: {
                saved: true
            }
        },
        function (error, edited) {
            if (error) {
                console.log(error);
                res.send(error);
            }
            else {
                console.log(edited);
                res.send(edited);
            }
        }
    );
});

// save an article by id
app.post("/removeArticle/:id", function (req, res) {
    db.Article.update(
        {
            _id: req.params.id
        },
        {
            $set: {
                saved: false
            }
        },
        function (error, edited) {
            if (error) {
                console.log(error);
                res.send(error);
            }
            else {
                console.log(edited);
                res.send(edited);
            }
        }
    );
});

// Clear Articles
app.get("/clearArticles", function (req, res) {
    db.Article.remove({}, function (error, response) {
        if (error) {
            console.log(error);
        }
        else {

            res.redirect("/");
        }
    });
});

// Route for saving/updating an Article's associated Note
app.post("/newNote/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});