var express = require('express');
var app = express();
var httpPort = (process.argv[2] === undefined) ? 80 : process.argv[2];
var bodyParser = require('body-parser');
var elasticsearch = require('elasticsearch').Client({
    host: "192.168.99.100:32781",
    apiVersion: "2.2"
});

// public, static files (frontend)
app.use(express.static('public'));
app.use(bodyParser.json({limit: "10Mb"})); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true, limit: "10mb"})); // for parsing application/x-www-form-urlencoded

// api functionalities ("backend")
app.get('/api/documents', function (req, res) {
    elasticsearch.search({
        size: 1000,
        index: "fulltext-search-poc",
        type: "documents",
        body: {
            "_source": [ "date", "doc._name", "doc._content_length"],
            "sort" : "date",
            "query": {
                "match_all": {}
            }
        }
    }).then(function (body) {
        res.json(body.hits.hits);
    }, function (error) {
        console.error("An error occured while retrieving locations, " + error.toString());
    });
});

app.get('/api/documents/search', function (req, res) {

    var query = req.query.queryString;
    console.info(query)

    if (query === undefined || query.trim() === "") {
        res.json({});
    } else {
        elasticsearch.search({
            size: 1000,
            index: "fulltext-search-poc",
            type: "documents",
            body: {
                "_source": ["date", "doc._name", "doc._content_length"],
                "sort": "date",
                "query": {
                    "query_string": {
                        "query": query
                    }
                }
            }
        }).then(function (body) {
            res.json(body.hits.hits);
        }, function (error) {
            if (error !== undefined) {
                console.error("An error occured while retrieving locations, " + error.toString());
            }
        });
    }

});

app.post('/api/documents', function (req, res) {
    console.info("POST received");

    elasticsearch.create({
        index: "fulltext-search-poc",
        type: "documents",
        body: {
            "date": new Date(),
            "doc" : {
                "_content_type" : req.body.type,
                "_name" : req.body.name,
                "_content" : req.body.data,
                "_content_length": req.body.size
            },
        },
    }, function (error, response) {
        if (error !== undefined) {
            console.error("An error occured while saving document, " + error.toString());
        }
    });

    res.json({status: true})
});

app.delete('/api/documents/:id', function (req, res) {
    console.info("DELETE received");
    console.info(req.params.id)

    elasticsearch.delete({
        index: "fulltext-search-poc",
        type: "documents",
        id: req.params.id
    }, function (error, response) {
        if (error !== undefined) {
            console.error("An error occured while deleting document, " + error.toString());
            res.json({status: false})
        } else {
            res.json({status: true})
        }
    });
});

app.listen(httpPort, function () {
    console.log('http server started on port ' + httpPort);
});