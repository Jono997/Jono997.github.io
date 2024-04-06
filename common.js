window.change_backround = function() {
    var backgrounds = [
        ['1.png', 'https://tumblr.com/0000stuff', '0000stuff'],
        ['2.png', 'https://tumblr.com/0000stuff', '0000stuff'],
        ['3.png', 'https://tumblr.com/0000stuff', '0000stuff'],
        ['4.jpg', 'https://tumblr.com/jumpcat7', 'JumpCat'],
        ['5.png', 'https://twitter.com/kelinci_bukit', 'kris']
    ];

    var background = undefined;
    while (background === undefined || background[0] === current_background)
        background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    current_background = background[0];
    var bg_element = document.getElementById('background');
    var bg_path = `backgrounds/${background[0]}`;
    bg_element.style.backgroundImage = `url(${bg_path})`;
    var bg_credit = document.getElementById('bg-credit');
    bg_credit.setAttribute('href', background[1]);
    bg_credit.innerHTML = background[2];

    bg_element.style.transitionDuration = "0s";
    bg_element.style.opacity = 0;
    var img = new Image();
    img.onload = function()
    {
        bg_element.style.transitionDuration = "1.5s";
        bg_element.style.opacity = 1;
    };
    img.src = bg_path;
};

// Set the background and setup the change background button
window.current_background = undefined;
(function() {
    var change_bg_button = document.getElementById("change_bg_button");
    change_bg_button.addEventListener("click", change_backround);
})();
change_backround();

// Add top/bottom margins to main if needed
window.addEventListener('resize', function() {
    var main = document.getElementsByTagName('main')[0];
    if (main.clientHeight > document.body.parentElement.clientHeight)
        main.classList.add('vert-margins');
    else
        main.classList.remove('vert-margins');
});