(async function(){
    var getSettingsTemplate = function(theme_list) {
        return [
            {
                name: "Theme",
                id: "theme",
                type: "dropdown",
                values: theme_list,
                default: 0,
                update: function(value) {
                    var css = document.documentElement.style;
                    css.setProperty('--theme-bg-colour', window.j99_themes[value].bg_colour);
                    css.setProperty('--theme-text-colour', window.j99_themes[value].text_colour);
                }
            }
        ];
    };




    window.j99_themes = await (async function() {
    var themes_query = await fetch("themes.json");
    if (themes_query.ok)
        return await themes_query.json();
    return {};
    })();

    var theme_list = [];
    for (theme of Object.getOwnPropertyNames(j99_themes))
        theme_list.push({
            name: j99_themes[theme].name,
            value: theme
        });

    window.j99_settings_template = getSettingsTemplate(theme_list);

    // Load settings
    var settings_json = localStorage.getItem('settings');
    window.j99_settings = {};
    if (settings_json !== null)
    {
        try
        {
            j99_settings = JSON.parse(settings_json);
        }
        catch {}
    }
    for (setting of j99_settings_template)
    {
        if (!Object.hasOwn(j99_settings, setting.id))
        {
            j99_settings[setting.id] = setting.default;
            if (setting.type == "dropdown")
                j99_settings[setting.id] = setting.values[setting.default].value;
        }
    }

    // Apply settings
    // Separated from reading the settings in case any settings need to account for other settings
    for (setting of j99_settings_template)
        setting.update(j99_settings[setting.id]);
    setTimeout(() => {
        document.body.classList.add("enable-colour-transitions");
    }, 5);

    window.writeSetting = function(id, value)
    {
        j99_settings[id] = value;
        localStorage.setItem("settings", JSON.stringify(j99_settings));
        for (i in j99_settings_template)
        {
            var setting = j99_settings_template[i];
            if (id === setting.id)
                setting.update(value);
        }
    };

    var make_dropdown_option = function(option) {
        var retval = document.createElement("div")
        if (Object.hasOwn(option, "html"))
            retval.innerHTML = option.html;
        else
            retval.innerHTML = option.name;
        var value_attr = document.createAttribute("data-dropdown-value");
        value_attr.value = option.value;
        retval.attributes.setNamedItem(value_attr);
        return retval;
    };

    // Populate settings menu
    var settings_menu = document.getElementById("settings-menu");
    for (s in j99_settings_template)
    {
        var setting = j99_settings_template[s];
        var header = document.createElement("h3");
        header.innerHTML = setting.name;
        settings_menu.appendChild(header);
        switch (setting.type)
        {
            case "dropdown":
                var dropdown = document.createElement("div");
                dropdown.classList.add("dropdown");
                settings_menu.appendChild(dropdown);
                
                var button = document.createElement("span");
                button.classList.add("dropdown-button");
                for (value of setting.values)
                    if (j99_settings[setting.id] == value.value)
                        button.innerHTML = value.name;
                //button.innerHTML = setting.values[j99_settings[setting.id]].name;
                button.onclick = (e) => {
                    document.active_dropdown = (toggleClass(dropdown, "active") ? dropdown : undefined);
                    e.stopPropagation();
                };
                dropdown.appendChild(button);

                var options = document.createElement("div");
                options.classList.add("dropdown-options");
                for (i in setting.values)
                {
                    var value = setting.values[i];
                    var value_node = make_dropdown_option(value);
                    value_node.onclick = (function(setting, value, button, dropdown) {
                        return function(e) {
                            button.innerHTML = value.name;
                            writeSetting(setting.id, value.value);
                            toggleClass(dropdown, "active");
                            e.stopPropagation();
                        }
                    })(setting, value, button, dropdown);
                    options.appendChild(value_node);
                }
                dropdown.appendChild(options);
            break;
        }
    }
})();