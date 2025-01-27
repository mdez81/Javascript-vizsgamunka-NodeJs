//import { CustomDateInput } from "../../classes/customDateInput";

document.addEventListener("DOMContentLoaded", () => {
    const hairdresserSelect = document.getElementById("hairdresser-select");
    const appointmentsTableBody = document.querySelector("#appointments-table tbody");


    fetch("http://localhost:3000/api/hairdressers")
        .then(response => response.json())
        .then(hairdressers => {
            hairdressers.forEach(hairdresser => {
                const option = document.createElement("option");
                option.value = hairdresser.id;
                option.textContent = hairdresser.name;
                hairdresserSelect.appendChild(option);
            });
        });


    hairdresserSelect.addEventListener("change", () => {
        const selectedHairdresserId = parseInt(hairdresserSelect.value, 10); // Convert to number
        console.log(`Selected Hairdresser ID: ${selectedHairdresserId}`);


        fetch("http://localhost:3000/api/appointments?hairdresser_id=" + selectedHairdresserId)

            .then(response => response.json())
            .then(appointments => {

                document.getElementById("appointments-table").style.display = "block";
                appointmentsTableBody.innerHTML = "";
                appointments.forEach(appointment => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                    <td class="p-2">${appointment.customer_name}</td>
                    <td class="p-2">${appointment.customer_phone}</td>
                    <td class="p-2">${appointment.appointment_date}</td>
                    <td class="p-2">${appointment.service}</td>
                    <td class="p-2">
                        <button class="btn btn-warning edit-btn" data-id="${appointment.id}">Módosítás</button>
                        <button class="btn btn-danger my-2 delete-btn d-inline" data-id="${appointment.id}">Törlés</button>
                    </td>
                `;
                    appointmentsTableBody.appendChild(row);
                });
            })
            .catch(error => console.error("Error fetching appointments:", error));
    });


    appointmentsTableBody.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-btn")) {
            const appointmentId = event.target.dataset.id;

            if (confirm("Biztosan törölni szeretné?")) { 
            fetch(`http://localhost:3000/api/appointments/${appointmentId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    event.target.closest("tr").remove();
                    alert("Appointment deleted successfully.");
                })
                .catch(error => {
                    console.error("Error deleting appointment:", error);
                    alert("Error deleting appointment: " + error.message);
                });
        }
    }

    if (event.target.classList.contains("edit-btn")) {
        const appointmentId = parseInt(event.target.dataset.id);
    
        // Fetch the current appointment details before editing
        fetch(`http://localhost:3000/api/appointments/${appointmentId}`)
            .then(response => response.json())
            .then(data => {
                // Use current values as default in the prompt
                const newCustomerName = prompt("Enter new customer name:", data.customer_name);
                const newCustomerPhone = prompt("Enter new customer phone:", data.customer_phone);
                const newAppointmentDate = prompt("Enter new appointment date (YYYY-MM-DD):", data.appointment_date);
    
                if (newCustomerName && newCustomerPhone && newAppointmentDate) {
                    fetch(`http://localhost:3000/api/appointments/${appointmentId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            customer_name: newCustomerName,
                            customer_phone: newCustomerPhone,
                            appointment_date: newAppointmentDate,
                        }),
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(updatedAppointment => {
                        alert("Appointment updated successfully.");
                        // Optionally re-fetch appointments to update the UI
                        hairdresserSelect.dispatchEvent(new Event("change"));
                    })
                    .catch(error => {
                        console.error("Error updating appointment:", error);
                        alert("Error updating appointment: " + error.message);
                    });
                }
            })
            .catch(error => {
                console.error("Error fetching appointment details:", error);
                alert("Error fetching appointment details: " + error.message);
            });
    }
    
});


});
