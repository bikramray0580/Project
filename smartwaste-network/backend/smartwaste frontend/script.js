document.addEventListener("DOMContentLoaded", function () {

  // ===========================
  // CONFIG
  // ===========================
  const API_BASE_URL = "/api";

  // ===========================
  // SESSION HELPERS
  // ===========================
  function getSession() {
    const s =
      sessionStorage.getItem("greenlink_session") ||
      localStorage.getItem("greenlink_session");
    if (!s) return null;
    try { return JSON.parse(s); } catch { return null; }
  }

  function saveSession(data, remember = false) {
    const json = JSON.stringify(data);
    if (remember) localStorage.setItem("greenlink_session", json);
    else sessionStorage.setItem("greenlink_session", json);
  }

  function clearSession() {
    sessionStorage.removeItem("greenlink_session");
    localStorage.removeItem("greenlink_session");
  }

  // ===========================
  // LOGOUT
  // ===========================
  window.logout = function () {
    clearSession();
    window.location.href = "./index.html";
  };

  const navLogout = document.getElementById("nav-logout");
  if (navLogout) {
    navLogout.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  // ===========================
  // PAGE PROTECTION
  // ===========================
  (function protect() {
    const body = document.body;
    const requiredRole = body.dataset.role;

    if (body.dataset.protected === "true") {
      const s = getSession();
      if (!s) return (window.location.href = "./index.html#login");
      if (requiredRole && s.role !== requiredRole) {
        return (window.location.href = "./index.html");
      }
    }
  })();

  // ===========================
  // LOGIN MODAL
  // ===========================
  const loginModal = document.getElementById("login");
  const navLoginLink = document.getElementById("nav-login-link");
  const closeBtn = document.getElementById("glCloseBtn");
  const backdrop = document.querySelector(".gl-backdrop");

  if (navLoginLink && loginModal) {
    navLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      loginModal.style.display = "block";
      setTimeout(() => loginModal.classList.add("gl-active"), 10);
    });
  }

  function closeLogin() {
    loginModal.classList.remove("gl-active");
    setTimeout(() => (loginModal.style.display = "none"), 150);
  }

  if (closeBtn) closeBtn.addEventListener("click", closeLogin);
  if (backdrop) backdrop.addEventListener("click", closeLogin);

  // ===========================
  // LOGIN SUBMIT
  // ===========================
  const loginForm = document.getElementById("glLoginForm");

  if (loginForm) {
    const emailEl = document.getElementById("gl-user");
    const passEl = document.getElementById("gl-pass");
    const togglePass = document.getElementById("gl-togglePass");
    const remember = document.getElementById("gl-remember");
    const msg = document.getElementById("gl-message");

    function showMsg(text, ok = true) {
      msg.textContent = text;
      msg.style.color = ok ? "#0f0" : "#ff4444";
    }

    if (togglePass) {
      togglePass.addEventListener("click", () => {
        passEl.type = passEl.type === "password" ? "text" : "password";
        togglePass.textContent = passEl.type === "password" ? "show" : "hide";
      });
    }

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      showMsg("Logging in...");

      const email = emailEl.value.trim();
      const password = passEl.value.trim();

      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) return showMsg(data.error || "Login failed", false);

        const session = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          name: data.user.name,
          token: data.token,
        };

        saveSession(session, remember.checked);
        showMsg("Login successful ✓");

        setTimeout(() => {
          window.location.href =
            session.role === "admin"
              ? "./admin-dashboard.html"
              : "./user-dashboard.html";
        }, 350);
      } catch {
        showMsg("Server error", false);
      }
    });
  }

  // ===========================
  // MOBILE MENU
  // ===========================
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.getElementById("nav-links");

  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }

  // =====================================================================
  // USER DASHBOARD — Section Switching
  // =====================================================================
  function showSection(id) {
    const sections = ["post-waste", "request-material"];

    sections.forEach((sec) => {
      const el = document.getElementById(sec);
      if (!el) return;

      if (sec === id) {
        el.style.display = "block";
        el.classList.add("is-visible");
      } else {
        el.style.display = "none";
        el.classList.remove("is-visible");
      }
    });

    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  }

  // Nav clicks
  document.querySelectorAll("a[href^='#']").forEach((a) => {
    const id = a.getAttribute("href").replace("#", "");
    if (!["post-waste", "request-material"].includes(id)) return;

    a.addEventListener("click", (e) => {
      e.preventDefault();
      showSection(id);
    });
  });

  // Feature cards
  document.querySelectorAll(".feature-card").forEach((card) => {
    const id = card.dataset.target;
    if (!id) return;

    card.addEventListener("click", (e) => {
      e.preventDefault();
      showSection(id);
    });
  });

  // ===========================
  // POST WASTE FORM
  // ===========================
  const wasteForm = document.getElementById("wasteForm");

  if (wasteForm) {
    const msg = document.getElementById("waste-msg");

    wasteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "Posting...";

      const form = e.target;

      const payload = {
        name: form.name.value,
        type: form.type.value,
        quantity: form.quantity.value,
        location: form.location.value,
        description: form.description.value,
        lat: form.lat.value,
        lng: form.lng.value,
      };

      try {
        const res = await fetch(`${API_BASE_URL}/waste`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          msg.textContent = data.error || "Failed";
          msg.style.color = "red";
          return;
        }

        msg.textContent = "Posted ✓";
        msg.style.color = "green";
        form.reset();
      } catch {
        msg.textContent = "Network error";
        msg.style.color = "red";
      }
    });
  }

  // ===========================
  // LOCATION DETECTION
  // ===========================
  const detectBtn = document.getElementById("detectLocationBtn");
  const geoStatus = document.getElementById("geo-status");
  const latInput = document.getElementById("lat");
  const lngInput = document.getElementById("lng");
  const locationInput = document.getElementById("location");

  if (detectBtn) {
    detectBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        geoStatus.textContent = "Geolocation not supported.";
        geoStatus.style.color = "red";
        return;
      }

      geoStatus.textContent = "Detecting location...";

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          latInput.value = lat;
          lngInput.value = lng;
          locationInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

          geoStatus.textContent = "Location detected ✓";
          geoStatus.style.color = "green";
        },
        () => {
          geoStatus.textContent = "Unable to detect location.";
          geoStatus.style.color = "red";
        }
      );
    });
  }

  // ===========================
  // REQUEST MATERIAL FORM
  // ===========================
  const requestForm = document.getElementById("requestForm");

  if (requestForm) {
    const msg = document.getElementById("request-msg");

    requestForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "Submitting...";

      const form = e.target;
      const items = Array.from(
        form.querySelectorAll("input[name='items']:checked")
      ).map((i) => i.value);

      const payload = {
        material: form.material.value,
        category: form.category.value,
        requiredQuantity: form.requiredQuantity.value,
        useCase: form.useCase.value,
        items,
      };

      try {
        const res = await fetch(`${API_BASE_URL}/request`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          msg.textContent = data.error || "Failed";
          msg.style.color = "red";
          return;
        }

        msg.textContent = "Request submitted ✓";
        msg.style.color = "green";
        form.reset();
      } catch {
        msg.textContent = "Network error";
        msg.style.color = "red";
      }
    });
  }

  // ===========================
  // MAP + STATS
  // ===========================
  const mapEl = document.getElementById("map");
  const statsSummaryEl = document.getElementById("stats-summary");
  const statsListEl = document.getElementById("stats-list");

  let wasteMap = null;
  let markerLayer = null;

  async function loadWastes() {
    try {
      const res = await fetch(`${API_BASE_URL}/waste`);
      const data = await res.json();

      const wastes = data.wastes || [];

      renderMap(wastes);
      renderStats(wastes);
    } catch (err) {
      console.log("Map load error", err);
    }
  }

  function renderMap(wastes) {
    if (!mapEl || typeof L === "undefined") return;

    if (!wasteMap) {
      wasteMap = L.map("map").setView([20.59, 78.96], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(wasteMap);

      markerLayer = L.layerGroup().addTo(wasteMap);
    }

    markerLayer.clearLayers();
    const bounds = [];

    wastes.forEach((w) => {
      const lat = parseFloat(w.lat);
      const lng = parseFloat(w.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      L.marker([lat, lng])
        .addTo(markerLayer)
        .bindPopup(`<strong>${w.name}</strong><br>${w.location}`);

      bounds.push([lat, lng]);
    });

    if (bounds.length > 0) {
      wasteMap.fitBounds(bounds, { padding: [40, 40] });
    }

    setTimeout(() => wasteMap.invalidateSize(), 300);
  }

  function renderStats(wastes) {
    if (!statsSummaryEl || !statsListEl) return;

    if (!wastes || wastes.length === 0) {
      statsSummaryEl.innerHTML = "<p>No waste listings yet.</p>";
      statsListEl.innerHTML = "";
      return;
    }

    statsSummaryEl.innerHTML = `
      <h3>Total Listings: ${wastes.length}</h3>
    `;

    statsListEl.innerHTML = "";

    wastes.forEach((w) => {
      const card = document.createElement("div");
      card.className = "stats-card";

      card.innerHTML = `
        <h4>${w.name}</h4>
        <p>Type: ${w.type}</p>
        <p>Qty: ${w.quantity}</p>
        <p>Location: ${w.location || "—"}</p>
        <button class="view-map-btn"
          data-lat="${w.lat}"
          data-lng="${w.lng}"
          style="margin-top:8px;padding:8px 12px;background:#008060;color:#fff;border:none;border-radius:5px;cursor:pointer;">
          View on Map
        </button>
      `;

      statsListEl.appendChild(card);
    });

    document.querySelectorAll(".view-map-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lat = parseFloat(btn.dataset.lat);
        const lng = parseFloat(btn.dataset.lng);

        if (wasteMap && !isNaN(lat) && !isNaN(lng)) {
          wasteMap.setView([lat, lng], 15, { animate: true });
        }

        const mapSection = document.getElementById("map-block");
        if (mapSection) mapSection.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  if (mapEl) loadWastes();

}); // END DOMContentLoaded
