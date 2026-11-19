(function () {
  "use strict";
  var WA = "224628905783";
  var CFG = window.MICHOU_CONFIG || {};
  var ONLINE = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
  var session = load("michou-session", null);
  var K = { cat: "michou-catalogue", cart: "michou-panier", set: "michou-parametres", cookie: "michou-cookie-choice" };
  var CATS = ["Vêtements", "Chaussures", "Montres", "Bijoux", "Cosmétiques", "Business"];
  var IMG = {
    "Vêtements": "photo-1483985988355-763728e1935b", "Chaussures": "photo-1542291026-7eec264c27ff",
    "Montres": "photo-1524805444758-089113d48a6d", "Bijoux": "photo-1611652022419-a9419f74343d",
    "Cosmétiques": "photo-1608248543803-ba4f8c70ae0b", "Business": "photo-1521737711867-e3b97375f902"
  };
  function $(id) { return document.getElementById(id); }
  function load(key, def) { try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? def : v; } catch (e) { return def; } }
  function save(key, v) { localStorage.setItem(key, JSON.stringify(v)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function gnf(n) { return n > 0 ? new Intl.NumberFormat("fr-FR").format(n).replace(/\u202f|\u00a0/g, " ") + " GNF" : "Prix à confirmer"; }
  function imgUrl(p) { return p.img || "https://images.unsplash.com/" + IMG[p.cat] + "?auto=format&fit=crop&w=700&q=75"; }

  function seed() {
    return CATS.map(function (c, i) {
      return { id: "p" + (i + 1), cat: c, name: c === "Business" ? "Offre business" : "Article " + c.toLowerCase(), price: 0, desc: "Exemple à modifier depuis le mode gestion.", img: "" };
    });
  }
  var products = ONLINE ? [] : (load(K.cat, null) || seed());
  var cart = load(K.cart, {});
  var settings = ONLINE ? { num: "…", name: "MICHOU SHOOP" } : load(K.set, { num: "à communiquer par WhatsApp", name: "MICHOU SHOOP" });
  var admin = false, editId = null;

  function headers(extra) {
    var h = { "apikey": CFG.SUPABASE_ANON_KEY, "Authorization": "Bearer " + (session ? session.access_token : CFG.SUPABASE_ANON_KEY), "Content-Type": "application/json" };
    return Object.assign(h, extra || {});
  }
  function api(method, path, body, extra) {
    return fetch(CFG.SUPABASE_URL + path, { method: method, headers: headers(extra), body: body ? JSON.stringify(body) : undefined }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(t || r.status); });
      return r.status === 204 ? null : r.text().then(function (t) { return t ? JSON.parse(t) : null; });
    });
  }
  function toRow(p) { return { id: p.id, cat: p.cat, name: p.name, price: p.price, descr: p.desc, img: p.img }; }
  function fromRow(r) { return { id: r.id, cat: r.cat, name: r.name, price: r.price, desc: r.descr || "", img: r.img || "" }; }
  function setStatus(msg) { var s = $("db-status"); if (s) s.textContent = msg; }
  function refresh() {
    if (!ONLINE) return Promise.resolve();
    return Promise.all([api("GET", "/rest/v1/products?select=*&order=created_at.asc"), api("GET", "/rest/v1/settings?select=*")]).then(function (res) {
      products = res[0].map(fromRow);
      res[1].forEach(function (r) { if (r.key === "orange") settings = r.value; });
      if (!document.querySelector("dialog[open]")) render();
      setStatus("Catalogue en ligne synchronisé.");
    }).catch(function () { setStatus("Connexion à la base impossible : réessayez plus tard."); });
  }
  function persist(action, p) {
    if (!ONLINE) { save(K.cat, products); return Promise.resolve(); }
    var req = action === "del" ? api("DELETE", "/rest/v1/products?id=eq." + encodeURIComponent(p)) :
      api("POST", "/rest/v1/products", toRow(p), { "Prefer": "resolution=merge-duplicates,return=minimal" });
    return req.then(refresh).catch(function (e) { alert("Enregistrement refusé (connectez-vous en mode gestion) : " + e.message); return refresh(); });
  }
  function persistSettings() {
    if (!ONLINE) { save(K.set, settings); return Promise.resolve(); }
    return api("POST", "/rest/v1/settings", { key: "orange", value: settings }, { "Prefer": "resolution=merge-duplicates,return=minimal" }).catch(function (e) { alert("Enregistrement refusé : " + e.message); });
  }
  function login(email, pass) {
    return fetch(CFG.SUPABASE_URL + "/auth/v1/token?grant_type=password", { method: "POST", headers: { "apikey": CFG.SUPABASE_ANON_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email: email, password: pass }) })
      .then(function (r) { if (!r.ok) throw new Error("bad"); return r.json(); })
      .then(function (s) { session = { access_token: s.access_token, exp: Date.now() + s.expires_in * 1000 }; save("michou-session", session); });
  }

  function render() {
    var html = "";
    CATS.forEach(function (c) {
      var list = products.filter(function (p) { return p.cat === c; });
      html += '<div class="cat"><div class="cat-head"><h3>' + esc(c) + '</h3><button class="btn2 admin-only" data-add="' + esc(c) + '">+ Ajouter un article</button></div><div class="grid">';
      list.forEach(function (p) {
        html += '<article class="card"><img src="' + esc(imgUrl(p)) + '" alt="' + esc(p.name) + '" width="700" height="470" loading="lazy"><div class="card-body"><h3>' + esc(p.name) + '</h3><p>' + esc(p.desc) + '</p><div class="price">' + gnf(p.price) + '</div><div class="actions"><button class="button" data-buy="' + p.id + '">Ajouter au panier</button><button class="btn2 admin-only" data-edit="' + p.id + '">Modifier</button><button class="btn2 danger admin-only" data-del="' + p.id + '">Supprimer</button></div></div></article>';
      });
      if (!list.length) html += '<p class="intro">Aucun article dans cette catégorie.</p>';
      html += "</div></div>";
    });
    $("catalog").innerHTML = html;
    $("om-number-show").textContent = settings.num; $("om-name-show").textContent = settings.name;
    document.querySelectorAll(".om-n").forEach(function (e) { e.textContent = settings.num; });
    document.querySelectorAll(".om-b").forEach(function (e) { e.textContent = settings.name; });
    renderCart();
  }

  function cartItems() {
    return Object.keys(cart).map(function (id) {
      var p = products.filter(function (x) { return x.id === id; })[0];
      return p ? { p: p, q: cart[id] } : null;
    }).filter(Boolean);
  }
  function renderCart() {
    var items = cartItems(), total = 0, count = 0, html = "";
    items.forEach(function (i) {
      total += i.p.price * i.q; count += i.q;
      html += '<div class="cart-line"><span>' + esc(i.p.name) + '<br><small>' + gnf(i.p.price) + '</small></span><span class="qty"><button class="btn2" data-dec="' + i.p.id + '" aria-label="Moins">−</button>' + i.q + '<button class="btn2" data-inc="' + i.p.id + '" aria-label="Plus">+</button><button class="btn2 danger" data-rm="' + i.p.id + '" aria-label="Retirer">✕</button></span></div>';
    });
    $("cart-lines").innerHTML = html || "<p>Votre panier est vide.</p>";
    $("cart-total").textContent = items.length ? "Total : " + gnf(total) : "";
    $("cart-count").textContent = count;
    save(K.cart, cart);
  }

  function openItem(cat, id) {
    editId = id || null;
    var p = id ? products.filter(function (x) { return x.id === id; })[0] : { cat: cat, name: "", price: "", desc: "", img: "" };
    $("item-title").textContent = id ? "Modifier l’article" : "Ajouter un article";
    $("f-cat").innerHTML = CATS.map(function (c) { return '<option' + (c === p.cat ? " selected" : "") + '>' + c + '</option>'; }).join("");
    $("f-name").value = p.name; $("f-price").value = p.price; $("f-desc").value = p.desc; $("f-img").value = p.img;
    $("item-dialog").showModal();
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("button,a"); if (!t) return;
    var d = t.dataset;
    if (t.id === "open-cart") { e.preventDefault(); $("cart-dialog").showModal(); return; }
    if (d.close !== undefined) { t.closest("dialog").close(); return; }
    if (d.buy) { cart[d.buy] = (cart[d.buy] || 0) + 1; renderCart(); $("cart-count").parentNode.focus(); return; }
    if (d.inc) { cart[d.inc]++; renderCart(); }
    if (d.dec) { if (--cart[d.dec] <= 0) delete cart[d.dec]; renderCart(); }
    if (d.rm) { delete cart[d.rm]; renderCart(); }
    if (d.add) openItem(d.add);
    if (d.edit) openItem(null, d.edit);
    if (d.del && confirm("Supprimer cet article ?")) {
      products = products.filter(function (p) { return p.id !== d.del; });
      delete cart[d.del]; render(); persist("del", d.del);
    }
  });

  $("item-form").addEventListener("submit", function () {
    var data = { cat: $("f-cat").value, name: $("f-name").value.trim(), price: Math.max(0, parseInt($("f-price").value, 10) || 0), desc: $("f-desc").value.trim(), img: $("f-img").value.trim() };
    var saved;
    if (editId) { products = products.map(function (p) { if (p.id === editId) { saved = Object.assign(p, data); return saved; } return p; }); }
    else { data.id = "p" + Date.now(); products.push(data); saved = data; }
    render(); persist("save", saved);
  });

  function setAdmin(on) {
    admin = on;
    document.body.classList.toggle("admin", admin);
    $("admin-toggle").textContent = admin ? "Quitter le mode gestion" : "Mode gestion (propriétaire)";
  }
  $("admin-toggle").addEventListener("click", function () {
    if (admin) { session = null; localStorage.removeItem("michou-session"); setAdmin(false); return; }
    if (!ONLINE) { alert("Base en ligne non configurée : voir HEBERGEMENT.md (config.js)."); setAdmin(true); return; }
    $("login-dialog").showModal();
  });
  $("login-form").addEventListener("submit", function () {
    login($("l-email").value.trim(), $("l-pass").value).then(function () { $("l-pass").value = ""; setAdmin(true); })
      .catch(function () { alert("E-mail ou mot de passe incorrect."); });
  });
  if (session && session.exp > Date.now()) setAdmin(true); else session = null;
  $("reset-catalog").addEventListener("click", function () {
    if (confirm("Réinitialiser tout le catalogue ?")) { products = seed(); cart = {}; render(); products.forEach(function (p) { persist("save", p); }); }
  });
  $("edit-settings").addEventListener("click", function () { $("s-num").value = settings.num; $("s-name").value = settings.name; $("set-dialog").showModal(); });
  $("set-form").addEventListener("submit", function () { settings = { num: $("s-num").value.trim(), name: $("s-name").value.trim() }; render(); persistSettings(); });
  $("clear-cart").addEventListener("click", function () { cart = {}; renderCart(); });

  $("order-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if ($("o-hp").value) return;
    var items = cartItems(); if (!items.length) { alert("Votre panier est vide."); return; }
    var total = 0, lines = items.map(function (i) { total += i.p.price * i.q; return "- " + i.q + " x " + i.p.name + " (" + gnf(i.p.price) + ")"; });
    var msg = "Bonjour MICHOU SHOOP, je souhaite commander :\n" + lines.join("\n") + "\nTotal : " + gnf(total) +
      "\nPaiement : Orange Money (GNF), référence " + $("o-ref").value.trim() +
      "\nNom : " + $("o-name").value.trim() + "\nTéléphone : " + $("o-phone").value.trim() + "\nLivraison : " + $("o-addr").value.trim();
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    cart = {}; renderCart(); $("cart-dialog").close();
  });

  $("year").textContent = new Date().getFullYear();
  var banner = $("cookie-banner");
  if (!localStorage.getItem(K.cookie)) banner.style.display = "block";
  ["accept", "reject"].forEach(function (c) {
    $("cookie-" + c).addEventListener("click", function () { localStorage.setItem(K.cookie, c); banner.style.display = "none"; });
  });
  render();
  if (ONLINE) {
    setStatus("Chargement du catalogue en ligne…");
    refresh().then(function () { if (!products.length) { seed().forEach(function (p) { if (session) persist("save", p); }); } });
    setInterval(refresh, 15000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) refresh(); });
  }
})();
