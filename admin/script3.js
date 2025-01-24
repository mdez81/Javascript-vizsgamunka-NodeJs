document.addEventListener("DOMContentLoaded", () => {
    const hairdresserSelect = document.getElementById("hairdresser-select");
    const appointmentsTableBody = document.querySelector("#appointments-table tbody");

    // Populate hairdressers dropdown
    fetch("https://salonsapi.prooktatas.hu/api/hairdressers")   // Use the correct API URL
        .then(response => response.json())
        .then(hairdressers => {
            hairdressers.forEach(hairdresser => {
                const option = document.createElement("option");
                option.value = hairdresser.id; // Use the hairdresser's ID as the value
                option.textContent = hairdresser.name; // Use the hairdresser's name as the label
                hairdresserSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error fetching hairdressers:", error);
            alert("Error fetching hairdressers: " + error.message);
        });

    // Fetch and filter appointments when a hairdresser is selected
    hairdresserSelect.addEventListener("change", () => {
        const selectedHairdresserId = parseInt(hairdresserSelect.value, 10); // Convert to number
        console.log(`Selected Hairdresser ID: ${selectedHairdresserId}`);

        // Fetch appointments for the selected hairdresser
        fetch("https://salonsapi.prooktatas.hu/api/appointments")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(appointments => {
                // Ensure hairdresser_id is compared as a number
                const filteredAppointments = appointments.filter(appointment => {
                    return parseInt(appointment.hairdresser_id, 10) === selectedHairdresserId;
                });

                console.log("Filtered Appointments:", filteredAppointments); // Log filtered appointments to debug

                // Check if the filtered appointments array is empty or null
                if (filteredAppointments.length === 0) {
                    appointmentsTableBody.innerHTML = "<tr><td colspan='5'>No appointments found for the selected hairdresser.</td></tr>";
                    return;
                }

                // Update the table with filtered appointments
                document.getElementById("appointments-table").style.display = "block";
                appointmentsTableBody.innerHTML = ""; // Clear the table before adding new rows
                filteredAppointments.forEach(appointment => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${appointment.customer_name}</td>
                        <td>${appointment.customer_phone}</td>
                        <td>${appointment.appointment_date}</td>
                        <td>${appointment.service}</td>
                        <!--<td>
                            <button class="delete-btn" data-id="${appointment.id}">Delete</button>
                            <button class="edit-btn" data-id="${appointment.id}">Edit</button>
                        </td>
                    `;
                    appointmentsTableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error("Error fetching appointments:", error);
                alert("Error fetching appointments: " + error.message);
            });
    });

    // Use event delegation for delete and edit buttons
    appointmentsTableBody.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-btn")) {
            const appointmentId = event.target.dataset.id; // Get the appointment ID
            console.log(`Attempting to delete appointment with ID: ${appointmentId}`); // Debug log for ID
    
            const proxyUrl = 'https://api.allorigins.win';
            const apiUrl = 'https://salonsapi.prooktatas.hu/api/appointments/14';
            
            fetch(proxyUrl + apiUrl, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Appointment deleted:", data);
                alert("Appointment deleted successfully.");
            })
            .catch(error => {
                console.error("Error deleting appointment:", error);
                alert("Error deleting appointment: " + error.message);
            });
        }
    });
    
});
    