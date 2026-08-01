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
                var head_children = document.head.children.length;
                document.head.innerHTML = section + document.head.innerHTML;
                for (var i = 0; i < (document.head.children.length - head_children); i++)
                    document.head.children[i].classList.add("subpage-node");
            break;
            case "body":
                var body_children = document.body.children.length;
                document.body.innerHTML = section + document.body.innerHTML;
                for (var i = 0; i < (document.body.children.length - body_children); i++)
                    document.body.children[i].classList.add("subpage-node");
            break;
            case "body-end":
                var body_children = document.body.children.length;
                document.body.innerHTML = document.body.innerHTML + section;
                for (var i = body_children; i < document.body.children.length; i++)
                    document.body.children[i].classList.add("subpage-node");
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
};

(function() {
    var path = window.location.pathname;
    loadPage(path, true, false);
    addEventListener("popstate", (event) => {
        if (event.state)
            loadPage(event.state, true, false);
    });
})();