var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");


var db = require("./models");

var PORT = 3000;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost/newsdb");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsdb";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true
});

app.get("/all", function (req, res) {

    db.newsdb.find({}, function (err, data) {

        if (err) {
            console.log(err);
        }
        else {

            res.json(data);
        }
    });
});


app.get("/scrape", function (req, res) {
    axios.get("https://www.nytimes.com/section/us").then(function (response) {
       
        var $ = cheerio.load(response.data);
        $("headline h2").each(function (i, element) {
            
        var result = {};

            result.article = $(this)
                .children("a")
                .text();
            result.summary = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

    db.News.create(result)
            .then(function (newsdb) {
                 
                 console.log(newsdb);
            })
            .catch(function (err) {
                  
                return res.json(err);
            });
        });
    });

app.get("/headline", function (req, res) {
    db.news.find({}, function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(data);
        }
    })
        .catch(function (err) {
            res.json(err);

        });


    });
});

app.get("/headline/:id", function (req, res) {

    db.news.findOne({ _id: q.params.id })

        .populate("note")
        .then(function (newsdb) {
            res.json(newsdb);
        })
        .catch(function (err) {
            res.json(err);

        });
});

app.post("/headline/:id", function (req, res) {
   
    db.Note.create(req.body)
        .then(function (dbNote) {
            
            return db.News.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (newsdb) {
            
            res.json(newsdb);
        })
        .catch(function (err) {
            
            res.json(err);
        });
});

app.put("/saved/:id", function (req, res) {

    db.News
        .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: true } })
        .then(function (newsdb) {
            res.json(newsdb);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get("/saved", function (req, res) {

    db.News
        .find({ isSaved: true })
        .then(function (newsdb) {
            res.json(newsdb);
        })
        .catch(function (err) {
            res.json(err);
        });
});


app.put("/delete/:id", function (req, res) {

    db.News
        .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: false } })
        .then(function (newsdb) {
            res.json(newsdb);
        })
        .catch(function (err) {
            res.json(err);
        });
});



app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
