window.loadPage = async function(path, updateURL, updateHistory)
{
    // Save current page to push to history later
    var prev_path = window.location.pathname;

    // Redirection to index
    // path can't be empty otherwise updating the url won't work
    if (path === "")
        path = "/"
    var _path = path;
    if (path === "/")
        _path = "/index";

    // Get page and split into sections
    var page_req = await fetch(`pages/${_path}`);
    if (!page_req.ok)
        throw `Page '${_path}' doesn't exist.`;

    var page_sections_raw = (await page_req.text()).split(/\r?\n(?=\[.+?\])/);
    var page_sections = {};
    for (section of page_sections_raw)
        {
            var section_type_match = section.match(/\[(.+?)\]\r?\n/)
        var section_type = section_type_match[1];
        var section_body = section.slice(section_type_match[0].length);
        page_sections[section_type] = section_body;
    }

    // Clear old page contents out of the DOM
    var remove_elements = document.getElementsByClassName("subpage-node");
    while (remove_elements.length > 0)
        remove_elements[0].remove();
    document.getElementById("subpage-main").innerHTML = "";

    // Parse and add new page contents
    var parser = new DOMParser();
    var valid_sections = ["head", "body", "body-end", "main"];
    for (s of valid_sections)
    {
        if (!Object.hasOwn(page_sections, s))
            continue;
        var section = page_sections[s];
        switch (s)
        {
            case "head":
                var section_parsed = parser.parseFromString(`<!Doctype HTML><html><head>${section}</head><body></body></html>`, 'text/html');
                var section_end = document.head.firstChild;
                for (child of section_parsed.head.children)
                {
                    child.classList.add("subpage-node");
                    document.head.insertBefore(child, section_end);
                }
            break;
            case "body":
                var section_parsed = parser.parseFromString(`<!Doctype HTML><html><head></head><body>${section}</body></html>`, 'text/html');
                var section_end = document.body.firstChild;
                for (child of section_parsed.body.children)
                {
                    child.classList.add("subpage-node");
                    document.body.insertBefore(child, section_end);
                }
            break;
            case "body-end":
                var section_parsed = parser.parseFromString(`<!Doctype HTML><html><head></head><body>${section}</body></html>`, 'text/html');
                for (child of section_parsed.body.children)
                {
                    child.classList.add("subpage-node");
                    document.body.appendChild(child);
                }
            break;
            case "main":
                document.getElementById("subpage-main").innerHTML = section;
            break;
        }
    }

    // Update navigation if required
    if (updateHistory)
        history.pushState(prev_path, "", prev_path);
    if (updateURL)
        history.replaceState(path, "", path);

    // Update background if required
    if (Object.hasOwn(window, "j99_settings") && j99_settings.bgisrandom && j99_settings.bgrandomperpage)
        updateBackground();
};

(function() {
    var path = window.location.pathname;
    loadPage(path, true, false);
    addEventListener("popstate", (event) => {
        if (event.state)
            loadPage(event.state, true, false);
    });
})();