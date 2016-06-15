var reloadDocuments = () => {
    console.info("Reloading documents: start");
    $.get('/api/documents', (data) => {
        $("#documents-list span.label-info:first span:nth-child(2)").text(data.length);
        var temp = $("#mustache-document-list").html();

        $("#documents-list ul").remove();
        $("#documents-list").append(Mustache.render(temp, {documents: data}));
        console.info("Reloading documents: complete");
    }).fail(() => console.warn("Reloading documents: error"))
};

$("#new-file-form").submit(function() {
    var files = $(this).find("input[type=file]")[0].files;
    if (files.length === 0) {
        alert("Choose file first");
    } else {
        var reader = new FileReader();
        reader.readAsBinaryString(files[0]);
        reader.onload = (e) => {
            console.info("Addding new document: start");
            $.post('/api/documents', {
                data: btoa(e.target.result),
                name: files[0].name,
                type: files[0].type,
                size: files[0].size
            }, () => {
                console.info("Adding new document: data posted");
                setTimeout(reloadDocuments, 1500);
            }).fail(() => console.warn("Adding new document: error"));
        }
    }
    return false;
});

$("#search-form").submit(function() {
    var queryString = $(this).find("input[type=text]").val();
    $.get('/api/documents/search', {queryString: queryString}, (data) => {
        var temp = $("#mustache-search-results").html();
        $("#search-results").html("").append(Mustache.render(temp, {queryString: queryString, documents: data}));
    });

    return false;
});

$("#documents-list span.cpointer").click(reloadDocuments);

$(document).on("ready", () => {
    reloadDocuments();
})