var reloadDocuments = () => {
    console.info("Reloading documents: start");
    $.get('/api/documents', (data) => {
        var temp = $("#mustache-document-list").html();

        $("#documents-list ul").remove();
        $("#documents-list").append(Mustache.render(temp, {documents: data}));
        countDocuments();
        console.info("Reloading documents: complete");
    }).fail(() => console.warn("Reloading documents: error"))
};

var countDocuments = () => {
    $("#documents-list span.label-info:first span:nth-child(2)").text(
        $("#documents-list ul li").length
    );
}

var deleteDocument = function() {
    $.ajax({
        url: $(this).attr("href"),
        type: 'DELETE',
        beforeSend: () => console.info("Deleting document: start"),
        error: () => console.warn("Deleting document: error"),
        success: (data) => {
            if (data.status === undefined) {
                console.warn("Deleting document: error, no status.");
            } else if (data.status) {
                console.info("Deleting document: complete");
                $(this).closest("li").remove();
                countDocuments();
                $("#search-results").text("")
            } else {
                console.warn("Deleting document: error");
            }
        }
    });

    return false;
};

$(document).on("ready", reloadDocuments);
$(".container").delegate("[title=delete]", "click", deleteDocument);
$("#documents-list span.cpointer").click(reloadDocuments);

$("#new-file-form").submit(function() {
    var $this = $(this).find("input[type=file]");
    var files = $this[0].files;
    if (files.length === 0) {
        console.warn("Choose file first");
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
                setTimeout(function() {
                    $this.val("");
                    reloadDocuments();
                }, 1500);
            }).fail(() => console.warn("Adding new document: error"));
        }
    }
    return false;
});

$("#search-form").submit(function() {
    $("#search-results").html("");
    var queryString = $(this).find("input[type=text]").val().trim();

    if (queryString !== "") {
        $.get('/api/documents/search', {queryString: queryString}, (data) => {
            var temp = $("#mustache-search-results").html();
            $("#search-results").append(Mustache.render(temp, {queryString: queryString, documents: data}));
        });
    }

    return false;
});