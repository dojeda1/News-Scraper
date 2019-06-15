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
    db.Article.find({}).then(function (data) {
        var hbsObject = {
            articles: data
        };
        console.log(hbsObject);
        res.render("index", hbsObject);
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

        console.log("Scrape Complete");
        res.send("Scrape Complete");
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


// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});