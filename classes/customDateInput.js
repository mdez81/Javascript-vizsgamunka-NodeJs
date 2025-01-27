export class CustomDateInput {
    constructor(selector, currentAppointmentDate, onDateSelect) {
        this.input = document.querySelector(selector);
        this.currentDate = new Date(currentAppointmentDate);
        this.onDateSelect = onDateSelect;

        this.createDatePicker();
        this.setupEventListeners();
    }

    createDatePicker() {
        this.wrapper = document.createElement("div");
        this.wrapper.classList.add("custom-date-wrapper");

        this.calendar = document.createElement("input");
        this.calendar.type = "date";
        this.calendar.value = this.formatDate(this.currentDate);
        this.calendar.classList.add("custom-calendar");

        this.wrapper.appendChild(this.calendar);
        this.input.parentNode.replaceChild(this.wrapper, this.input);
        this.wrapper.appendChild(this.input);
    }

    setupEventListeners() {
        this.input.addEventListener("focus", () => {
            this.calendar.style.display = "block";
        });

        this.calendar.addEventListener("input", (e) => {
            this.input.value = this.formatDate(new Date(e.target.value));
            this.calendar.style.display = "none";
            if (this.onDateSelect) this.onDateSelect(this.input.value);
        });

        document.addEventListener("click", (e) => {
            if (!this.wrapper.contains(e.target)) {
                this.calendar.style.display = "none";
            }
        });
    }

    formatDate(date) {
        return date.toISOString().split("T")[0]; // Format to YYYY-MM-DD
    }
}
