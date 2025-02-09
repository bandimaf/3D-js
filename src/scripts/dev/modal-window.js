(function () {
    "use strict";

    const props = document.querySelector("#props");
    const properties = document.querySelector("#properties");

    properties.addEventListener("click", function () {
        props.classList.toggle("show-list");
    });

    const coordinates = document.querySelector("#coordinates");
    const xyz = document.querySelector("#xyz");

    coordinates.addEventListener("click", function () {
        xyz.classList.toggle("show-list");
    });

    const modalWindow = document.querySelector('#mw');
    const cross = document.querySelector('#cross');

    cross.addEventListener("click", function () {
        modalWindow.classList.remove("show-mw");
    });

})();