// Initialisation stuff
(function() {
    var settings_menu = document.getElementById("settings-menu");
    settings_menu.innerHTML = "SETTINGS THINGS GO HERE"
})();

function toggleSettingsMenu() {
    var container_classes = document.getElementById("settings-container").classList;
    const open_class = "open";
    if (container_classes.contains(open_class))
        container_classes.remove("open");
    else
        container_classes.add("open");
}