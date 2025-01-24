document.addEventListener("DOMContentLoaded", () => {
    const hairdresserSelect = document.getElementById("hairdresser-select");
    const appointmentsTableBody = document.querySelector("#appointments-table tbody");

    // Fodrászok betöltése
    fetch("https://salonsapi.prooktatas.hu/api/hairdressers")
        .then(response => response.json())
        .then(hairdressers => {
            hairdressers.forEach(hairdresser => {
                const option = document.createElement("option");
                option.value = hairdresser.id;
                option.textContent = hairdresser.name;
                hairdresserSelect.appendChild(option);
            });
        });

    // Foglalások betöltése
    hairdresserSelect.addEventListener("change", () => {
        const hairdresserId =  hairdresserSelect.value;
        console.log(typeof hairdresserId);
        
        fetch(`https://salonsapi.prooktatas.hu/api/appointments?hairdresser_id=${hairdresserId}`)
            .then(response => response.json())
            .then(data => {
                console.log("API Response:", data); // Itt lásd a teljes választ
            })
            .then(appointments => {
                appointmentsTableBody.innerHTML = ""; // Tábla ürítése
                appointments.forEach(appointment => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${appointment.customer_name}</td>
                        <td>${appointment.customer_phone}</td>
                        <td>${appointment.appointment_date}</td>
                        <td>${appointment.service}</td>
                        <td>
                            <button class="delete-btn" data-id="${appointment.id}">Törlés</button>
                            <button class="edit-btn" data-id="${appointment.id}">Módosítás</button>
                        </td>
                    `;
                    appointmentsTableBody.appendChild(row);
                });

                // Törlés gomb
                document.querySelectorAll(".delete-btn").forEach(button => {
                    button.addEventListener("click", () => {
                        const appointmentId = button.dataset.id;
                        fetch(`https://salonsapi.prooktatas.hu/api/appointments/${appointmentId}`, {
                            method: "DELETE",
                        }).then(() => button.closest("tr").remove());
                    });
                });

                // Módosítás gomb
                document.querySelectorAll(".edit-btn").forEach(button => {
                    button.addEventListener("click", () => {
                        const appointmentId = button.dataset.id;
                        // Itt lehet megvalósítani a módosítási funkciót (pl. űrlap).
                        alert(`Módosítás ID: ${appointmentId}`);
                    });
                });
            });
    });
});
