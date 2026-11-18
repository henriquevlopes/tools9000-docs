/* Builds the sidebar, search, theme toggle and previous/next links from nav.js (window.T9K_NAV). */
(function () {
  var s = document.currentScript, base = s.src.replace(/site\.js.*$/, "");
  var NAV = window.T9K_NAV || [];
  var here = location.pathname.replace(/\/index\.html$/, "/");
  function url(slug) { return base + (slug === "index" ? "" : "tools/" + slug + ".html"); }

  /* theme */
  var saved = null;
  try { saved = localStorage.getItem("t9k-theme"); } catch (e) {}
  if (saved) document.documentElement.setAttribute("data-theme", saved);

  /* top bar */
  var bar = document.querySelector("header.site > div");
  if (bar) {
    var oldNav = bar.querySelector("nav"); if (oldNav) oldNav.remove();
    bar.querySelector("a").setAttribute("href", base);
    var tb = document.createElement("div"); tb.className = "tb";
    tb.innerHTML = '<div class="search"><input type="search" placeholder="Search tools" aria-label="Search tools"></div>' +
      '<button class="iconbtn" id="theme" title="Light / dark" aria-label="Light or dark theme">◐</button>' +
      '<button class="iconbtn" id="menu" aria-label="Menu">☰</button>';
    bar.appendChild(tb);
  }

  /* sidebar */
  var main = document.querySelector("main");
  if (main && NAV.length) {
    document.body.classList.add("has-side");
    var side = document.createElement("aside"); side.className = "side";
    var h = '<a href="' + base + '"' + (here === new URL(base).pathname ? ' class="on"' : "") + '>Overview</a>';
    NAV.forEach(function (g) {
      h += "<h4>" + g.group + "</h4>";
      g.items.forEach(function (it) {
        var u = url(it[0]);
        h += '<a href="' + u + '" data-t="' + it[1].toLowerCase() + " " + (it[2] || "").toLowerCase() + '"' +
          (location.pathname.endsWith("/tools/" + it[0] + ".html") ? ' class="on"' : "") + ">" + it[1] + "</a>";
      });
    });
    side.innerHTML = h;
    var lay = document.createElement("div"); lay.className = "layout";
    main.parentNode.insertBefore(lay, main); lay.appendChild(side); lay.appendChild(main);

    /* previous / next */
    var flat = []; NAV.forEach(function (g) { g.items.forEach(function (it) { flat.push(it); }); });
    var i = flat.findIndex(function (it) { return location.pathname.endsWith("/tools/" + it[0] + ".html"); });
    if (i >= 0) {
      var pn = document.createElement("div"); pn.className = "pn";
      var p = flat[i - 1], n = flat[i + 1];
      pn.innerHTML = (p ? '<a href="' + url(p[0]) + '"><small>Previous</small>' + p[1] + "</a>" : "<span></span>") +
                     (n ? '<a href="' + url(n[0]) + '"><small>Next</small>' + n[1] + "</a>" : "<span></span>");
      main.appendChild(pn);
    }
    var on = side.querySelector("a.on"); if (on && on.scrollIntoView) on.scrollIntoView({ block: "center" });
  }

  /* behaviour */
  document.addEventListener("click", function (e) {
    if (e.target.id === "theme") {
      var cur = document.documentElement.getAttribute("data-theme") ||
        "dark";
      var nx = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nx);
      try { localStorage.setItem("t9k-theme", nx); } catch (x) {}
    } else if (e.target.id === "menu") document.body.classList.toggle("menu-open");
    else if (e.target.closest && e.target.closest("aside.side a")) document.body.classList.remove("menu-open");
  });
  document.addEventListener("input", function (e) {
    if (!e.target.matches(".search input")) return;
    var q = e.target.value.trim().toLowerCase();
    document.querySelectorAll("aside.side a[data-t]").forEach(function (a) {
      a.classList.toggle("hide", q && a.dataset.t.indexOf(q) < 0);
    });
    document.querySelectorAll("aside.side h4").forEach(function (h4) {
      var n = h4.nextElementSibling, any = false;
      while (n && n.tagName === "A") { if (!n.classList.contains("hide")) any = true; n = n.nextElementSibling; }
      h4.style.display = any ? "" : "none";
    });
    document.body.classList.add("menu-open");
  });
})();
