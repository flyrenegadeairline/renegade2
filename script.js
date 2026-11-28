const WHATSAPP_NUMBER = "254786799922";
const CALL_NUMBER = "+254786703129";
const CALL_DISPLAY_NUMBER = "0786703129";
const NAIROBI_TIME_ZONE = "Africa/Nairobi";

const getNairobiDateTime = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: NAIROBI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now).reduce((values, part) => {
    if (part.type !== "literal") values[part.type] = part.value;
    return values;
  }, {});

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: (Number(parts.hour) * 60) + Number(parts.minute),
  };
};

const parseFlightMinutes = (time) => {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour += 12;
  return (hour * 60) + Number(match[2]);
};

const createBookingReference = () => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(6);
  window.crypto.getRandomValues(bytes);
  return `RA-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
};

function closeMenu() {
  document.getElementById("renegade-menu")?.remove();
  document.body.style.overflow = "";
}

function openMenu() {
  if (document.getElementById("renegade-menu")) return;
  const desktopNav = document.querySelector('nav[aria-label="Main navigation"]');
  const links = desktopNav ? Array.from(desktopNav.querySelectorAll("a")) : [];

  const overlay = document.createElement("div");
  overlay.id = "renegade-menu";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Navigation");
  overlay.innerHTML = `
    <div class="menu-shade"></div>
    <aside class="menu-drawer">
      <div class="menu-drawer-head">
        <strong>Navigation</strong>
        <button type="button" aria-label="Close menu">Close ×</button>
      </div>
      <nav aria-label="Mobile navigation">
        ${links.map((link) => `<a href="${link.getAttribute("href") ?? "#"}">${link.textContent.trim()}</a>`).join("")}
      </nav>
    </aside>`;
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";
  overlay.querySelector('[aria-label="Close menu"]').addEventListener("click", closeMenu);
  overlay.querySelector(".menu-shade").addEventListener("click", closeMenu);
}

document.addEventListener("click", (event) => {
  const menuButton = event.target.closest('button[aria-label="Open menu"]');
  if (menuButton) openMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const footerInfo = Array.from(document.querySelectorAll("footer h2"))
  .find((heading) => heading.textContent.trim() === "Information")?.parentElement;
if (footerInfo && !footerInfo.querySelector(".local-footer-contact")) {
  const footerContact = document.createElement("div");
  footerContact.className = "local-footer-contact";
  footerContact.innerHTML = `
    <h3>Get in touch</h3>
    <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Renegade Air, I would like to get in touch.")}" target="_blank" rel="noopener noreferrer">
      <span>WhatsApp</span><strong>0786799922</strong>
    </a>
    <a href="tel:${CALL_NUMBER}">
      <span>Call</span><strong>${CALL_DISPLAY_NUMBER}</strong>
    </a>`;
  footerInfo.appendChild(footerContact);
}

const tripLabels = Array.from(document.querySelectorAll("label")).filter((label) =>
  /^(Return|One way)$/.test(label.textContent.trim())
);

tripLabels.forEach((label) => {
  label.addEventListener("click", () => {
    const isOneWay = label.textContent.trim() === "One way";
    tripLabels.forEach((item) => item.classList.remove("trip-active"));
    label.classList.add("trip-active");
    const radio = label.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;

    const dateLabels = Array.from(document.querySelectorAll('input[type="date"]'))
      .map((input) => input.closest("label"))
      .filter(Boolean);
    if (dateLabels[1]) dateLabels[1].style.display = isOneWay ? "none" : "";
  });
});

tripLabels.forEach((label) => {
  if (label.querySelector('input[type="radio"]')?.checked) {
    label.classList.add("trip-active");
  }
});

const dateInputs = Array.from(document.querySelectorAll('input[type="date"]'));
if (dateInputs[0]) {
  const today = getNairobiDateTime().date;
  dateInputs[0].value = today;
  dateInputs[0].min = today;
}

document.querySelectorAll("a[href]").forEach((link) => {
  const href = link.getAttribute("href");
  if (href?.startsWith("/") && !href.startsWith("//")) {
    const route = href.split("?")[0];
    link.href = route === "/" ? "#" : "#";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (href.includes("/book-flight")) {
        document.querySelector("form")?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (href.includes("/destinations")) {
        document.querySelector("main")?.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
});

const joinButton = Array.from(document.querySelectorAll("footer button")).find(
  (button) => button.textContent.trim() === "Join"
);
if (joinButton) {
  joinButton.addEventListener("click", () => {
    const footer = joinButton.closest("footer");
    const email = footer?.querySelector('input[type="text"], input[type="email"]');
    if (!email?.value || !email.value.includes("@")) {
      email?.setAttribute("aria-invalid", "true");
      email?.focus();
      return;
    }
    joinButton.textContent = "Joined";
    joinButton.disabled = true;
  });
}

const socialLinks = {
  Instagram: "https://www.instagram.com/flyrenegadeair/",
  Facebook: "https://www.facebook.com/flyrenegadeair/",
  YouTube: "https://www.youtube.com/@flyrenegadeair/",
};

document.querySelectorAll("footer button").forEach((button) => {
  const label = button.getAttribute("aria-label");
  if (label && socialLinks[label]) {
    button.addEventListener("click", () => {
      window.open(socialLinks[label], "_blank", "noopener,noreferrer");
    });
  }
});

const localBookingForm = document.querySelector("form.booking-panel");
let localResults = document.getElementById("flight-search-results");

if (localBookingForm) {
  if (!localResults) {
    localResults = document.createElement("section");
    localResults.id = "flight-search-results";
    localResults.hidden = true;
    localBookingForm.insertAdjacentElement("afterend", localResults);
  }
  const citySelects = Array.from(localBookingForm.querySelectorAll("select"));
  const dateFields = Array.from(localBookingForm.querySelectorAll('input[type="date"]'));
  const travellerFields = Array.from(localBookingForm.querySelectorAll('input[type="number"]'));
  const tripRadios = Array.from(localBookingForm.querySelectorAll('input[name="trip"]'));
  const additionalDestinations = [
    { code: "NYK", name: "Nanyuki", fare: 6500, type: "Private charter" },
    { code: "UKA", name: "Ukunda (Diani)", fare: 8500, type: "Route fare" },
    { code: "LOK", name: "Lodwar", fare: 10000, type: "Route fare" },
  ];
  const charterRoutes = [
    { from: "EDL", to: "KIS", fare: 4600 },
    { from: "EDL", to: "LOK", fare: 6000 },
  ];
  additionalDestinations.forEach((destination) => {
    citySelects.slice(0, 2).forEach((select) => {
      if (select.querySelector(`option[value="${destination.code}"]`)) return;
      const option = document.createElement("option");
      option.value = destination.code;
      option.textContent = `${destination.name} (${destination.code})`;
      select.appendChild(option);
    });
  });
  const standardFares = {
    EDL: 5500,
    KIS: 6500,
    MBA: 6500,
    MYD: 7500,
    KTL: 7000,
    HBY: 7800,
    WJR: 9000,
    MRE: 10000,
    NYK: 6500,
    UKA: 8500,
    LOK: 10000,
  };
  const demandBumps = { EDL: 300, KIS: 350, MBA: 250, MYD: 350, KTL: 350, HBY: 250, WJR: 250, MRE: 300 };
  const routeSchedules = {
    EDL: { outbound: [["7:15 AM", "8:10 AM", 55], ["4:00 PM", "4:55 PM", 55]], inbound: [["8:30 AM", "9:25 AM", 55], ["5:00 PM", "5:55 PM", 55]] },
    KIS: { outbound: [["7:15 AM", "8:10 AM", 55], ["5:00 PM", "5:55 PM", 55]], inbound: [["6:30 AM", "7:25 AM", 55], ["4:15 PM", "5:10 PM", 55]] },
    MBA: { outbound: [["7:15 AM", "8:25 AM", 70], ["4:00 PM", "5:10 PM", 70]], inbound: [["7:00 AM", "8:10 AM", 70], ["4:45 PM", "5:55 PM", 70]] },
    MYD: { outbound: [["8:15 AM", "9:35 AM", 80], ["4:15 PM", "5:35 PM", 80]], inbound: [["6:45 AM", "8:05 AM", 80], ["3:00 PM", "4:20 PM", 80]] },
    KTL: { outbound: [["6:30 AM", "7:35 AM", 65], ["3:30 PM", "4:35 PM", 65]], inbound: [["7:45 AM", "8:50 AM", 65], ["3:45 PM", "4:50 PM", 65]] },
    HBY: { outbound: [["8:00 AM", "9:00 AM", 60], ["4:15 PM", "5:15 PM", 60]], inbound: [["8:30 AM", "9:30 AM", 60], ["3:30 PM", "4:30 PM", 60]] },
    WJR: { outbound: [["6:30 AM", "8:00 AM", 90], ["3:45 PM", "5:15 PM", 90]], inbound: [["6:30 AM", "8:00 AM", 90], ["4:15 PM", "5:45 PM", 90]] },
    MRE: { outbound: [["7:00 AM", "7:45 AM", 45], ["3:30 PM", "4:15 PM", 45]], inbound: [["6:30 AM", "7:15 AM", 45], ["3:45 PM", "4:30 PM", 45]] },
  };
  const heldSeats = new Set(["1D", "2D", "3D", "7C", "8B", "11C", "12B"]);
  const seatLetters = ["A", "B", "C", "D"];
  const dateFormatter = new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const money = (amount) => `Ksh ${new Intl.NumberFormat("en-KE").format(amount)}`;
  const kes = (amount) => new Intl.NumberFormat("en-KE").format(amount);
  const inquiryOnlyRoutes = new Set(additionalDestinations.map((destination) => destination.code));
  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  const displayDate = (value) => {
    if (!value) return "";
    const [year, month, day] = value.split("-").map(Number);
    return dateFormatter.format(new Date(year, month - 1, day));
  };
  const airportName = (code) => {
    const option = citySelects[0]?.querySelector(`option[value="${code}"]`);
    return option ? option.textContent.replace(/\s*\([A-Z]{3}\)$/, "").trim() : code;
  };
  const passengerCounts = () => ({
    adults: Math.min(9, Math.max(1, Number(travellerFields[0]?.value) || 1)),
    children: Math.min(9, Math.max(0, Number(travellerFields[1]?.value) || 0)),
    infants: Math.min(9, Math.max(0, Number(travellerFields[2]?.value) || 0)),
  });
  const updateQuery = (view, step = "") => {
    const params = new URLSearchParams(window.location.search);
    params.set("from", localBookingForm.dataset.from);
    params.set("to", localBookingForm.dataset.to);
    params.set("depart", localBookingForm.dataset.depart);
    params.set("returnDate", localBookingForm.dataset.returnDate);
    params.set("trip", localBookingForm.dataset.trip);
    params.set("adults", localBookingForm.dataset.adults);
    params.set("children", localBookingForm.dataset.children);
    params.set("infants", localBookingForm.dataset.infants);
    params.set("cabin", localBookingForm.dataset.cabin);
    params.set("view", view);
    if (view === "reserve" && selectedFlight) {
      params.set("flight", selectedFlight.label);
    } else {
      params.delete("flight");
    }
    if (step) params.set("step", step);
    else params.delete("step");
    window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
  };
  const seatCount = () => {
    const counts = passengerCounts();
    return counts.adults + counts.children;
  };
  const fareBump = (departure) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = departure.split("-").map(Number);
    const travelDate = new Date(year, month - 1, day);
    const daysUntilTravel = Math.ceil((travelDate - today) / 86400000);
    if (daysUntilTravel <= 2) {
      const fareRoute = search.from === "WIL" ? search.to : search.from;
      return demandBumps[fareRoute] || 0;
    }
    return 0;
  };
  const currentFare = (flight) =>
    flight.standardFare + fareBump(search.depart) + (search.cabin === "flex" ? 2600 : 0);

  const routeHeading = Array.from(document.querySelectorAll("main .eyebrow"))
    .find((element) => element.textContent.trim() === "Flights from Nairobi Wilson");
  const routeSection = routeHeading?.closest("section");
  const routeList = routeSection?.querySelector("ul");
  if (routeList) {
    const malindiRow = Array.from(routeList.querySelectorAll("li"))
      .find((item) => item.textContent.includes("MYD"));
    const malindiFare = malindiRow?.querySelectorAll("p")[1];
    if (malindiFare) malindiFare.textContent = `Scheduled service · from ${money(standardFares.MYD)}`;

    const routeDescription = Array.from(routeSection.querySelectorAll("p"))
      .find((paragraph) => paragraph.textContent.includes("Scheduled flights depart"));
    if (routeDescription) {
      routeDescription.textContent =
        "Scheduled flights and private charter options are available from Nairobi Wilson Airport across Kenya. Our team confirms route schedules, availability and charter details on WhatsApp.";
    }

    const destinationCount = Array.from(routeSection.querySelectorAll("strong"))
      .find((element) => element.nextElementSibling?.textContent.trim() === "Destinations");
    if (destinationCount) destinationCount.textContent = "11";

    const routeTemplate = routeList.querySelector("li");
    additionalDestinations.forEach((destination) => {
      if (Array.from(routeList.querySelectorAll("li"))
        .some((item) => item.textContent.includes(destination.code))) return;
      const row = routeTemplate?.cloneNode(true);
      const link = row?.querySelector("a");
      const paragraphs = link?.querySelectorAll("p");
      const title = link?.querySelector("h3");
      if (!row || !link || !paragraphs || !title) return;

      paragraphs[0].textContent = `WIL → ${destination.code}`;
      title.textContent = `Nairobi Wilson to ${destination.name}`;
      paragraphs[1].textContent = `${destination.type} · from ${money(destination.fare)}`;
      link.href = "#";
      link.addEventListener("click", (event) => {
        event.preventDefault();
        citySelects[0].value = "WIL";
        citySelects[1].value = destination.code;
        localBookingForm.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      routeList.appendChild(row);
    });

    const charterSection = document.createElement("section");
    charterSection.className = "local-charter-section";
    charterSection.innerHTML = `
      <div class="local-charter-inner">
        <div class="local-charter-intro">
          <p class="eyebrow">Private charters</p>
          <h2>Direct charters from Eldoret</h2>
          <p>Request a direct charter to Kisumu or Lodwar. Our team confirms timing and availability on WhatsApp.</p>
        </div>
        <ul class="local-charter-list"></ul>
      </div>`;
    const charterList = charterSection.querySelector(".local-charter-list");
    charterRoutes.forEach((charter) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const code = document.createElement("p");
      const title = document.createElement("h3");
      const fare = document.createElement("p");

      link.href = "#";
      code.textContent = `${charter.from} → ${charter.to}`;
      title.textContent = `${airportName(charter.from)} to ${airportName(charter.to)}`;
      fare.textContent = `Private charter · from ${money(charter.fare)}`;
      link.append(code, title, fare);
      link.addEventListener("click", (event) => {
        event.preventDefault();
        citySelects[0].value = charter.from;
        citySelects[1].value = charter.to;
        localBookingForm.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      item.appendChild(link);
      charterList.appendChild(item);
    });
    routeSection.insertAdjacentElement("afterend", charterSection);
  }

  localResults.hidden = true;
  localResults.classList.add("flight-search-results");
  localResults.setAttribute("aria-live", "polite");
  localResults.closest(".hero-home")?.insertAdjacentElement("afterend", localResults);

  const bookingHeading = document.createElement("div");
  bookingHeading.className = "local-booking-heading";
  bookingHeading.innerHTML = `
    <p class="eyebrow">Plan your journey</p>
    <h1>Find your Renegade Air flight.</h1>
    <p>Compare today’s fares for your travel date, then reserve as a guest. Our team confirms the current time, seat, final price, payment and ticket with you on WhatsApp.</p>`;
  localBookingForm.insertAdjacentElement("beforebegin", bookingHeading);

  const syncTripDates = () => {
    if (!dateFields[1]) return;
    const isReturn = Boolean(tripRadios[0]?.checked);
    dateFields[1].disabled = !isReturn;
    dateFields[1].required = isReturn;
    if (!isReturn) dateFields[1].value = "";
    else if (dateFields[0]?.value) dateFields[1].min = dateFields[0].value;
  };
  tripRadios.forEach((radio) => radio.addEventListener("change", syncTripDates));
  tripLabels.forEach((label) => {
    label.addEventListener("click", () => window.setTimeout(syncTripDates, 0));
  });
  syncTripDates();
  dateFields[0]?.addEventListener("change", () => {
    if (dateFields[1] && !dateFields[1].disabled) dateFields[1].min = dateFields[0].value;
  });

  const setSearchMode = (reserving = false) => {
    document.body.classList.add("local-search-mode");
    document.body.classList.toggle("local-reservation-mode", reserving);
    document.title = reserving ? "Reserve Your Seats | Renegade Air" : "Book a Flight | Renegade Air";
    Array.from(document.querySelector("main").children).forEach((section) => {
      if (section !== localResults && !section.classList.contains("hero-home")) {
        section.hidden = true;
      }
    });
  };

  const exitSearchMode = () => {
    document.body.classList.remove("local-search-mode", "local-reservation-mode");
    document.title = "Regional Flights Across Kenya | Renegade Air";
    Array.from(document.querySelector("main").children).forEach((section) => {
      section.hidden = false;
    });
    localResults.hidden = true;
  };

  const readSearch = () => {
    const counts = passengerCounts();
    return {
      from: citySelects[0]?.value || "WIL",
      to: citySelects[1]?.value || "KIS",
      depart: dateFields[0]?.value || "",
      returnDate: tripRadios[0]?.checked ? (dateFields[1]?.value || "") : "",
      trip: tripRadios[0]?.checked ? "return" : "oneway",
      adults: counts.adults,
      children: counts.children,
      infants: counts.infants,
      cabin: citySelects[2]?.value || "saver",
    };
  };

  const saveSearch = (search) => {
    Object.entries(search).forEach(([key, value]) => {
      localBookingForm.dataset[key] = String(value);
    });
    updateQuery("book-flight");
  };

  let search = null;
  let selectedFlight = null;
  let availableFlights = [];
  let selectedSeats = [];
  let passengerDetails = [];
  let contactDetails = {};
  let bookingReference = "";

  const renderResults = () => {
    setSearchMode(false);
    updateQuery("book-flight");
    const routeCode = `${search.from} → ${search.to}`;
    const routeName = `${airportName(search.from)} to ${airportName(search.to)}`;
    const route = search.from === "WIL" ? search.to : search.from;
    const charterRoute = charterRoutes.find((charter) =>
      (search.from === charter.from && search.to === charter.to) ||
      (search.from === charter.to && search.to === charter.from));
    const baseFare = search.from === "WIL" ? standardFares[search.to] :
      search.to === "WIL" ? standardFares[search.from] : null;

    if (charterRoute) {
      const message = [
        "Hello Renegade Air, please confirm private charter availability.",
        `Route: ${routeName} (${routeCode})`,
        `Departure: ${displayDate(search.depart)}`,
        search.returnDate ? `Return: ${displayDate(search.returnDate)}` : "",
        `Travellers: ${search.adults + search.children + search.infants}`,
        `Starting fare: ${money(charterRoute.fare)} one way`,
      ].filter(Boolean).join("\n");
      localResults.innerHTML = `
        <div class="local-results-panel">
          <div class="flight-search-results-heading">
            <div><p class="eyebrow">Private charter</p><h2>${escapeHtml(routeName)}</h2></div>
            <button class="flight-search-close" type="button" aria-label="Close search results">×</button>
          </div>
          <div class="local-search-summary"><strong>${routeCode}</strong><span>${displayDate(search.depart)}${search.returnDate ? ` · Return ${displayDate(search.returnDate)}` : ""}</span><span>${search.adults + search.children + search.infants} traveller${search.adults + search.children + search.infants === 1 ? "" : "s"}</span></div>
          <article class="local-inquiry-card"><p class="eyebrow">Starting fare</p><strong>${money(charterRoute.fare)}</strong><span>one way · Private charter</span></article>
          <p>Charter timing, availability and final fare are confirmed by our team on WhatsApp.</p>
          <a class="flight-search-contact" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}" target="_blank" rel="noopener noreferrer">Confirm this charter on WhatsApp <span aria-hidden="true">→</span></a>
        </div>`;
      localResults.hidden = false;
      localResults.querySelector(".flight-search-close").addEventListener("click", () => {
        exitSearchMode();
        window.history.replaceState({}, "", window.location.pathname);
      });
      return;
    }

    if (inquiryOnlyRoutes.has(route) && (search.from === "WIL" || search.to === "WIL")) {
      const destination = additionalDestinations.find((item) => item.code === route);
      const message = [
        `Hello Renegade Air, please confirm ${destination.type.toLowerCase()} availability.`,
        `Route: ${routeName} (${routeCode})`,
        `Departure: ${displayDate(search.depart)}`,
        search.returnDate ? `Return: ${displayDate(search.returnDate)}` : "",
        `Travellers: ${search.adults + search.children + search.infants}`,
        `Starting fare: ${money(destination.fare)} one way`,
      ].filter(Boolean).join("\n");
      localResults.innerHTML = `
        <div class="local-results-panel">
          <div class="flight-search-results-heading">
            <div><p class="eyebrow">${escapeHtml(destination.type)}</p><h2>${escapeHtml(routeName)}</h2></div>
            <button class="flight-search-close" type="button" aria-label="Close search results">×</button>
          </div>
          <div class="local-search-summary"><strong>${routeCode}</strong><span>${displayDate(search.depart)}${search.returnDate ? ` · Return ${displayDate(search.returnDate)}` : ""}</span><span>${search.adults + search.children + search.infants} traveller${search.adults + search.children + search.infants === 1 ? "" : "s"}</span></div>
          <article class="local-inquiry-card"><p class="eyebrow">Starting fare</p><strong>${money(destination.fare)}</strong><span>one way · ${escapeHtml(destination.type)}</span></article>
          <p>Schedule and availability are confirmed by our team. ${destination.code === "NYK" ? "Charter timing and arrangements are made by request." : "Your requested travel date and route will be confirmed on WhatsApp."}</p>
          <a class="flight-search-contact" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}" target="_blank" rel="noopener noreferrer">Confirm this route on WhatsApp <span aria-hidden="true">→</span></a>
        </div>`;
      localResults.hidden = false;
      localResults.querySelector(".flight-search-close").addEventListener("click", () => {
        exitSearchMode();
        window.history.replaceState({}, "", window.location.pathname);
      });
      return;
    }

    if (!baseFare) {
      localResults.innerHTML = `
        <div class="local-results-panel">
          <div class="flight-search-results-heading">
            <div><p class="eyebrow">Available flights</p><h2>${escapeHtml(routeName)}</h2></div>
          </div>
          <p>We don't currently list a scheduled service for this route online. Contact our team to check the route and arrange your journey.</p>
          <a class="flight-search-contact" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello Renegade Air, please confirm flights for ${routeName} on ${displayDate(search.depart)}.`)}" target="_blank" rel="noopener noreferrer">Check this route on WhatsApp <span aria-hidden="true">→</span></a>
        </div>`;
      localResults.hidden = false;
      return;
    }

    const schedule = routeSchedules[route][search.from === "WIL" ? "outbound" : "inbound"];
    const flights = schedule.map(([depart, arrive, duration], index) => ({
      id: index === 0 ? "AM" : "PM",
      label: `${search.from}–${search.to} ${index === 0 ? "AM" : "PM"}`,
      depart,
      arrive,
      duration,
      standardFare: baseFare,
    })).filter((flight) => {
      const nairobiNow = getNairobiDateTime();
      if (search.depart < nairobiNow.date) return false;
      if (search.depart !== nairobiNow.date) return true;
      const departureMinutes = parseFlightMinutes(flight.depart);
      return departureMinutes !== null && departureMinutes > nairobiNow.minutes;
    });

    if (flights.length === 0) {
      localResults.innerHTML = `
        <div class="local-results-panel">
          <div class="flight-search-results-heading">
            <div><p class="eyebrow">No available flights</p><h2>${escapeHtml(routeName)}</h2></div>
            <button class="flight-search-close" type="button" aria-label="Close search results">×</button>
          </div>
          <p>All scheduled departures for ${escapeHtml(displayDate(search.depart))} have already passed. Please choose another date.</p>
          <button type="button" class="local-primary-button flight-search-change-date">Choose another date</button>
        </div>`;
      localResults.hidden = false;
      localResults.querySelector(".flight-search-close").addEventListener("click", () => {
        exitSearchMode();
        window.history.replaceState({}, "", window.location.pathname);
      });
      localResults.querySelector(".flight-search-change-date").addEventListener("click", () => {
        dateFields[0].focus();
        dateFields[0].showPicker?.();
      });
      return;
    }

    availableFlights = flights;
    const bump = fareBump(search.depart);
    const renderCards = (sortBy) => {
      const sorted = [...flights];
      if (sortBy === "fare") sorted.sort((a, b) => a.standardFare - b.standardFare);
      if (sortBy === "departure") sorted.sort((a, b) => a.id === "AM" ? -1 : 1);
      if (sortBy === "duration") sorted.sort((a, b) => a.duration - b.duration);
      return sorted.map((flight) => {
        const fare = currentFare(flight);
        const durationText = flight.duration < 60
          ? `About ${flight.duration}m`
          : `About ${Math.floor(flight.duration / 60)}h ${flight.duration % 60 ? `${flight.duration % 60}m` : ""}`.trim();
        return `
          <article class="local-flight-card">
            <div class="local-flight-times">
              <div><strong>${flight.depart}</strong><span>${search.from}</span></div>
              <div class="local-flight-duration"><span>${durationText}</span><i></i><span>Direct</span></div>
              <div><strong>${flight.arrive}</strong><span>${search.to}</span></div>
            </div>
            <div class="local-flight-info">
              <strong>${escapeHtml(flight.label)}</strong>
              <span>Dash 8-200 / Dash 8-300</span>
            </div>
            <div class="local-flight-price"><span>Current fare</span><strong>${money(fare)}</strong><small>${bump ? `Last-minute demand · +Ksh ${new Intl.NumberFormat("en-KE").format(bump)}` : "Standard fare"}<br>Standard ${money(flight.standardFare)} · Daily</small></div>
            <button type="button" class="local-continue-button" data-flight="${flight.id}">Continue Booking <span aria-hidden="true">→</span></button>
          </article>`;
      }).join("");
    };

    localResults.innerHTML = `
      <div class="local-results-panel">
        <div class="flight-search-results-heading">
          <div><p class="eyebrow">Available flights</p><h2>${escapeHtml(routeName)}</h2></div>
          <button class="flight-search-close" type="button" aria-label="Close search results">×</button>
        </div>
        <div class="local-search-summary">
          <strong>${routeCode}</strong>
          <span>${search.depart}${search.returnDate ? ` · Return ${search.returnDate}` : ""}</span>
          <span>${search.adults + search.children + search.infants} traveller${search.adults + search.children + search.infants === 1 ? "" : "s"} · ${search.trip === "return" ? "Return" : "One way"}</span>
          <span>Direct flights · Daily</span>
        </div>
        <div class="local-result-toolbar">
          <div><h3>${flights.length} flight${flights.length === 1 ? "" : "s"} found</h3><span>Schedules and final fare are confirmed by our team.</span></div>
          <label>Sort by
            <select class="local-sort-select" aria-label="Sort flights">
              <option value="fare">Lowest fare</option>
              <option value="departure">Departure</option>
              <option value="duration">Duration</option>
            </select>
          </label>
        </div>
        <div class="local-flight-list">${renderCards("recommended")}</div>
        <aside class="local-booking-info"><h3>How booking works</h3><ol><li>Enter passenger details as a guest—no account needed.</li><li>Your request goes straight to our WhatsApp team.</li><li>We confirm the current departure time, seat, payment and ticket.</li><li>Baggage allowance is confirmed with your fare.</li></ol><p>Fares can move within KSh 500 of each route’s standard fare depending on date, demand and promotions. ${search.returnDate ? "Your return flight is confirmed by our team." : ""} Final availability and fare are confirmed on WhatsApp before payment.</p></aside>
        <p class="local-results-disclaimer">Schedule, seat, fare, payment and ticket are confirmed by the Renegade Air team. No payment is taken on this website.</p>
      </div>`;
    localResults.hidden = false;

    localResults.querySelector(".flight-search-close").addEventListener("click", () => {
    exitSearchMode();
    window.history.replaceState({}, "", window.location.pathname);
    });
    const sortSelect = localResults.querySelector(".local-sort-select");
    sortSelect.addEventListener("change", () => {
      localResults.querySelector(".local-flight-list").innerHTML = renderCards(sortSelect.value);
    });
    if (localResults.dataset.flightClickBound !== "true") {
      localResults.dataset.flightClickBound = "true";
      localResults.addEventListener("click", (event) => {
        const button = event.target.closest("[data-flight]");
        if (!button) return;
        selectedFlight = availableFlights.find((flight) => flight.id === button.dataset.flight);
        if (selectedFlight && search.depart === getNairobiDateTime().date) {
          const departureMinutes = parseFlightMinutes(selectedFlight.depart);
          if (departureMinutes !== null && departureMinutes <= getNairobiDateTime().minutes) {
            renderResults();
            return;
          }
        }
        selectedSeats = [];
        passengerDetails = [];
        contactDetails = {};
        bookingReference = createBookingReference();
        renderSeatStage();
      });
    }
  };

  const renderSeatStage = () => {
    setSearchMode(true);
    updateQuery("reserve", "seats");
    const neededSeats = seatCount();
    const seatRows = Array.from({ length: 12 }, (_, index) => {
      const row = index + 1;
      return `<div class="local-seat-row"><span class="local-row-number">${row}</span>${seatLetters.map((letter) => {
        const seat = `${row}${letter}`;
        const held = heldSeats.has(seat);
        const chosen = selectedSeats.includes(seat);
        return `<button type="button" class="local-seat${held ? " is-held" : ""}${chosen ? " is-selected" : ""}" data-seat="${seat}" aria-label="Seat ${seat}${held ? " unavailable" : ""}" aria-pressed="${chosen}" ${held ? "disabled" : ""}>${seat}</button>`;
      }).join("")}</div>`;
    }).join("");
    localResults.innerHTML = `
      <section class="local-reservation">
        <div class="local-reservation-heading"><p class="eyebrow">Guest reservation</p><h1>Choose where you would like to sit.</h1><p>Pick one seat for each travelling passenger. Seat choice is a preference and will be confirmed by our team based on actual availability.</p></div>
        <ol class="local-progress"><li class="is-current">1 <span>Seats</span></li><li>2 <span>Passenger details</span></li><li>3 <span>Review</span></li><li>4 <span>WhatsApp confirmation</span></li></ol>
        <div class="local-reservation-grid">
          <div class="local-reservation-main">
            <div class="local-seat-panel">
              <h2>Seat preference</h2>
              <p>Dash 8-200 / Dash 8-300 · typical 48-seat layout. Seats already held are shown as unavailable. Seat choice is a preference and will be confirmed by our team based on actual availability.</p>
              <div class="local-seat-legend"><span>Available</span><span>Your choice</span><span>Held</span></div>
              <div class="local-seat-map">${seatRows}</div>
              <p class="local-seat-count">Selected: ${selectedSeats.length ? selectedSeats.join(", ") : "none"} (${selectedSeats.length} of ${neededSeats})</p>
            </div>
            <div class="local-stage-actions"><button type="button" class="local-primary-button" data-action="passengers" ${selectedSeats.length !== neededSeats ? "disabled" : ""}>Continue to passenger details <span aria-hidden="true">→</span></button><button type="button" class="local-text-button" data-action="change-flight">Change flight</button></div>
          </div>
          ${renderFlightSummary()}
        </div>
      </section>`;

    localResults.querySelectorAll("[data-seat]").forEach((button) => {
      button.addEventListener("click", () => {
        const seat = button.dataset.seat;
        if (selectedSeats.includes(seat)) selectedSeats = selectedSeats.filter((item) => item !== seat);
        else if (selectedSeats.length < neededSeats) selectedSeats.push(seat);
        renderSeatStage();
      });
    });
    localResults.querySelector('[data-action="passengers"]').addEventListener("click", renderPassengerStage);
    localResults.querySelector('[data-action="change-flight"]').addEventListener("click", renderResults);
  };

  const renderFlightSummary = () => {
    const counts = passengerCounts();
    const fare = currentFare(selectedFlight);
    const farePayingPassengers = counts.adults + counts.children;
    return `
      <aside class="local-booking-summary">
        <p class="eyebrow">${escapeHtml(selectedFlight.label)} · Dash 8-200 / Dash 8-300</p>
        <div class="local-summary-times"><strong>${selectedFlight.depart}</strong><span>${escapeHtml(airportName(search.from))} (${search.from})</span><strong>${selectedFlight.arrive}</strong><span>${escapeHtml(airportName(search.to))} (${search.to})</span></div>
        <p>Departs ${selectedFlight.depart} (Daily)</p>
        <dl><dt>Departure date</dt><dd>${displayDate(search.depart)}</dd>${search.returnDate ? `<dt>Return</dt><dd>${displayDate(search.returnDate)} · flight to be confirmed</dd>` : ""}<dt>Fare type</dt><dd>Economy ${search.cabin === "flex" ? "Flex" : "Saver"}</dd><dt>Seats</dt><dd>${selectedSeats.join(", ") || "To be selected"}</dd><dt>Current fare (per adult)</dt><dd>${money(fare)} · ${fareBump(search.depart) ? "Last-minute demand" : "standard fare"}</dd><dt>Travellers</dt><dd>${counts.adults} adult${counts.adults === 1 ? "" : "s"}${counts.children ? `, ${counts.children} child${counts.children === 1 ? "" : "ren"}` : ""}${counts.infants ? `, ${counts.infants} infant${counts.infants === 1 ? "" : "s"}` : ""}</dd><dt>Estimated total</dt><dd><strong>${money(fare * farePayingPassengers)}</strong></dd></dl>
        <p class="local-summary-disclaimer">This is an indicative fare. Nothing is confirmed until our WhatsApp team confirms availability and sends payment instructions. No payment is taken on this website.</p>
      </aside>`;
  };

  const renderPassengerStage = () => {
    setSearchMode(true);
    updateQuery("reserve", "passengers");
    const counts = passengerCounts();
    const travelers = [
      ...Array.from({ length: counts.adults }, (_, index) => ({ type: "Adult", seat: selectedSeats[index] })),
      ...Array.from({ length: counts.children }, (_, index) => ({ type: "Child", seat: selectedSeats[counts.adults + index] })),
      ...Array.from({ length: counts.infants }, () => ({ type: "Infant", seat: "On lap" })),
    ];
    const passengerFields = travelers.map((traveler, index) => {
      const data = passengerDetails[index] || {};
      return `<fieldset class="local-passenger-fields"><legend>Passenger ${index + 1} <span>${traveler.type.toUpperCase()}${traveler.seat ? ` · SEAT ${escapeHtml(traveler.seat)}` : ""}</span></legend>
        <label>Title<select name="title-${index}"><option ${data.title === "Mr" || !data.title ? "selected" : ""}>Mr</option><option ${data.title === "Mrs" ? "selected" : ""}>Mrs</option><option ${data.title === "Ms" ? "selected" : ""}>Ms</option><option ${data.title === "Dr" ? "selected" : ""}>Dr</option></select></label>
        <label>First name<input name="first-${index}" placeholder="As shown on ID" value="${escapeHtml(data.first)}" required></label>
        <label>Last name<input name="last-${index}" placeholder="Surname" value="${escapeHtml(data.last)}" required></label>
        <label>Date of birth <small>(optional)</small><input type="date" name="dob-${index}" value="${escapeHtml(data.dob)}"></label>
        <label>ID / passport number<input name="id-${index}" placeholder="National ID or passport" value="${escapeHtml(data.id)}" required></label>
      </fieldset>`;
    }).join("");
    localResults.innerHTML = `
      <section class="local-reservation">
        <div class="local-reservation-heading"><p class="eyebrow">Guest reservation</p><h1>Almost there—tell us who is flying.</h1><p>No account needed. Enter passenger and contact details, review your booking, and send everything to our WhatsApp team in one tap.</p></div>
        <ol class="local-progress"><li>1 <span>Seats</span></li><li class="is-current">2 <span>Passenger details</span></li><li>3 <span>Review</span></li><li>4 <span>WhatsApp confirmation</span></li></ol>
        <div class="local-reservation-grid"><form class="local-passenger-form"><div class="local-passenger-list">${passengerFields}</div>
          <fieldset class="local-contact-fields"><legend>Contact details</legend><p>We reply on WhatsApp, so please use the number you chat from.</p>
            <label>Contact name<input name="contact-name" placeholder="Who should we speak to?" value="${escapeHtml(contactDetails.name)}" required></label>
            <label>WhatsApp number<input name="contact-phone" type="tel" placeholder="+254 7xx xxx xxx" value="${escapeHtml(contactDetails.phone)}" required></label>
            <label>Email<input name="contact-email" type="email" placeholder="you@example.com" value="${escapeHtml(contactDetails.email)}" required></label>
            <label>Nationality<input name="nationality" placeholder="Kenyan" value="${escapeHtml(contactDetails.nationality || "Kenyan")}" required></label>
            <label>Special requests <small>(optional)</small><textarea name="requests" placeholder="Wheelchair assistance, extra baggage, return flight preference...">${escapeHtml(contactDetails.requests)}</textarea></label>
          </fieldset><div class="local-stage-actions"><button class="local-primary-button" type="submit">Review booking <span aria-hidden="true">→</span></button><button class="local-text-button" type="button" data-action="change-seats">Change seats</button></div>
        </form>${renderFlightSummary()}</div>
      </section>`;
    const passengerForm = localResults.querySelector(".local-passenger-form");
    passengerForm.addEventListener("input", () => {
      passengerDetails = travelers.map((_, index) => ({
        title: passengerForm.elements[`title-${index}`].value,
        first: passengerForm.elements[`first-${index}`].value,
        last: passengerForm.elements[`last-${index}`].value,
        dob: passengerForm.elements[`dob-${index}`].value,
        id: passengerForm.elements[`id-${index}`].value,
      }));
      contactDetails = {
        name: passengerForm.elements["contact-name"].value,
        phone: passengerForm.elements["contact-phone"].value,
        email: passengerForm.elements["contact-email"].value,
        nationality: passengerForm.elements.nationality.value,
        requests: passengerForm.elements.requests.value,
      };
    });
    passengerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      passengerDetails = travelers.map((_, index) => ({
        title: passengerForm.elements[`title-${index}`].value,
        first: passengerForm.elements[`first-${index}`].value,
        last: passengerForm.elements[`last-${index}`].value,
        dob: passengerForm.elements[`dob-${index}`].value,
        id: passengerForm.elements[`id-${index}`].value,
      }));
      contactDetails = {
        name: passengerForm.elements["contact-name"].value,
        phone: passengerForm.elements["contact-phone"].value,
        email: passengerForm.elements["contact-email"].value,
        nationality: passengerForm.elements.nationality.value,
        requests: passengerForm.elements.requests.value,
      };
      renderReviewStage();
    });
    localResults.querySelector('[data-action="change-seats"]').addEventListener("click", renderSeatStage);
  };

  const renderReviewStage = () => {
    setSearchMode(true);
    updateQuery("reserve", "review");
    if (!bookingReference) bookingReference = createBookingReference();
    const names = passengerDetails.map((traveler, index) => `<li>${index + 1}. ${escapeHtml(traveler.title)} ${escapeHtml(traveler.first)} ${escapeHtml(traveler.last)}<span>${index < seatCount() ? `Seat ${escapeHtml(selectedSeats[index])}` : "Infant"} · ${escapeHtml(traveler.id)}</span></li>`).join("");
    const totalPassengers = search.adults + search.children + search.infants;
    const farePerPassenger = currentFare(selectedFlight);
    const fareTotal = farePerPassenger * (search.adults + search.children);
    const passengerMessage = passengerDetails.flatMap((traveler, index) => {
      const prefix = passengerDetails.length > 1 ? `Passenger ${index + 1} ` : "";
      return [
        `${prefix}Name: ${traveler.title} ${traveler.first} ${traveler.last}`,
        `${prefix}ID/Passport: ${traveler.id}`,
      ];
    });
    const message = [
      "New booking request — Renegade Air",
      `Reference: ${bookingReference}`,
      "",
      `Route: ${airportName(search.from)} (${search.from}) → ${airportName(search.to)} (${search.to}) · ${selectedFlight.label}`,
      `Departure: ${selectedFlight.depart} (Daily)`,
      `Date: ${displayDate(search.depart)} | Passengers: ${totalPassengers}`,
      `Trip: ${search.trip === "return" ? "Return" : "One way"}`,
      ...(search.returnDate ? [`Return date: ${displayDate(search.returnDate)}`] : []),
      `Seat(s): ${selectedSeats.join(", ") || "To be selected"}`,
      "",
      ...passengerMessage,
      `Phone: ${contactDetails.phone}`,
      `Email: ${contactDetails.email}`,
      `Nationality: ${contactDetails.nationality}`,
      ...(contactDetails.requests ? [`Special requests: ${contactDetails.requests}`] : []),
      `Fare quoted: KES ${kes(farePerPassenger)} pp (standard KES ${kes(selectedFlight.standardFare)}) · Economy ${search.cabin === "flex" ? "Flex" : "Saver"} · estimated total KES ${kes(fareTotal)} — subject to confirmation`,
      "",
      "Please confirm seat availability, payment instructions and ticket issue. Thank you.",
    ].join("\n");
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    localResults.innerHTML = `
      <section class="local-reservation">
        <div class="local-reservation-heading"><p class="eyebrow">Guest reservation · ${bookingReference}</p><h1>Review your booking.</h1><p>Check your details before sending your request to our WhatsApp team.</p></div>
        <ol class="local-progress"><li>1 <span>Seats</span></li><li>2 <span>Passenger details</span></li><li class="is-current">3 <span>Review</span></li><li>4 <span>WhatsApp confirmation</span></li></ol>
        <div class="local-reservation-grid"><div class="local-review-panel">
          <div class="local-review-section"><div><h2>Passengers</h2><button type="button" data-action="edit-passengers">Edit</button></div><ul>${names}</ul></div>
          <div class="local-review-section"><div><h2>Contact</h2><button type="button" data-action="edit-passengers">Edit</button></div><p>${escapeHtml(contactDetails.name)} · ${escapeHtml(contactDetails.phone)} · ${escapeHtml(contactDetails.email)} · ${escapeHtml(contactDetails.nationality)}</p></div>
          <div class="local-next-steps"><p class="eyebrow">What happens next</p><ol><li>WhatsApp opens with your reservation details pre-filled—just press send.</li><li>A Renegade Air agent replies to confirm seat availability on ${escapeHtml(selectedFlight.label)}, departing ${selectedFlight.depart} (Daily).</li><li>You receive payment instructions and your ticket is issued once payment is received.</li></ol><p>No booking, seat or departure is confirmed until a Renegade Air agent replies on WhatsApp, confirms availability, sends payment instructions and issues your ticket after payment.</p></div>
          <label class="local-confirm"><input type="checkbox" class="local-confirm-checkbox"> I confirm these details are correct and have read the <a href="#">terms and conditions</a>.</label>
          <div class="local-stage-actions"><a class="local-primary-button local-whatsapp-button" href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" aria-disabled="true">Send reservation to WhatsApp <span aria-hidden="true">→</span></a><button type="button" class="local-text-button" data-action="back-details">Back</button></div>
        </div>${renderFlightSummary()}</div>
      </section>`;
    const consent = localResults.querySelector(".local-confirm-checkbox");
    const sendLink = localResults.querySelector(".local-whatsapp-button");
    consent.addEventListener("change", () => {
      sendLink.setAttribute("aria-disabled", String(!consent.checked));
      sendLink.classList.toggle("is-disabled", !consent.checked);
      if (consent.checked) sendLink.removeAttribute("tabindex");
      else sendLink.tabIndex = -1;
    });
    sendLink.addEventListener("click", (event) => {
      if (!consent.checked) event.preventDefault();
    });
    localResults.querySelectorAll('[data-action="edit-passengers"], [data-action="back-details"]').forEach((button) => {
      button.addEventListener("click", renderPassengerStage);
    });
  };

  const startSearch = (requestedSearch) => {
    search = requestedSearch;
    saveSearch(search);
    selectedFlight = null;
    renderResults();
    localResults.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  localBookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const requestedSearch = readSearch();
    if (requestedSearch.from === requestedSearch.to) {
      setSearchMode(false);
      localResults.hidden = false;
      localResults.innerHTML = `<div class="local-results-panel has-error"><h2>Choose two different destinations</h2><p>Your departure and arrival airports must be different.</p></div>`;
      localResults.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (!requestedSearch.depart) {
      dateFields[0]?.focus();
      return;
    }
    startSearch(requestedSearch);
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get("from") && params.get("to") && params.get("depart")) {
    const from = params.get("from");
    const to = params.get("to");
    if (citySelects[0]?.querySelector(`option[value="${from}"]`) && citySelects[1]?.querySelector(`option[value="${to}"]`)) {
      citySelects[0].value = from;
      citySelects[1].value = to;
      dateFields[0].value = params.get("depart");
      dateFields[1].value = params.get("returnDate") || "";
      travellerFields[0].value = params.get("adults") || "1";
      travellerFields[1].value = params.get("children") || "0";
      travellerFields[2].value = params.get("infants") || "0";
      if (citySelects[2]) citySelects[2].value = params.get("cabin") || "saver";
      const isReturn = params.get("trip") !== "oneway";
      tripRadios.forEach((radio, index) => {
        radio.checked = index === 0 ? isReturn : !isReturn;
        radio.closest("label")?.classList.toggle("trip-active", radio.checked);
      });
      syncTripDates();
      dateFields[1]?.closest("label")?.style.setProperty("display", isReturn ? "" : "none");
      search = readSearch();
      localBookingForm.dataset.from = search.from;
      localBookingForm.dataset.to = search.to;
      localBookingForm.dataset.depart = search.depart;
      localBookingForm.dataset.returnDate = search.returnDate;
      localBookingForm.dataset.trip = search.trip;
      localBookingForm.dataset.adults = String(search.adults);
      localBookingForm.dataset.children = String(search.children);
      localBookingForm.dataset.infants = String(search.infants);
      localBookingForm.dataset.cabin = search.cabin;
      const restoreView = params.get("view");
      const restoreFlight = params.get("flight");
      renderResults();
      if (restoreView === "reserve" && restoreFlight) {
        selectedFlight = availableFlights.find((flight) => flight.label === restoreFlight) || null;
        if (selectedFlight) renderSeatStage();
      }
    }
  }
}
