export default class MyCustomAlertBox {
    constructor() {
        this.element = document.createElement("div");
        this.element.className = "alert-container";
        this.element.style.display = "none"; // Initially hidden

        // Alert content
        const alertContent = document.createElement("div");
        alertContent.className = "alert-content";
        this.element.appendChild(alertContent);

        // Alert text
        this.alertText = document.createElement("p");
        this.alertText.classList.add("alert-text");
        alertContent.appendChild(this.alertText);

        // Button container
        const btnContainer = document.createElement("div");
        alertContent.appendChild(btnContainer);

        // Close button
        this.closeBtn = document.createElement("button");
        this.closeBtn.textContent = "Rendben";
        this.closeBtn.classList.add("alert-btn");

        btnContainer.appendChild(this.closeBtn);
        document.body.appendChild(this.element);
    }

    show(text, onCloseCallback = null) {
        this.alertText.textContent = text;
        this.element.style.display = "flex";

        this.closeBtn.onclick = () => {
            this.hide();
            if (onCloseCallback) {
                onCloseCallback(); // Call the function when alert is closed
            }
        };
    }

    hide() {
        this.element.style.display = "none";
    }
}
