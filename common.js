// Adds a class to an element, or removes that class if the element already has it
// Returns if the element has the class once toggled
function toggleClass(element, _class)
{
    if (element.classList.contains(_class))
        element.classList.remove(_class);
    else
        element.classList.add(_class);
    return element.classList.contains(_class);
}

// Opens/closes the settings menu
function toggleSettingsMenu()
{
    toggleClass(document.getElementById("settings-container"), "open");
}

// Initialises the given dropdown element in the DOM
function setupDropdown(dropdown)
{
    var button = undefined;
    
    for (child of dropdown.children)
    {
        if (child.classList.contains("dropdown-button"))
        {
            button = child;
            child.addEventListener("click", (e) => {
                openDropdown(dropdown);
                e.stopPropagation();
            });
        }
    }
}

function openDropdown(dropdown)
{
    if (document.active_dropdown !== undefined)
       toggleClass(document.active_dropdown, "active");
    if (document.active_dropdown !== dropdown)
    {
        toggleClass(dropdown, "active");
        document.active_dropdown = dropdown;
    }
}

// Creates an attribute node with the name and value provided
function makeAttribute(name, value)
{
    var retval = document.createAttribute(name);
    retval.value = value;
    return retval;
}

// Initialise dropdowns
(function() {
    document.active_dropdown = undefined;
    document.addEventListener("click", () => {
        if (document.active_dropdown !== undefined)
        {
            document.active_dropdown.classList.remove("active");
            document.active_dropdown = undefined;
        }
    });

    for (dropdown of document.getElementsByClassName("dropdown"))
        setupDropdown(dropdown);
})();