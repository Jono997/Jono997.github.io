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
                    css.setProperty('--theme-bg-colour', j99_themes[value].bg_colour);
                    css.setProperty('--theme-text-colour', j99_themes[value].text_colour);
                }
            },
            {
                name: "Font size",
                id: "fontsize",
                type: "number",
                min: 5,
                default: 16,
                update: function(value) {
                    var css = document.documentElement.style;
                    css.setProperty('--theme-font-size', `${value}px`);
                }
            },
            {
                name: "Page width",
                id: "pagewidth",
                type: "slider",
                min: 5,
                max: 100,
                default: 90,
                update: function(value) {
                    var css = document.documentElement.style;
                    css.setProperty('--theme-width', `${value}%`);
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
            case "number":
                var numeric = document.createElement("input");
                var attributes = {
                    type: "number"
                };
                if (Object.hasOwn(setting, "min"))
                    attributes["min"] = setting.min;
                if (Object.hasOwn(setting, "max"))
                    attributes["max"] = setting.max;
                for (name in attributes)
                {
                    var attribute = document.createAttribute(name);
                    attribute.value = attributes[name];
                    numeric.attributes.setNamedItem(attribute);
                }
                numeric.value = j99_settings[setting.id];
                numeric.onchange = (function(setting, numeric) {
                    return function() {
                        writeSetting(setting.id, numeric.value);
                    }
                })(setting, numeric);
                settings_menu.appendChild(numeric);
            break;
            case "slider":
                var slider = document.createElement("div");
                slider.classList.add("slider");
                settings_menu.appendChild(slider);
                
                var numeric = document.createElement("input");
                var num_attributes = {
                    type: "number",
                    min: setting.min,
                    max: setting.max
                };
                for (name in num_attributes)
                {
                    var attribute = document.createAttribute(name);
                    attribute.value = num_attributes[name];
                    numeric.attributes.setNamedItem(attribute);
                }
                numeric.value = j99_settings[setting.id];
                
                var actual_slider = document.createElement("input");
                var as_attributes = {
                    type: "range",
                    min: setting.min,
                    max: setting.max
                };
                for (name in as_attributes)
                    {
                        var attribute = document.createAttribute(name);
                        attribute.value = as_attributes[name];
                        actual_slider.attributes.setNamedItem(attribute);
                    }
                    actual_slider.value = j99_settings[setting.id];
                    
                    numeric.onchange = (function(setting, numeric, actual_slider) {
                        return function() {
                            actual_slider.value = numeric.value;
                            writeSetting(setting.id, numeric.value);
                        }
                    })(setting, numeric, actual_slider);
                    actual_slider.oninput = (function(numeric, actual_slider) {
                        return function() {
                        numeric.value = actual_slider.value;
                        writeSetting(setting.id, actual_slider.value);
                    }
                })(numeric, actual_slider);
                slider.appendChild(actual_slider);
                slider.appendChild(numeric);
            break;
        }
    }
})();