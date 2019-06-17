$(".save-btn").on("click", function () {

    console.log("clicked")

    var id = $(this).attr("data-id");
    console.log(id)
    $.ajax({
        url: "/saveArticle/" + id,
        method: "POST",
        data: {
            id: id
        }
    }).then(function () {
        location.reload();
    })
})

$(".remove-btn").on("click", function () {

    console.log("clicked")

    var id = $(this).attr("data-id");
    console.log(id)
    $.ajax({
        url: "/removeArticle/" + id,
        method: "POST",
        data: {
            id: id
        }
    }).then(function () {
        location.reload();
    })
})

$(".save-note").on("click", function () {

    console.log("clicked")

    var id = $(this).attr("data-id");
    console.log(id)
    var body = $("#new-note-" + id).val().trim();
    console.log(body)
    $.ajax({
        url: "/newNote/" + id,
        method: "POST",
        data: {
            id: id,
            body: body
        }
    }).then(function () {
        location.reload();
    })
});

$(".note-btn").on("click", function () {
    var id = $(this).attr("data-id");

    if ($("#notes-" + id).hasClass("d-none") === true) {
        $("#notes-" + id).removeClass("d-none")
    } else {
        $("#notes-" + id).addClass("d-none")

    }
});
