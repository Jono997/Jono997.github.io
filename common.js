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
    var on_change = dropdown.attributes['ondropdownchange'];
    var button = undefined;
    
    for (child of dropdown.children)
    {
        if (child.classList.contains("dropdown-button"))
        {
            button = child;
            child.addEventListener("click", (e) => {
                document.active_dropdown = (toggleClass(dropdown, "active") ? dropdown : undefined);
                e.stopPropagation();
            });
        }
        
        if (child.classList.contains("dropdown-options"))
            for (option of child.children)
            {
                option.addEventListener("click", (e) => {
                    var option = e.currentTarget;
                    dropdown.attributes.setNamedItem(option.attributes['dropdown-value'].cloneNode());
                    button.innerHTML = option.innerHTML;
                    var on_change = dropdown.attributes['ondropdownchange'];
                    if (on_change != null)
                        window[on_change.value](dropdown.attributes['dropdown-id'].value, dropdown.attributes['dropdown-value'].value);
                    e.stopPropagation();
                });
            }
    }
}

// Alerts the current id and value of a dropdown. used for debugging.
function alertDropdownValue(dropdown_id, dropdown_value)
{
    alert(`ID: ${dropdown_id}\nValue: ${dropdown_value}`);
}

function applyTheme(theme)
{
    console.log(`Applying theme ${theme}`);
    var css = document.documentElement.style;
    css.setProperty('--theme-bg-colour', window.themes[theme].bg_colour);
    css.setProperty('--theme-text-colour', window.themes[theme].text_colour);
}

function setTheme(_, theme)
{
    localStorage.setItem("theme", theme);
    applyTheme(theme);
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

// Initialise theme
(async function() {
    var themes_query = await fetch("themes.json");
    if (themes_query.ok)
    {
        window.themes = await themes_query.json();

        var theme = localStorage.getItem('theme');
        if (theme === null)
            theme = 'light';
        applyTheme(theme);
    }
    setTimeout(() => {
        document.body.classList.add("enable-colour-transitions");
    }, 10);
})();