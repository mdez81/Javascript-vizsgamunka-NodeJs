document.addEventListener("DOMContentLoaded", () => {
    const hairdresserSelect = document.getElementById("hairdresser-select");
    const appointmentsTableBody = document.querySelector("#appointments-table tbody");

    // Populate hairdressers dropdown
    fetch("http://localhost:3000/api/hairdressers")   //"https://salonsapi.prooktatas.hu/api/hairdressers"
        .then(response => response.json())
        .then(hairdressers => {
            hairdressers.forEach(hairdresser => {
                const option = document.createElement("option");
                option.value = hairdresser.id; // Use the hairdresser's ID as the value
                option.textContent = hairdresser.name; // Use the hairdresser's name as the label
                hairdresserSelect.appendChild(option);
            });
        });


    // Fetch and filter appointments when a hairdresser is selected
    hairdresserSelect.addEventListener("change", () => {
        const selectedHairdresserId = parseInt(hairdresserSelect.value, 10); // Convert to number
        console.log(`Selected Hairdresser ID: ${selectedHairdresserId}`);

        //fetch("https://salonsapi.prooktatas.hu/api/appointments")
             fetch("http://localhost:3000/api/appointments?hairdresser_id=" + selectedHairdresserId)
            // https://salonsapi.prooktatas.hu/api/appointments
            .then(response => response.json())
            .then(appointments => {
                // Update the table with filtered appointments
                appointmentsTableBody.innerHTML = ""; // Clear the table
                appointments.forEach(appointment => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                    <td>${appointment.customer_name}</td>
                    <td>${appointment.customer_phone}</td>
                    <td>${appointment.appointment_date}</td>
                    <td>${appointment.service}</td>
                    <td>
                        <button class="delete-btn" data-id="${appointment.id}">Delete</button>
                        <button class="edit-btn" data-id="${appointment.id}">Edit</button>
                    </td>
                `;
                    appointmentsTableBody.appendChild(row);
                });
            })
            .catch(error => console.error("Error fetching appointments:", error));
    });

    // Use event delegation for delete and edit buttons
    appointmentsTableBody.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-btn")) {
            const appointmentId = event.target.dataset.id;

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
                    // Successfully deleted
                    event.target.closest("tr").remove();
                    alert("Appointment deleted successfully.");
                })
                .catch(error => {
                    console.error("Error deleting appointment:", error);
                    alert("Error deleting appointment: " + error.message);
                });
        }

        if (event.target.classList.contains("edit-btn")) {
            const appointmentId = event.target.dataset.id;
            const newCustomerName = prompt("Enter new customer name:");
            const newCustomerPhone = prompt("Enter new customer phone:");

            if (newCustomerName && newCustomerPhone) {
                fetch(`http://localhost:3000/api/appointments/${appointmentId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        customer_name: newCustomerName,
                        customer_phone: newCustomerPhone,
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
        }
    });


});
