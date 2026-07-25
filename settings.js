(async function(){
    var getSettingsTemplate = function(theme_list) {
        return [
            {
                name: "Theme",
                id: "theme",
                type: "dropdown",
                values: theme_list,
                default: 0,
                hover_preview: true,
                visible: true,
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
                visible: true,
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
                visible: true,
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
        retval.attributes.setNamedItem(makeAttribute("data-dropdown-value", option.value));
        return retval;
    };

    // Populate settings menu
    var settings_menu = document.getElementById("settings-menu");
    for (s in j99_settings_template)
    {
        var setting = j99_settings_template[s];
        var wrapper = document.createElement("div");
        wrapper.classList.add("setting");
        wrapper.attributes.setNamedItem(makeAttribute("setting-id", setting.id));
        if (setting.hidden)
            wrapper.classList.add("hidden");
        settings_menu.appendChild(wrapper);

        var header = document.createElement("h3");
        header.innerHTML = setting.name;
        wrapper.appendChild(header);
        switch (setting.type)
        {
            case "dropdown":
                var dropdown = document.createElement("div");
                dropdown.classList.add("dropdown");
                wrapper.appendChild(dropdown);
                
                var button = document.createElement("span");
                button.classList.add("dropdown-button");
                for (value of setting.values)
                    if (j99_settings[setting.id] == value.value)
                        button.innerHTML = value.name;
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
                    if (setting.hover_preview)
                        value_node.onmouseenter = (function(setting, value) {
                        return function() {
                            if (setting.hover_end_timeout)
                            {
                                clearTimeout(setting.hover_end_timeout);
                                setting.hover_end_timeout = undefined;
                            }
                            setting.update(value.value);
                        }
                    })(setting, value);
                    value_node.onmouseleave = (function(setting) {
                        return function() {
                            setting['hover_end_timeout'] = setTimeout(function() {
                                setting.update(j99_settings[setting.id]);
                            }, 10);
                        }
                    })(setting);
                    options.appendChild(value_node);
                }
                dropdown.appendChild(options);
            break;
            case "number":
                var numeric = document.createElement("input");
                var attributes = [
                    ["type", "number"]
                ];
                if (Object.hasOwn(setting, "min"))
                    attributes.push(["min", setting.min]);
                if (Object.hasOwn(setting, "max"))
                    attributes.push(["max", setting.max]);
                for (attr of attributes)
                    numeric.attributes.setNamedItem(makeAttribute(attr[0], attr[1]));
                numeric.value = j99_settings[setting.id];
                numeric.onchange = (function(setting, numeric) {
                    return function() {
                        writeSetting(setting.id, numeric.value);
                    }
                })(setting, numeric);
                wrapper.appendChild(numeric);
            break;
            case "slider":
                var slider = document.createElement("div");
                slider.classList.add("slider");
                wrapper.appendChild(slider);
                
                var numeric = document.createElement("input");
                var num_attributes = [
                    ["type", "number"],
                    ["min", setting.min],
                    ["max", setting.max]
                ];
                for (attr of num_attributes)
                    numeric.attributes.setNamedItem(makeAttribute(attr[0], attr[1]));
                numeric.value = j99_settings[setting.id];
                
                var actual_slider = document.createElement("input");
                var as_attributes = [
                    ["type", "range"],
                    ["min", setting.min],
                    ["max", setting.max]
                ];
                for (attr of as_attributes)
                    actual_slider.attributes.setNamedItem(makeAttribute(attr[0], attr[1]));
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

function showSetting(setting_id)
{
    document.querySelector(`.setting[setting-id="${setting_id}"]`).classList.remove("hidden");
}

function hideSetting(setting_id)
{
    document.querySelector(`.setting[setting-id="${setting_id}"]`).classList.add("hidden");
}