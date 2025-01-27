import MyCustomAlertBox from "./customAlertBox-2.mod.js";

export default class MyCustomPanel {
    alertElement;

    constructor() {
        this.alertElement = document.createElement("div");
        this.alertElement.classList.add("custom-alert-box");
        document.body.appendChild(this.alertElement);
    }

    show() {
        this.alertElement.style.display = "block";
    }

    hide() {
        this.alertElement.style.display = "none";
    }

    showWithDetails(name, profileImage, selectedService, startTime, endTime, hairdresserId) {
        this.alertElement.innerHTML = `     
        <div class="popup-content">
            <img src="${profileImage}" alt="Profile Image" class="popup-profile-image">
            <h3>${name}</h3>
            <p>Selected Service: ${selectedService}</p>
            <input type="date" id="appointment-date">
            <div id="time-slots" class="time-slot-container"></div>
            <div id="cust-info">
                <label for="cust-name">Name:</label>
                <input type="text" name="cust-name" id="cust-name" placeholder="John Doe">
            </div>
            <div id="cust-info">
                <label for="cust-phone">Phone number:</label>
                <input type="tel" id="cust-phone" name="cust-phone" placeholder="123-45-678"
                    pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}" required>
            </div>
            <button id="confirm-appointment">Confirm</button>
            <button id="cancel-appointment">Canel</button>
        </div>`;

        console.log("Selected Hairdresser ID:", hairdresserId);

        // Attach the event listener AFTER setting innerHTML
        setTimeout(() => {
            const cancelButton = document.getElementById("cancel-appointment");
            if (cancelButton) {
                cancelButton.addEventListener("click", () => {
                    console.log("Cancel button clicked.");
                    this.hide();
                });
            } else {
                console.error("Cancel button not found.");
            }
        }, 500); 

       
        this.clearPreviousSelections();

      
        document.getElementById("appointment-date").addEventListener("change", (event) => {
            const selectedDate = event.target.value;
            const today = new Date().toISOString().split("T")[0];

            if (selectedDate < today) {
                console.warn("Past date selected. Showing custom alert.");
                this.hide();

          
                const customAlert = new MyCustomAlertBox();
                customAlert.show("You cannot book an appointment for a past date!", () => {
                    this.show(); 
                });

                event.target.value = today;
                return;
            }


            console.log("Selected Date:", selectedDate);
            this.fetchBookedTimes(hairdresserId, selectedDate, startTime, endTime);
        });

        this.populateTimeSlots(startTime, endTime);
        this.show();

      
        document.getElementById("confirm-appointment").addEventListener("click", () => {
            const selectedDate = document.getElementById("appointment-date").value;
            const selectedTimeSlot = document.querySelector(".time-slot.selected");
            const customerName = document.getElementById("cust-name").value;
            const customerPhoneNum = document.getElementById("cust-phone").value;

            if (selectedTimeSlot && selectedDate && customerName && customerPhoneNum) {
                const appointmentDate = `${selectedDate} ${selectedTimeSlot.textContent}:00`;

                const appointmentData = {
                    hairdresser_id: String(hairdresserId),
                    customer_name: customerName,
                    customer_phone: customerPhoneNum,
                    appointment_date: appointmentDate,
                    service: selectedService,
                };

                this.sendAppointmentData(appointmentData);
                console.log(appointmentData);
            } else {
                alert("Please select a date and time slot.");
            }
        });



    }

    clearPreviousSelections() {
        const timeSlotsContainer = this.alertElement.querySelector("#time-slots");
        if (timeSlotsContainer) {
            timeSlotsContainer.innerHTML = "";
        }

        const dateInput = this.alertElement.querySelector("#appointment-date");
        if (dateInput) {
            dateInput.value = "";
        }

        const customerNameInput = this.alertElement.querySelector("#cust-name");
        if (customerNameInput) {
            customerNameInput.value = "";
        }

        const customerPhoneInput = this.alertElement.querySelector("#cust-phone");
        if (customerPhoneInput) {
            customerPhoneInput.value = "";
        }
    }


    fetchBookedTimes(hairdresserId, selectedDate, startTime, endTime) {
        console.log("Fetching appointments for:", hairdresserId, "on Date:", selectedDate);

        fetch("https://salonsapi.prooktatas.hu/api/appointments")
            .then(response => {
                console.log("API Response Status:", response.status);

                if (!response.ok) {
                    if (response.status === 404) {
                        console.warn("No appointments found for this hairdresser.");
                        return []; // Return empty array instead of error
                    }
                    throw new Error(`API error: ${response.status}`);
                }

                return response.json();
            })
            .then(appointments => {
                const filteredAppointments = appointments.filter(appointment => {
                    return (
                        String(appointment.hairdresser_id) === String(hairdresserId) &&
                        appointment.appointment_date.startsWith(selectedDate) 
                    );
                });

                if (!Array.isArray(filteredAppointments)) {
                    console.error("Invalid API response format:", filteredAppointments);
                    return;
                }

                const bookedTimes = filteredAppointments.map(appointment => {
                    if (appointment && appointment.appointment_date) {
                        return appointment.appointment_date.split(" ")[1].substring(0, 5); // Extract "HH:mm"
                    }
                    return null;
                }).filter(time => time !== null);

                console.log("Booked times:", bookedTimes);
                this.populateTimeSlots(startTime, endTime, bookedTimes);
            })
            .catch(error => console.error("Error fetching booked times:", error));
    }

    populateTimeSlots(startTime, endTime, bookedTimes = []) {
        const timeSlotsContainer = this.alertElement.querySelector("#time-slots");

        if (!timeSlotsContainer) {
            console.error("The time-slots div was not found.");
            return;
        }

        timeSlotsContainer.innerHTML = ""; // Clear previous time slots



        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);

        for (let time = start; time < end; time.setMinutes(time.getMinutes() + 30)) {
            const timeString = this.formatTime(time);
            const timeSlotDiv = document.createElement("div");
            timeSlotDiv.classList.add("time-slot");
            timeSlotDiv.textContent = timeString;


            if (bookedTimes.includes(timeString)) {
                timeSlotDiv.classList.add("booked");
                timeSlotDiv.style.backgroundColor = "red";
                timeSlotDiv.style.pointerEvents = "none"; // Disable selection
            } else {
                timeSlotDiv.addEventListener("click", () => {
                    this.selectTimeSlot(timeSlotDiv);
                });
            }

            timeSlotsContainer.appendChild(timeSlotDiv);
        }
    }

    parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return new Date(0, 0, 0, hours, minutes);
    }

    formatTime(date) {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    selectTimeSlot(timeSlotDiv) {
        // Remove 'selected' from any previously selected time slot
        const selected = this.alertElement.querySelector(".time-slot.selected");
        if (selected) {
            selected.classList.remove("selected");
        }


        if (!timeSlotDiv.classList.contains("booked")) {
            timeSlotDiv.classList.add("selected");
        }
    }

    sendAppointmentData(data) {
        fetch("https://salonsapi.prooktatas.hu/api/appointments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                if (response.ok) {
                    const myAlertBox = new MyCustomAlertBox();
                    myAlertBox.show("Appointment successfully booked!");
                    this.hide();
                } else {
                    return response.json().then((error) => {
                        throw new Error(error.message || "Error booking appointment!");
                    });
                }
            })
            .catch((error) => {
                alert(`Error: ${error.message}`);
            });
    }
}
