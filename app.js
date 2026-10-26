const courts = [
  { id: "futbol-1", name: "Fútbol 7 - Cancha 1", price: 80 },
  { id: "futbol-2", name: "Fútbol 7 - Cancha 2", price: 80 },
  { id: "tenis-1", name: "Tenis - Cancha 1", price: 45 },
  { id: "padel-1", name: "Pádel - Cancha 1", price: 60 },
];
const times = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
const keys = { bookings: "reservas-canchas", clients: "clientes-canchas", payments: "pagos-canchas" };
const $ = (selector) => document.querySelector(selector);
const themeToggle = $("#theme-toggle");
const savedTheme = localStorage.getItem("tema-canchas");
if (savedTheme === "dark") document.documentElement.dataset.theme = "dark";
function updateThemeButton() {
  const isDark = document.documentElement.dataset.theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Activar modo claro" : "Activar modo oscuro");
  themeToggle.setAttribute("title", isDark ? "Activar modo claro" : "Activar modo oscuro");
  themeToggle.querySelector(".theme-label").textContent = isDark ? "Modo claro" : "Modo oscuro";
}
themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  localStorage.setItem("tema-canchas", isDark ? "dark" : "light");
  updateThemeButton();
});
updateThemeButton();
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const money = (value) => `S/ ${Number(value || 0).toFixed(2)}`;
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
function read(key) { try { const value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value : []; } catch { return []; } }
let bookings = read(keys.bookings), clients = read(keys.clients), payments = read(keys.payments), editingClientId = null, editingBookingId = null, editingPaymentId = null;
const form = $("#booking-form"), message = $("#form-message");
const today = () => { const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); return now.toISOString().slice(0, 10); };
const persist = () => { localStorage.setItem(keys.bookings, JSON.stringify(bookings)); localStorage.setItem(keys.clients, JSON.stringify(clients)); localStorage.setItem(keys.payments, JSON.stringify(payments)); };
const courtName = (id) => courts.find((court) => court.id === id)?.name || "Cancha";
const priceFor = (booking) => Number(booking.total ?? (courts.find((court) => court.id === booking.courtId)?.price || 0) * Number(booking.duration || 60) / 60);
const paidFor = (id) => payments.filter((payment) => payment.bookingId === id).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
const activeBookings = () => bookings.filter((booking) => booking.status !== "cancelled");
const timeMinutes = (time) => { const [hours, minutes] = String(time || "00:00").split(":").map(Number); return hours * 60 + minutes; };
const overlaps = (firstTime, firstDuration, secondTime, secondDuration) => timeMinutes(firstTime) < timeMinutes(secondTime) + Number(secondDuration || 60) && timeMinutes(secondTime) < timeMinutes(firstTime) + Number(firstDuration || 60);
function fillOptions() {
  $("#court").innerHTML = courts.map((court) => `<option value="${court.id}">${court.name} · ${money(court.price)}/hora</option>`).join("");
  $("#filter-court").insertAdjacentHTML("beforeend", courts.map((court) => `<option value="${court.id}">${court.name}</option>`).join(""));
  $("#time").innerHTML = times.map((time) => `<option>${time}</option>`).join("");
  $("#date").value = today(); $("#date").min = today(); $("#filter-date").value = today();
}
function visibleBookings() { return activeBookings().filter((booking) => booking.date === $("#filter-date").value && ($("#filter-court").value === "all" || booking.courtId === $("#filter-court").value)); }
function renderReservations() {
  const visible = visibleBookings().sort((a, b) => a.time.localeCompare(b.time));
  const reservationQuery = $("#reservation-search").value.trim().toLocaleLowerCase("es");
  const listBookings = visible.filter((booking) => !reservationQuery || booking.customer.toLocaleLowerCase("es").includes(reservationQuery));
  const selectedCourts = courts.filter((court) => $("#filter-court").value === "all" || court.id === $("#filter-court").value);
  const occupiedSlots = selectedCourts.reduce((count, court) => count + times.filter((time) => activeBookings().some((booking) => booking.date === $("#filter-date").value && booking.courtId === court.id && overlaps(time, 60, booking.time, booking.duration))).length, 0);
  const available = selectedCourts.length * times.length - occupiedSlots;
  $("#available-count").textContent = Math.max(0, available);
  $("#reserved-count").textContent = visible.length;
  $("#summary-caption").textContent = `Resumen del ${new Date(`${$("#filter-date").value}T12:00:00`).toLocaleDateString("es-PE")} · ${$("#filter-court").value === "all" ? "Todas las canchas" : courtName($("#filter-court").value)}`;
  $("#paid-total").textContent = money(visible.reduce((sum, booking) => sum + paidFor(booking.id), 0));
  $("#pending-total").textContent = money(visible.reduce((sum, booking) => sum + Math.max(0, priceFor(booking) - paidFor(booking.id)), 0));
  $("#slot-grid").innerHTML = selectedCourts.flatMap((court) => times.map((time) => {
    const booking = activeBookings().find((item) => item.date === $("#filter-date").value && item.courtId === court.id && overlaps(time, 60, item.time, item.duration));
    return `<button class="slot ${booking ? "reserved" : ""}" type="button" aria-pressed="false" aria-label="${time}, ${escapeHtml(court.name)}, ${booking ? "reservado" : "disponible"}" ${booking ? "disabled" : `data-court="${court.id}" data-time="${time}"`}><strong>${time}</strong><span>${escapeHtml(court.name)}</span><span>${booking ? `Reservado · ${escapeHtml(booking.customer)}` : "Disponible"}</span></button>`;
  })).join("");
  $("#reservations-list").innerHTML = listBookings.length ? listBookings.map((booking) => `<article class="reservation"><div><strong>${escapeHtml(booking.time)} · ${escapeHtml(booking.customer)}</strong><span>${escapeHtml(courtName(booking.courtId))} · ${booking.duration} min · ${money(priceFor(booking))} · pendiente ${money(Math.max(0, priceFor(booking) - paidFor(booking.id)))}</span></div><button class="button danger" type="button" data-cancel="${escapeHtml(booking.id)}">Cancelar</button></article>`).join("") : `<p class="empty">${reservationQuery ? "No hay coincidencias para esa búsqueda." : "No hay reservas para esta fecha."}</p>`;
}
function renderClients() {
  const query = $("#client-search").value.trim().toLocaleLowerCase("es");
  const filteredClients = clients.filter((client) => `${client.name} ${client.email || ""} ${client.phone || ""}`.toLocaleLowerCase("es").includes(query));
  $("#clients-list").innerHTML = filteredClients.length ? filteredClients.map((client) => `<tr><td>${escapeHtml(client.name)}</td><td>${escapeHtml(client.email || "—")}</td><td>${escapeHtml(client.phone || "—")}</td><td><button class="text-button" data-edit-client="${escapeHtml(client.id)}">Editar</button> <button class="text-button danger-text" data-delete-client="${escapeHtml(client.id)}">Eliminar</button></td></tr>`).join("") : `<tr><td colspan="4" class="empty-cell">${clients.length ? "No se encontraron clientes." : "Todavía no hay clientes registrados."}</td></tr>`;
}
function renderPayments() {
  const selectedBooking = $("#payment-booking").value;
  const outstanding = activeBookings().filter((booking) => paidFor(booking.id) < priceFor(booking) || payments.some((payment) => payment.id === editingPaymentId && payment.bookingId === booking.id));
  $("#payment-booking").innerHTML = `<option value="">Selecciona una reserva</option>${outstanding.map((booking) => `<option value="${escapeHtml(booking.id)}">${escapeHtml(booking.date)} ${escapeHtml(booking.time)} · ${escapeHtml(booking.customer)} · pendiente ${money(priceFor(booking) - paidFor(booking.id))}</option>`).join("")}`;
  if (outstanding.some((booking) => booking.id === selectedBooking)) $("#payment-booking").value = selectedBooking;
  const paid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const pending = activeBookings().reduce((sum, booking) => sum + Math.max(0, priceFor(booking) - paidFor(booking.id)), 0);
  $("#all-paid").textContent = money(paid); $("#all-pending").textContent = money(pending);
  const query = $("#payment-search").value.trim().toLocaleLowerCase("es");
  const filteredPayments = payments.filter((payment) => { const booking = bookings.find((item) => item.id === payment.bookingId); return `${booking?.customer || ""} ${payment.method || ""} ${payment.reference || ""}`.toLocaleLowerCase("es").includes(query); });
  $("#payments-list").innerHTML = filteredPayments.length ? filteredPayments.map((payment) => { const booking = bookings.find((item) => item.id === payment.bookingId); return `<tr><td>${escapeHtml(booking ? `${booking.customer} · ${booking.date} ${booking.time}` : "Reserva eliminada")}</td><td>${escapeHtml(payment.method)}</td><td>${escapeHtml(payment.reference || "—")}</td><td>${money(payment.amount)}</td><td><button class="text-button" data-edit-payment="${escapeHtml(payment.id)}">Editar</button> <button class="text-button danger-text" data-delete-payment="${escapeHtml(payment.id)}">Eliminar</button></td></tr>`; }).join("") : `<tr><td colspan="5" class="empty-cell">${payments.length ? "No se encontraron pagos." : "Todavía no se registran pagos."}</td></tr>`;
}
function renderHistory() {
  const sorted = [...bookings].sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  const query = $("#history-search").value.trim().toLocaleLowerCase("es");
  const filtered = sorted.filter((booking) => `${booking.date} ${booking.time} ${booking.customer} ${courtName(booking.courtId)} ${booking.status}`.toLocaleLowerCase("es").includes(query));
  $("#history-count").textContent = `${filtered.length} de ${sorted.length} reservas`;
  $("#history-list").innerHTML = filtered.length ? filtered.map((booking) => `<tr><td>${escapeHtml(booking.date)} ${escapeHtml(booking.time)}</td><td>${escapeHtml(booking.customer)}</td><td>${escapeHtml(courtName(booking.courtId))}</td><td><span class="status ${booking.status === "cancelled" ? "cancelled" : "confirmed"}">${booking.status === "cancelled" ? "Cancelada" : "Activa"}</span></td><td>${money(priceFor(booking))}</td><td>${booking.status !== "cancelled" ? `<button class="text-button" data-edit-booking="${escapeHtml(booking.id)}">Editar</button>` : ""} <button class="text-button danger-text" data-delete-booking="${escapeHtml(booking.id)}">Eliminar</button></td></tr>`).join("") : `<tr><td colspan="6" class="empty-cell">${sorted.length ? "No se encontraron reservas." : "Todavía no hay reservas."}</td></tr>`;
}
function updatePricePreview() { const court = courts.find((item) => item.id === $("#court").value); $("#booking-price").textContent = money((court?.price || 0) * Number($("#duration").value || 60) / 60); }
function render() { renderReservations(); renderClients(); renderPayments(); renderHistory(); }
function saveClient(name, email, phone) {
  const existing = clients.find((client) => client.name.toLowerCase() === name.toLowerCase());
  if (editingClientId) { const client = clients.find((item) => item.id === editingClientId); if (client) Object.assign(client, { name, email, phone }); }
  else if (existing) Object.assign(existing, { email: email || existing.email, phone: phone || existing.phone });
  else clients.push({ id: uid(), name, email, phone });
}
$(".tabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-view]"); if (!button) return;
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab === button));
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === `view-${button.dataset.view}`));
});
$("#filter-date").addEventListener("change", renderReservations); $("#filter-court").addEventListener("change", renderReservations);
$("#reservation-search").addEventListener("input", renderReservations);
$("#client-search").addEventListener("input", renderClients);
$("#payment-search").addEventListener("input", renderPayments);
$("#history-search").addEventListener("input", renderHistory);
$("#court").addEventListener("change", updatePricePreview); $("#duration").addEventListener("change", updatePricePreview);
$("#slot-grid").addEventListener("click", (event) => { const slot = event.target.closest("[data-court]"); if (!slot) return; $("#slot-grid").querySelectorAll(".slot").forEach((item) => { const selected = item === slot; item.classList.toggle("selected", selected); item.setAttribute("aria-pressed", String(selected)); }); $("#court").value = slot.dataset.court; $("#date").value = $("#filter-date").value; $("#time").value = slot.dataset.time; updatePricePreview(); message.textContent = `Horario ${slot.dataset.time} seleccionado. Completa los datos para continuar.`; $("#customer").focus(); });
form.addEventListener("submit", (event) => {
  event.preventDefault(); const court = courts.find((item) => item.id === $("#court").value); const date = $("#date").value, time = $("#time").value, duration = Number($("#duration").value);
  if (activeBookings().some((booking) => booking.id !== editingBookingId && booking.courtId === court.id && booking.date === date && overlaps(time, duration, booking.time, booking.duration))) { message.textContent = "Ese horario se cruza con otra reserva."; return; }
  const details = { customer: $("#customer").value.trim(), email: $("#booking-email").value.trim(), phone: $("#phone").value.trim(), courtId: court.id, date, time, duration, total: court.price * duration / 60 };
  if (editingBookingId) {
    const booking = bookings.find((item) => item.id === editingBookingId);
    if (booking && details.total < paidFor(booking.id)) { message.textContent = "El total no puede quedar por debajo de lo ya pagado."; return; }
    if (booking) Object.assign(booking, details, { updatedAt: new Date().toISOString() });
    message.textContent = "Reserva actualizada correctamente.";
  } else {
    bookings.push({ id: uid(), ...details, status: "active", createdAt: new Date().toISOString() });
    message.textContent = "Reserva creada correctamente.";
  }
  saveClient(details.customer, details.email, details.phone); editingBookingId = null; $("#booking-submit").textContent = "Crear reserva"; $("#booking-cancel-edit").classList.add("hidden"); persist(); $("#filter-date").value = date; $("#filter-court").value = court.id; form.reset(); $("#date").min = today(); $("#date").value = date; $("#court").value = court.id; updatePricePreview(); render();
});
$("#booking-cancel-edit").addEventListener("click", () => { editingBookingId = null; form.reset(); $("#date").min = today(); $("#date").value = today(); $("#booking-submit").textContent = "Crear reserva"; $("#booking-cancel-edit").classList.add("hidden"); updatePricePreview(); message.textContent = "Edición cancelada."; });
$("#history-list").addEventListener("click", (event) => {
  const edit = event.target.closest("[data-edit-booking]"), del = event.target.closest("[data-delete-booking]");
  if (edit) { const booking = bookings.find((item) => item.id === edit.dataset.editBooking); if (!booking) return; editingBookingId = booking.id; $("#customer").value = booking.customer; $("#booking-email").value = booking.email || ""; $("#phone").value = booking.phone || ""; $("#court").value = booking.courtId; $("#date").min = booking.date; $("#date").value = booking.date; $("#time").value = booking.time; $("#duration").value = String(booking.duration || 60); updatePricePreview(); $("#booking-submit").textContent = "Guardar cambios"; $("#booking-cancel-edit").classList.remove("hidden"); $("#form-message").textContent = `Editando reserva de ${booking.customer}.`; $(".tabs [data-view='reservas']").click(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  if (del) { const id = del.dataset.deleteBooking; if (!window.confirm("Se eliminará la reserva y todos sus pagos asociados. Esta acción no se puede deshacer. ¿Continuar?")) return; bookings = bookings.filter((booking) => booking.id !== id); payments = payments.filter((payment) => payment.bookingId !== id); persist(); $("#report-message").textContent = "Reserva y pagos asociados eliminados permanentemente."; render(); }
});
$("#reservations-list").addEventListener("click", (event) => { const button = event.target.closest("[data-cancel]"); if (!button) return; const booking = bookings.find((item) => item.id === button.dataset.cancel); if (!booking) return; booking.status = "cancelled"; booking.cancelledAt = new Date().toISOString(); persist(); message.textContent = "Reserva cancelada. Quedó guardada en el historial."; render(); });
$("#clear-day").addEventListener("click", () => { const query = $("#reservation-search").value.trim().toLocaleLowerCase("es"), visible = visibleBookings().filter((booking) => !query || booking.customer.toLocaleLowerCase("es").includes(query)); if (!visible.length) { message.textContent = "No hay reservas que coincidan para cancelar."; return; } if (!window.confirm(`Se cancelarán ${visible.length} reserva(s) visibles. Se conservarán en el historial. ¿Continuar?`)) return; visible.forEach((booking) => { booking.status = "cancelled"; booking.cancelledAt = new Date().toISOString(); }); persist(); message.textContent = `${visible.length} reserva(s) cancelada(s); el historial se conserva.`; render(); });
$("#client-form").addEventListener("submit", (event) => { event.preventDefault(); const name = $("#client-name").value.trim(), email = $("#client-email").value.trim(), phone = $("#client-phone").value.trim(); if (!name) return; saveClient(name, email, phone); persist(); editingClientId = null; event.target.reset(); $("#client-message").textContent = "Cliente guardado."; render(); });
$("#clients-list").addEventListener("click", (event) => {
  const edit = event.target.closest("[data-edit-client]"), del = event.target.closest("[data-delete-client]");
  if (edit) { const client = clients.find((item) => item.id === edit.dataset.editClient); if (!client) return; editingClientId = client.id; $("#client-name").value = client.name; $("#client-email").value = client.email || ""; $("#client-phone").value = client.phone || ""; $("#client-message").textContent = "Edita los datos y pulsa Guardar."; }
  if (del) { clients = clients.filter((item) => item.id !== del.dataset.deleteClient); persist(); $("#client-message").textContent = "Cliente eliminado. Las reservas conservan sus datos."; render(); }
});
$("#client-cancel").addEventListener("click", () => { editingClientId = null; $("#client-message").textContent = ""; });
$("#payment-booking").addEventListener("change", () => { const booking = activeBookings().find((item) => item.id === $("#payment-booking").value); const old = payments.find((item) => item.id === editingPaymentId); const limit = booking ? priceFor(booking) - paidFor(booking.id) + (old?.bookingId === booking.id ? Number(old.amount) : 0) : 0; $("#payment-amount").max = limit.toFixed(2); if (booking) $("#payment-amount").value = limit.toFixed(2); });
$("#payment-form").addEventListener("submit", (event) => { event.preventDefault(); const booking = activeBookings().find((item) => item.id === $("#payment-booking").value); if (!booking) { $("#payment-message").textContent = "Selecciona una reserva pendiente."; return; } const old = payments.find((item) => item.id === editingPaymentId), remaining = priceFor(booking) - paidFor(booking.id) + (old?.bookingId === booking.id ? Number(old.amount) : 0), amount = Number($("#payment-amount").value); if (!(amount > 0) || amount > remaining + 0.001) { $("#payment-message").textContent = `El importe debe estar entre S/ 0.01 y ${money(remaining)}.`; return; } const details = { bookingId: booking.id, method: $("#payment-method").value, reference: $("#payment-reference").value.trim(), amount, updatedAt: new Date().toISOString() }; if (old) Object.assign(old, details); else payments.push({ id: uid(), ...details, createdAt: new Date().toISOString() }); editingPaymentId = null; $("#payment-form button[type=submit]").textContent = "Registrar pago recibido"; persist(); event.target.reset(); $("#payment-message").textContent = `${old ? "Pago actualizado" : "Pago registrado"}: ${money(amount)}.`; render(); });
$("#payments-list").addEventListener("click", (event) => { const edit = event.target.closest("[data-edit-payment]"), del = event.target.closest("[data-delete-payment]"); if (edit) { const payment = payments.find((item) => item.id === edit.dataset.editPayment); if (!payment) return; editingPaymentId = payment.id; renderPayments(); $("#payment-booking").value = payment.bookingId; $("#payment-method").value = payment.method; $("#payment-reference").value = payment.reference || ""; $("#payment-amount").value = Number(payment.amount).toFixed(2); $("#payment-amount").max = (priceFor(bookings.find((item) => item.id === payment.bookingId)) - paidFor(payment.bookingId) + Number(payment.amount)).toFixed(2); $("#payment-form button[type=submit]").textContent = "Guardar cambios del pago"; $("#payment-message").textContent = "Edita el pago y guarda los cambios."; window.scrollTo({ top: 0, behavior: "smooth" }); } if (del) { if (!window.confirm("¿Eliminar este registro de pago? Esta acción no se puede deshacer.")) return; payments = payments.filter((payment) => payment.id !== del.dataset.deletePayment); if (editingPaymentId === del.dataset.deletePayment) editingPaymentId = null; persist(); $("#payment-message").textContent = "Registro de pago eliminado."; render(); } });
function download(filename, content, type) { const link = document.createElement("a"), url = URL.createObjectURL(new Blob([content], { type })); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }
$("#export-json").addEventListener("click", () => download("respaldo-canchas.json", JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), bookings, clients, payments }, null, 2), "application/json"));
$("#export-csv").addEventListener("click", () => { const quote = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`; const rows = [["ID", "Fecha", "Hora", "Cliente", "Correo", "Teléfono", "Cancha", "Duración (min)", "Total (S/)", "Pagado (S/)", "Pendiente (S/)", "Estado"], ...[...bookings].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).map((booking) => [booking.id, booking.date, booking.time, booking.customer, booking.email, booking.phone, courtName(booking.courtId), booking.duration, priceFor(booking).toFixed(2), paidFor(booking.id).toFixed(2), Math.max(0, priceFor(booking) - paidFor(booking.id)).toFixed(2), booking.status === "cancelled" ? "Cancelada" : "Activa"])]; download("reporte-reservas.csv", `\uFEFF${rows.map((row) => row.map(quote).join(",")).join("\r\n")}`, "text/csv;charset=utf-8"); });
$("#restore-button").addEventListener("click", async () => {
  const file = $("#import-file").files[0]; if (!file) { $("#report-message").textContent = "Selecciona primero un archivo JSON."; return; }
  if ((bookings.length || clients.length || payments.length) && !window.confirm("Restaurar reemplazará las reservas, clientes y pagos actuales con los datos del archivo. ¿Continuar?")) return;
  try {
    const data = JSON.parse(await file.text()); let importedBookings, importedClients, importedPayments;
    if (Array.isArray(data)) { importedBookings = data; importedClients = []; importedPayments = []; }
    else { importedBookings = data.bookings; importedClients = data.clients || []; importedPayments = data.payments || []; }
    if (!Array.isArray(importedBookings) || !importedBookings.every((booking) => booking && typeof booking === "object" && booking.customer && booking.date && booking.time && booking.courtId)) throw new Error("Formato inválido");
    if (!Array.isArray(importedClients) || !Array.isArray(importedPayments)) throw new Error("Formato inválido");
    bookings = importedBookings.map((booking) => ({ ...booking, id: booking.id || uid(), status: booking.status || "active" }));
    clients = importedClients; payments = importedPayments.filter((payment) => payment && payment.bookingId && bookings.some((booking) => booking.id === payment.bookingId));
    persist(); $("#report-message").textContent = `Respaldo restaurado: ${bookings.length} reservas, ${clients.length} clientes y ${payments.length} pagos.`; render();
  } catch { $("#report-message").textContent = "No se pudo importar: el archivo no tiene un respaldo JSON válido."; }
});
fillOptions(); updatePricePreview(); persist(); render();
