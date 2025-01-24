import MyCustomAlertBox from "./classes/customAlertBox-2.mod.js";

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
        // Popup HTML sablon, amely tartalmazza a time-slotokat is
        this.alertElement.innerHTML = `     
        <div class="popup-content">
            <img src="${profileImage}" alt="Profile Image" class="popup-profile-image">
            <h3>${name}</h3>
             <h3>${hairdresserId}</h3>
            <p>Selected Service: ${selectedService}</p>
            <input type="date" id="appointment-date">
            <div id="time-slots" class="time-slot-container"></div>
            <div id="cust-info">
                <label for="name"> Név:</label>
                <input type="text" name="cust-name" id="cust-name" placeholder="Kovács Béla">
            </div>
            <div id="cust-info">
                <label for="cust-phone"> phone number:</label>
                <input type="tel" id="cust-phone" name="cust-phone" placeholder="123-45-678"
                    pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}" required>
            </div>

            <button id="confirm-appointment">Confirm</button>
        </div>
        `;


        /* console.log( hairdresserId);
 
        
     
         
         fetch( `https://salonsapi.prooktatas.hu/api/appointments?hairdresser_id=${hairdresserId}`)
     .then(response => {
         if (!response.ok) {
             if (response.status === 404) {
                 throw new Error("No appointments found for the selected hairdresser.");
             }
             throw new Error(`API error: ${response.status}`);
         }
         return response.json();
     })
     .then(data => {
         console.log("Full API Response Data:", data);
         const bookedTimes = data
             .map(appointment => {
                 if (appointment && appointment.appointment_date) {
                     const dateTimeParts = appointment.appointment_date.split(" ");
                     if (dateTimeParts.length > 1) {
                         return dateTimeParts[1].substring(0, 5); // Extract "HH:mm"
                     }
                 }
                 return null;
             })
             .filter(time => time !== null);
         console.log("Parsed Booked Times:", bookedTimes);
         this.populateTimeSlots(startTime, endTime, bookedTimes);
     })
     .catch(error => {
         console.error("Failed to fetch booked times:", error);
         // Handle the error message here
     });*/



        // Időpontok generálása
        this.populateTimeSlots(startTime, endTime);
        this.show(); // Megjeleníti az alert boxot

        // Event listener a foglalás gombra
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

    populateTimeSlots(startTime, endTime, bookedTimes = []) {
        const timeSlotsContainer = this.alertElement.querySelector("#time-slots");

        if (!timeSlotsContainer) {
            console.error("A time-slots div nem található.");
            return;
        }

        timeSlotsContainer.innerHTML = ""; // Törli az előző időpontokat

        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);

        console.log("Start time:", startTime, "End time:", endTime); // Log start és end time

        for (let time = start; time < end; time.setMinutes(time.getMinutes() + 30)) {
            const timeSlotDiv = document.createElement("div");
            timeSlotDiv.classList.add("time-slot");
            const timeString = this.formatTime(time);
            timeSlotDiv.textContent = timeString;

            console.log("Generated time slot:", timeString); // Logolt időpont

            if (bookedTimes.includes(timeString)) {
                timeSlotDiv.classList.add("booked");
                timeSlotDiv.style.backgroundColor = "red";
                timeSlotDiv.style.pointerEvents = "none";
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
        const selected = this.alertElement.querySelector(".time-slot.selected");
        if (selected) {
            selected.classList.remove("selected");

        }
        timeSlotDiv.classList.add("selected");

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
                    //alert("időpont sikeresen lefoglalva");
                    const myAlertBox = new MyCustomAlertBox();
                    myAlertBox.show("időpont sikeresen lefoglalva");
                    this.hide();
                } else {
                    return response.json().then((error) => {
                        throw new Error(error.message || "Időpont foglalási hiba!");
                    })
                }
            }).catch((error) => {
                alert(`Error: ${error.message}`);
            });
    }

    //this.timeSlotDiv.disabled = true;

}