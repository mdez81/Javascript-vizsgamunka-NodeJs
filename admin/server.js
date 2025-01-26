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

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'login_register'
});

const db2 = mysql.createConnection({
  host: "localhost",
  user: "root", // Állítsd be az adatbázisod felhasználónevét
  password: "", // Állítsd be az adatbázisod jelszavát
  database: "hair_salon",
});

// Middleware
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' folder
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(cors());
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/register', (req, res) => res.sendFile(__dirname + '/views/register.html'));
app.get('/login', (req, res) => res.sendFile(__dirname + '/views/login.html'));
app.get('/dashboard', (req, res) => res.sendFile(__dirname + '/views/dashboard.html'));

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Hash password
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




// Adatok lekérése az API-ról és beszúrás csak akkor, ha az appointments tábla üres
axios.get("https://salonsapi.prooktatas.hu/api/appointments")
    .then(response => {
        const appointments = response.data;

        // Ellenőrizzük, hogy az appointments tábla üres-e
        const checkQuery = "SELECT COUNT(*) AS count FROM appointments";
        db2.query(checkQuery, (err, results) => {
            if (err) {
                console.error("Error checking appointments table:", err);
                return;
            }

            const count = results[0].count;
            if (count === 0) {
                console.log("Appointments table is empty. Inserting data...");

                // Beillesztés az adatbázisba
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

        // Check if the hairdressers table is empty
        const checkQuery = "SELECT COUNT(*) AS count FROM hairdressers";
        db2.query(checkQuery, (err, results) => {
            if (err) {
                console.error("Error checking hairdressers table:", err);
                return;
            }

            const count = results[0].count;
            if (count === 0) {
                console.log("Hairdressers table is empty. Inserting data...");

                // Insert data into the hairdressers table
                const insertQuery = `
                    INSERT INTO hairdressers (id, name, phone_number, email) 
                    VALUES (?, ?, ?,?)`;

                hairdressers.forEach(hairdresser => {
                    db2.query(insertQuery, [
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




// Lekérdezés időpontok alapján
app.get("/api/appointments", (req, res) => {
    const { hairdresser_id } = req.query;

    const query = "SELECT * FROM appointments WHERE hairdresser_id = ?";
    db2.query(query, [hairdresser_id], (err, results) => {
        if (err) {
            console.error("Error fetching appointments:", err);
            res.status(500).send("Server error.");
        } else {
            res.json(results);
        }
    });
});

// Törlés
app.delete("/api/appointments/:id", (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM appointments WHERE id = ?";
    db2.query(query, [id], (err, results) => {
        if (err) {
            console.error("Error deleting appointment:", err);
            res.status(500).send("Server error.");
        } else {
            res.send("Appointment deleted successfully.");
        }
    });
});

// Módosítás
app.put("/api/appointments/:id", (req, res) => {
    const { id } = req.params;
    const { customer_name, customer_phone } = req.body;

    const query = `
      UPDATE appointments 
      SET customer_name = ?, customer_phone = ? 
      WHERE id = ?`;

    db2.query(
        query,
        [customer_name, customer_phone, id],
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


// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
