import MyCustomPanel from "./customAlertBox.mod.js";
//import * as myCalendar from "./customCalendar.mod.js";

export class MyTextBox {
    element;
    parentElement;

    imageElement;
    nameElement;
    phoneElement;
    emailElement;
    startWorkElement;
    endWorkElement;
    servicesElement;
    appointmentBtnElement;

    static #template = `
        <div class="hair-dressers">
            <img id="profile-image" alt="Profile Image">
            <h2></h2>
            <p id="phone"></p>
            <p id="email"></p>
            <p>Munkaidő: <span id="start-work"></span> - <span id="end-work"></span> </p>
            <select id="services"></select>
        </div>
    `;

    constructor(options) {
        if (typeof options.renderTo == "string") {
            this.parentElement = document.querySelector(options.renderTo);
        } else if (options.renderTo instanceof HTMLElement) {
            this.parentElement = options.renderTo;
        }

        //this.hairdresserId = hairdresser.id;

        const myDiv = document.createElement("div");
        myDiv.innerHTML = MyTextBox.#template;
        this.element = myDiv.firstElementChild;

        this.imageElement = this.element.querySelector("#profile-image");
        this.nameElement = this.element.querySelector("h2");
        this.phoneElement = this.element.querySelector("#phone");
        this.emailElement = this.element.querySelector("#email");
        this.startWorkElement = this.element.querySelector("#start-work");
        this.endWorkElement = this.element.querySelector("#end-work");
        this.servicesElement = this.element.querySelector("#services");
        this.appointmentBtnElement = document.createElement("button");
        this.appointmentBtnElement.textContent = "Foglalás";
        this.appointmentBtnElement.classList.add("reserve-btn");
        // Inside MyTextBox class
        this.appointmentBtnElement.addEventListener("click", () => {
            // Get the data when Reserve is clicked
            const selectedService = this.servicesElement.options[this.servicesElement.selectedIndex].text;
            const name = this.nameElement.textContent;
            const profileImage = this.imageElement.src;
            const startTime = this.startWorkElement.textContent;
            const endTime = this.endWorkElement.textContent;
            const hairdresserId = this.hairdresserId;

            // Pass the data to the alert box
            const customAlertBox = new MyCustomPanel();
            customAlertBox.showWithDetails(name, profileImage, selectedService, startTime, endTime, hairdresserId);
        });


        this.setProfileImage(options.imageName);
        this.hairdresserId = options.id;
        this.name = options.name;
        this.phone_number = options.phone_number;
        this.email = options.email;
        this.startWork = options.startWork;
        this.endWork = options.endWork;

        this.populateServices(options.services, options.id);

        this.element.appendChild(this.appointmentBtnElement);
        this.parentElement.appendChild(this.element);
    }


    get profileImage() {
        return this.profileImage;
    }

    setProfileImage(fileName) {
        const basePath = "./images/profile/"; // Adjust to your image folder path
        if (fileName) {
            this.imageElement.src = `${basePath}${fileName}`; // Use the dynamic file name
            this.imageElement.onerror = () => {
                this.imageElement.src = `${basePath}default.jpg`; // Fallback if the image doesn't exist
            };
            this.imageElement.alt = fileName;
        } else {
            this.imageElement.src = `${basePath}default.jpg`; // Use a default image if no file name is provided
            this.imageElement.alt = "Default image";
        }
    }

    get name() {
        return this.name;
    }

    set name(name) {
        this.nameElement.textContent = name;
    }

    get phone_numbe() {
        return this.phone_numbe;
    }

    /**
     * @param {string | null} phone_number
     */
    set phone_number(phone_number) {
        this.phoneElement.textContent = phone_number;
    }

    get email() {
        return this.email;
    }

    set email(email) {
        this.emailElement.textContent = email;
    }

    get startWork() {
        return this.startWork;
    }


    set startWork(startWork) {
        this.startWorkElement.textContent = startWork;
    }

    get endWork() {
        return this.endWork;
    }

    set endWork(endWork) {
        this.endWorkElement.textContent = endWork;
    }

    populateServices(services, hairdresserId) {
        if (Array.isArray(services)) {
            services.forEach((service, index) => {
                const option = document.createElement("option");
                option.textContent = service; // Use the service name as text
                option.value = `${hairdresserId}-${index}`; // Generate a unique ID
                option.setAttribute("data-hairdresser-id", hairdresserId); 
                this.servicesElement.appendChild(option);
            });
        }
    }
}
