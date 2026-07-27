(async function(){
    var getSettingsTemplate = function(theme_list, background_list, tag_list) {
        var retval = [
            {
                name: "Theme",
                id: "theme",
                type: "dropdown",
                values: theme_list,
                default: 0,
                hover_preview: true,
                update: function(value) {
                    var css = document.documentElement.style;
                    css.setProperty('--theme-bg-colour', j99_themes[value].bg_colour);
                    css.setProperty('--theme-text-colour', j99_themes[value].text_colour);
                }
            },
            {
                name: "Background",
                id: "bgisrandom",
                type: "radio",
                values: [
                    {
                        name: "Specific",
                        value: false
                    },
                    {
                        name: "Random",
                        value: true
                    }
                ],
                default: 1,
                update: function(value) {
                    var bg_setting_groups = [
                        ["bg"],
                        ["bgtags", "bgrandomperpage"]
                    ];
                    for (setting of bg_setting_groups[0])
                        (value ? hideSetting : showSetting)(setting);
                    for (setting of bg_setting_groups[1])
                        (value ? showSetting : hideSetting)(setting);
                }
            },
            {
                no_name: true,
                id: "bg",
                type: "dropdown",
                values: background_list,
                hover_preview: true,
                hidden: true,
                default: 1,
                update: function(value) {
                    if (!j99_settings.bgisrandom)
                        document.documentElement.style.setProperty('--theme-background', `url("assets/bg/${j99_backgrounds[value].filename}")`);
                }
            },
            {
                name: "Background tags",
                id: "bgtags",
                type: "tagfilter",
                hidden: true,
                default: {whitelist: [], blacklist: []},
                values: tag_list
            },
            {
                name: "Background change frequency",
                id: "bgrandomperpage",
                type: "radio",
                values: [
                    {
                        name: "Per-refresh",
                        value: false
                    },
                    {
                        name: "Per-page",
                        value: true
                    }
                ],
                hidden: true,
                default: 1
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

        // Filling defaults
        var def = {
            name: "",
            no_name: false,
            hover_preview: false,
            visible: true,
            update: function() {}
        };

        for (setting of retval)
            for (param in def)
                if (!Object.hasOwn(setting, param))
                    setting[param] = def[param];
        return retval;
    };


    window.j99_hide_furry_style = document.createElement("style");
    document.head.appendChild(j99_hide_furry_style);

    window.j99_themes = await (async function() {
        var themes_query = await fetch("themes.json");
        if (themes_query.ok)
            return await themes_query.json();
        return {};
    })();

    var theme_list = [];
    for (theme in j99_themes)
        theme_list.push({
            name: j99_themes[theme].name,
            value: theme
        });

    window.j99_backgrounds = await (async function() {
        var bg_query = await fetch("assets/bg/backgrounds.json");
        if (bg_query.ok)
            return await bg_query.json();
    })();

    var bg_list = [];
    var tag_list = [];
    for (i in j99_backgrounds)
    {
        var bg = j99_backgrounds[i];
        bg_list.push({
            name: bg.name,
            value: i,
            html: `<div class="background-dropdown"><div class="background-thumbnail" style="background-image: url(assets/bg/${bg.filename});"></div><div class="background-label">${bg.name}</div></div>`,
        });
        for (tag of bg.tags)
            if (!tag_list.includes(tag))
                tag_list.push(tag);
    }
    for (i in tag_list)
        tag_list[i] = {
            name: tag_list[i],
            value: tag_list[i]
        };

    window.j99_settings_template = getSettingsTemplate(theme_list, bg_list, tag_list);

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

        if (!setting.no_header)
        {
            var header = document.createElement("h3");
            header.innerHTML = setting.name;
            wrapper.appendChild(header);
        }
        switch (setting.type)
        {
            case "placeholder":
                var placeholder = document.createElement("div");
                placeholder.innerHTML = "To be added";
                wrapper.appendChild(placeholder);
            break;

            case "dropdown": (function(setting) {
                var dropdown = document.createElement("div");
                dropdown.classList.add("dropdown");
                wrapper.appendChild(dropdown);
                
                var button = document.createElement("span");
                button.classList.add("dropdown-button");
                for (value of setting.values)
                    if (j99_settings[setting.id] == value.value)
                        button.innerHTML = value.name;
                button.onclick = (e) => {
                    openDropdown(dropdown);
                    e.stopPropagation();
                };
                dropdown.appendChild(button);

                var options = document.createElement("div");
                options.classList.add("dropdown-options");
                for (value of setting.values)
                {
                    (function(setting, value, button, dropdown) {
                        var value_node = make_dropdown_option(value);
                        value_node.onclick = function(e) {
                            button.innerHTML = value.name;
                            writeSetting(setting.id, value.value);
                            if (!setting.hover_preview)
                                setting.update(value.value);
                            toggleClass(dropdown, "active");
                            e.stopPropagation();
                        }
                        
                        if (setting.hover_preview)
                            value_node.onmouseenter = function() {
                                if (setting.hover_end_timeout)
                                {
                                    clearTimeout(setting.hover_end_timeout);
                                    setting.hover_end_timeout = undefined;
                                }
                                setting.update(value.value);
                            }
                        value_node.onmouseleave = function() {
                            setting['hover_end_timeout'] = setTimeout(function() {
                                setting.update(j99_settings[setting.id]);
                            }, 10);
                        }
                        options.appendChild(value_node);
                    })(setting, value, button, dropdown);
                }
                dropdown.appendChild(options);
            })(setting); break;
            
            case "radio": (function(setting) {
                var options = document.createElement("div");
                options.classList.add("flexbox");
                for (value of setting.values)
                {
                    var value_container = document.createElement("span");
                    options.appendChild(value_container);

                    var value_node = document.createElement("input");
                    value_node.type = "radio";
                    value_node.name = `setting-${setting.id}`;
                    value_node.id = value.value;
                    value_node.checked = (j99_settings[setting.id] == value.value);
                    value_container.appendChild(value_node);

                    var value_label = document.createElement("label");
                    value_label.for = value.value;
                    value_label.innerHTML = value.name;
                    value_container.appendChild(value_label);
                    
                    value_node.onclick = value_label.onclick = (function(setting, value, value_node) {
                        return function() {
                            value_node.checked = true;
                            writeSetting(setting.id, value.value);
                            setting.update(value.value);
                        }
                    })(setting, value, value_node);
                }
                wrapper.appendChild(options);
            })(setting); break;

            case "number": (function(setting) {
                var numeric = document.createElement("input");
                numeric.type = "number";
                if (Object.hasOwn(setting, "min"))
                    numeric.min = setting.min;
                if (Object.hasOwn(setting, "max"))
                    numeric.max = setting.max;
                numeric.value = j99_settings[setting.id];
                numeric.onchange = (function(setting, numeric) {
                    return function() {
                        writeSetting(setting.id, numeric.value);
                    }
                })(setting, numeric);
                wrapper.appendChild(numeric);
            })(setting); break;

            case "slider": (function(setting) {
                var slider = document.createElement("div");
                slider.classList.add("slider");
                wrapper.appendChild(slider);
                
                var numeric = document.createElement("input");
                numeric.type = "number";
                numeric.min = setting.min;
                numeric.max = setting.max;
                numeric.value = j99_settings[setting.id];
                
                var actual_slider = document.createElement("input");
                actual_slider.type = "range";
                actual_slider.min = setting.min;
                actual_slider.max = setting.max;
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
            })(setting); break;

            case "tagfilter": (function(setting) {
                var container = document.createElement("div");
                container.classList.add("flexbox");
                container.style.setProperty("justify-content", "space-around");
                wrapper.appendChild(container);

                for (tag of setting.values)
                    (function(setting, tag){
                        var tag_node = document.createElement("span");
                        tag_node.classList.add("tag-filter");
                        tag_node.attributes.setNamedItem(makeAttribute("tag-id", tag.value));
                        tag_node.innerHTML = tag.name;
                        var tag_state = makeAttribute("tag-state", "unset");
                        if (j99_settings[setting.id].whitelist.includes(tag.id))
                            tag_state.value = "include";
                        if (j99_settings[setting.id].blacklist.includes(tag.id))
                            tag_state.value = "exclude";
                        tag_node.attributes.setNamedItem(tag_state);
                        tag_node.onclick = function() {
                            var states = ["unset", "include", "exclude", "unset"];
                            var tag_state = tag_node.attributes["tag-state"];
                            tag_state.value = states[states.indexOf(tag_state.value) + 1];
                            
                            for (list of [j99_settings[setting.id].whitelist, j99_settings[setting.id].blacklist])
                            {
                                var i = list.indexOf(tag.value);
                                if (i >= 0)
                                {
                                    list = list.splice(i, 1);
                                }
                            }
                            if (tag_state.value === "include")
                                j99_settings[setting.id].whitelist.push(tag.id);
                            if (tag_state.value === "exclude")
                                j99_settings[setting.id].blacklist.push(tag.id);
                            setting.update(tag);
                        };
                        container.appendChild(tag_node);
                    })(setting, tag);
            })(setting); break;

            case "checkbox": (function(setting) {
                var checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.onchange = function() {
                    j99_settings[setting.id] = checkbox.checked;
                    setting.update(checkbox.checked);
                }
                wrapper.appendChild(checkbox);

                var label = document.createElement("label");
                label.innerHTML = setting.name;
                wrapper.appendChild(label);

                label.onclick = function() {
                    checkbox.checked = !checkbox.checked;
                    j99_settings[setting.id] = checkbox.checked;
                    setting.update(checkbox.checked);
                }
            })(setting); break;
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
        for (setting of j99_settings_template)
        {
            if (id === setting.id)
                setting.update(value);
        }
    };

    window.updateBackground = function() {
        if (j99_settings.bgisrandom)
        {
            while (true)
            {
                var i = Math.floor(Math.random() * j99_backgrounds.length);
                var bg = j99_backgrounds[i];
                for (whitelisted_tag of j99_settings.bgtags.whitelist)
                    if (!bg.tags.includes(whitelisted_tag))
                        continue;
                for (blacklisted_tag of j99_settings.bgtags.blacklist)
                    if (bg.tags.includes(blacklisted_tag))
                        continue;
                document.documentElement.style.setProperty('--theme-background', `url("assets/bg/${bg.filename}")`);
                break;
            }
        }
    }

    updateBackground();
})();

function showSetting(setting_id)
{
    document.querySelector(`.setting[setting-id="${setting_id}"]`).classList.remove("hidden");
}

function hideSetting(setting_id)
{
    document.querySelector(`.setting[setting-id="${setting_id}"]`).classList.add("hidden");
}