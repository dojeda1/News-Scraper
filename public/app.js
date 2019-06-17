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
