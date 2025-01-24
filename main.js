import { MyTextBox } from "./classes/textBox.mod.js";
//import { MyCustomAlertBox } from "./customAlertBox.mod.js";
//import * as calendar from "./myCalendar.mod.js";

const content = document.querySelector("#content");
const myTextBoxes = [];

(async function getData() {
    try {
        const response = await fetch("https://salonsapi.prooktatas.hu/api/hairdressers");
        const data = await response.json();

        data.forEach(hairdresser => {

              const imageName = `${hairdresser.id}.jpg`

            myTextBoxes.push(new MyTextBox({
                renderTo: content,
                imageName: imageName,  
                name: hairdresser.name,
                phone_number: hairdresser.phone_number,
                email: hairdresser.email,
                startWork: hairdresser.work_start_time,
                endWork: hairdresser.work_end_time,
                services: hairdresser.services, 
                id: hairdresser.id, 
            }));
        });
    } catch (error) {
        console.error("Error fetching hairdressers:", error);
    }
})();

//calendar.updateCalendar();











