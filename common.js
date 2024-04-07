window.backgrounds = [
    ['1.png', 'https://tumblr.com/0000stuff', '0000stuff', 'Welcome to the Library'],
    ['2.png', 'https://tumblr.com/0000stuff', '0000stuff', 'Wandering Thoughts'],
    ['3.png', 'https://tumblr.com/0000stuff', '0000stuff', 'Before Summer Ends'],
    ['4.jpg', 'https://tumblr.com/jumpcat7', 'JumpCat', 'Hard At Work'],
    ['5.png', 'https://twitter.com/kelinci_bukit', 'kris', 'Idle Time']
];

window.get_user_background = function() {
    var user_bg = document.cookie.match(/background=(\d+)/);
    if (user_bg === null)
        return -1;
    return Number(user_bg[1]);
}

window.change_background = function() {
    // Select background based on user preference
    var user_bg = get_user_background();
    var background = undefined;
    if (user_bg === -1)
        while (background === undefined || background[0] === current_background)
            background = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    else
        background = backgrounds[user_bg];

    // Apply background
    current_background = background[0];
    var bg_element = document.getElementById('background');
    var bg_path = `backgrounds/${background[0]}`;
    bg_element.style.backgroundImage = `url(${bg_path})`;
    var bg_credit = document.getElementById('bg-credit');
    if (bg_credit !== null)
    {
        bg_credit.setAttribute('href', background[1]);
        bg_credit.innerHTML = background[2];
    }

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
change_background();

// Add top/bottom margins to main if needed
var main = document.getElementsByTagName('main')[0];
new ResizeObserver(function() {
    if (main.clientHeight > document.body.parentElement.clientHeight)
        main.classList.add('vert-margins');
    else
        main.classList.remove('vert-margins');
}).observe(main);