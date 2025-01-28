const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');

const axios = require("axios");
const cors = require("cors");

const app = express();
const path = require('path');
const PORT = 3000;
const JWT_SECRET = 'your_jwt_secret_key';


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hair_salon'
});



app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' folder
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(cors());
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/register', (req, res) => res.sendFile(__dirname + '/views/register.html'));
app.get('/login', (req, res) => res.sendFile(__dirname + '/views/login.html'));
app.get('/dashboard', (req, res) => res.sendFile(__dirname + '/views/dashboard.html'));

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;


    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?,?)';
    db.query(sql, [username, email, hashedPassword], (err) => {
        if (err) throw err;
        //res.send('User registered successfully!');
        res.redirect('/login');
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) throw err;

        if (results.length === 0 || !bcrypt.compareSync(password, results[0].password)) {
            return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign({ id: results[0].id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token }); // Send token as a response        
    });
});

db.connect(err => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL database.");
});




axios.get("https://salonsapi.prooktatas.hu/api/appointments")
    .then(response => {
        const appointments = response.data;

        const checkQuery = "SELECT COUNT(*) AS count FROM appointments";
        db.query(checkQuery, (err, results) => {
            if (err) {
                console.error("Error checking appointments table:", err);
                return;
            }

            const count = results[0].count;
            if (count === 0) {
                console.log("Appointments table is empty. Inserting data...");


                const insertQuery = `
                    INSERT INTO appointments (hairdresser_id, customer_name, customer_phone, appointment_date, service) 
                    VALUES (?, ?, ?, ?, ?)`;

                appointments.forEach(appointment => {
                    db.query(insertQuery, [
                        appointment.hairdresser_id,
                        appointment.customer_name,
                        appointment.customer_phone,
                        appointment.appointment_date,
                        appointment.service,
                    ], (err, results) => {
                        if (err) {
                            console.error("Error inserting appointment:", err);
                        } else {
                            console.log("Inserted appointment ID:", results.insertId);
                        }
                    });
                });
            } else {
                console.log("Appointments table already contains data. Skipping insert.");
            }
        });
    })
    .catch(error => {
        console.error("Error fetching data from API:", error);
    });


axios.get("https://salonsapi.prooktatas.hu/api/hairdressers")
    .then(response => {
        const hairdressers = response.data;


        const checkQuery = "SELECT COUNT(*) AS count FROM hairdressers";
        db.query(checkQuery, (err, results) => {
            if (err) {
                console.error("Error checking hairdressers table:", err);
                return;
            }

            const count = results[0].count;
            if (count === 0) {
                console.log("Hairdressers table is empty. Inserting data...");


                const insertQuery = `
                    INSERT INTO hairdressers (id, name, phone_number, email) 
                    VALUES (?, ?, ?,?)`;

                hairdressers.forEach(hairdresser => {
                    db.query(insertQuery, [
                        hairdresser.id,
                        hairdresser.name,
                        hairdresser.phone_number,
                        hairdresser.email
                    ], (err, results) => {
                        if (err) {
                            console.error("Error inserting hairdresser:", err);
                        } else {
                            console.log("Inserted hairdresser ID:", results.insertId);
                        }
                    });
                });
            } else {
                console.log("Hairdressers table already contains data. Skipping insert.");
            }
        });
    })
    .catch(error => {
        console.error("Error fetching data from API:", error);
    });


app.get("/api/hairdressers", (req, res) => {
    axios.get("https://salonsapi.prooktatas.hu/api/hairdressers")
        .then(response => {
            const hairdressers = response.data;
            res.json(hairdressers); // Send the hairdressers data to the frontend
        })
        .catch(error => {
            console.error("Error fetching hairdressers data:", error);
            res.status(500).send("Server error.");
        });
});





app.get("/api/appointments", (req, res) => {
    const { hairdresser_id } = req.query;

    const query = "SELECT * FROM appointments WHERE hairdresser_id = ?";
    db.query(query, [hairdresser_id], (err, results) => {
        if (err) {
            console.error("Error fetching appointments:", err);
            res.status(500).send("Server error.");
        } else {
            res.json(results);
        }
    });
});

app.get("/api/appointments/:id", (req, res) => {
    const appointmentId = parseInt(req.params.id, 10);

    console.log("🔍 Fetching appointment with ID:", appointmentId);

    if (isNaN(appointmentId)) {
        console.log("Invalid appointment ID:", req.params.id);
        return res.status(400).json({ error: "Invalid appointment ID" });
    }

    const query = "SELECT * FROM appointments WHERE id = ?";
    db.query(query, [appointmentId], (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Database query error" });
        }

        if (results.length === 0) {
            console.log("Appointment not found:", appointmentId);
            return res.status(404).json({ error: "Appointment not found" });
        }

        //console.log("Appointment found:", results[0]);
        res.json(results[0]); 
    });
});



app.delete("/api/appointments/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM appointments WHERE id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error deleting appointment:", err);
            res.status(500).send("Server error.");
        } else {
            res.send("Appointment deleted successfully.");
        }
    });
});


app.put("/api/appointments/:id", (req, res) => {
    const { id } = req.params;
    const { customer_name, customer_phone, appointment_date } = req.body;

    const query = `
      UPDATE appointments 
      SET customer_name = ?, customer_phone = ?, appointment_date = ? 
      WHERE id = ?`;

    db.query(
        query,
        [customer_name, customer_phone, appointment_date, id],
        (err, results) => {
            if (err) {
                console.error("Error updating appointment:", err);
                res.status(500).json({ error: "Server error." });
            } else {
                res.json({ message: "Appointment updated successfully." });
            }
        }
    );
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
