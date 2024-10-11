const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const saltRounds = 10;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/user/');  // เปลี่ยนจาก 'uploads/' เป็น 'assets/user/'
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);  // ใช้ชื่อไฟล์เดิม
    }
});

const upload = multer({ storage: storage });

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});

db.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: 'smtp.gmail.com',
    port: process.env.EMAIL_PORT,
    secure: false, // ใช้ false สำหรับ port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// API สำหรับการเข้าสู่ระบบ
app.post('/api/login', async function(req, res) {
    const { username, password } = req.body;
    const sql = "SELECT UserId, password, loginAttempt, isActive, lastAttemptTime FROM User WHERE username = ?";

    try {
        const [users] = await db.promise().query(sql, [username]);

        if (users.length > 0) {
            const user = users[0];
            const storedHashedPassword = user.password;
            const loginAttempt = user.loginAttempt;
            const isActive = user.isActive;
            const lastAttemptTime = user.lastAttemptTime;

            // ตรวจสอบสถานะของบัญชีว่าถูกล็อกหรือไม่
            if (isActive !== 1) {
                // อัปเดต lastAttemptTime ทุกครั้งที่มีการพยายามเข้าสู่ระบบ
                await db.promise().query("UPDATE User SET lastAttemptTime = NOW() WHERE UserId = ?", [user.UserId]);
                return res.send({ "message": "บัญชีนี้ถูกปิดใช้งาน", "status": false });
            }

            // ตรวจสอบจำนวนครั้งในการพยายามเข้าสู่ระบบในช่วงเวลา 24 ชั่วโมง
            const now = new Date();
            const lastAttempt = lastAttemptTime ? new Date(lastAttemptTime) : new Date(0); // ถ้าไม่มีค่า lastAttemptTime ให้ใช้วันที่ 0
            const diffTime = Math.abs(now - lastAttempt);
            const diffHours = Math.ceil(diffTime / (1000 * 60 * 60)); // แปลงเป็นชั่วโมง

            if (loginAttempt > 5 && diffHours < 24) {
                // อัปเดต lastAttemptTime ทุกครั้งที่มีการพยายามเข้าสู่ระบบ
                await db.promise().query("UPDATE User SET lastAttemptTime = NOW() WHERE UserId = ?", [user.UserId]);
                return res.send({ 
                    "message": "บัญชีคุณถูกล็อคเนื่องจากมีการพยายามเข้าสู่ระบบเกินกำหนด", 
                    "status": false 
                });
            }

            // ตรวจสอบรหัสผ่าน
            const match = await bcrypt.compare(password, storedHashedPassword);

            if (match) {
                // รีเซ็ตจำนวนครั้งการพยายามเข้าสู่ระบบและ lastAttemptTime
                const updateSql = "UPDATE User SET loginAttempt = 0, lastAttemptTime = NOW(), isActive = 1 WHERE UserId = ?";
                const [updateResult] = await db.promise().query(updateSql, [user.UserId]);

                // ตรวจสอบว่ามีการอัปเดตสำเร็จหรือไม่
                if (updateResult.affectedRows > 0) {
                    return res.send({ 
                        "message": "เข้าสู่ระบบสำเร็จ", 
                        "status": true, 
                        "userID": user.UserId 
                    });
                } else {
                    return res.send({ "message": "เกิดข้อผิดพลาดในการอัปเดตข้อมูล", "status": false });
                }
            } else {
                // เพิ่มจำนวนครั้งที่พยายามเข้าสู่ระบบและอัปเดต lastAttemptTime
                const updateSql = "UPDATE User SET loginAttempt = loginAttempt + 1, lastAttemptTime = NOW() WHERE UserId = ?";
                const [updateResult] = await db.promise().query(updateSql, [user.UserId]);

                // ตรวจสอบว่ามีการอัปเดตสำเร็จหรือไม่
                if (updateResult.affectedRows > 0) {
                    if (loginAttempt >= 2) {
                        return res.send({ 
                            "message": "บัญชีคุณถูกล็อคเนื่องจากมีการพยายามเข้าสู่ระบบเกินกำหนด", 
                            "status": false 
                        });
                    } else {
                        return res.send({ "message": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", "status": false });
                    }
                } else {
                    return res.send({ "message": "เกิดข้อผิดพลาดในการอัปเดตข้อมูล", "status": false });
                }
            }
        } else {
            return res.send({ "message": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", "status": false });
        }
    } catch (err) {
        console.error('Error during login process:', err);
        return res.status(500).send({ "message": "เกิดข้อผิดพลาดในการเชื่อมต่อ", "status": false });
    }
});

// Logout endpoint
app.post('/api/logout/:id', async (req, res) => {
    const { id } = req.params;
    const updateSql = "UPDATE User SET isActive = 1, loginAttempt = 0 WHERE UserId = ?";

    try {
        await db.promise().query(updateSql, [id]);
        res.send({ status: true, message: "Logged out successfully" });
    } catch (err) {
        console.error('Error during logout process:', err);
        res.status(500).send({ message: "Database update error", status: false });
    }
});

app.post('/api/checkUsernameEmail', async function(req, res) {
    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).send({ "message": "กรุณาระบุชื่อผู้ใช้และอีเมล", "status": false });
    }

    try {
        const [usernameResult] = await db.promise().query("SELECT username FROM User WHERE username = ?", [username]);
        const [emailResult] = await db.promise().query("SELECT email FROM User WHERE email = ?", [email]);

        if (usernameResult.length > 0) {
            return res.status(409).send({ "message": "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว", "status": false });
        }

        if (emailResult.length > 0) {
            return res.status(409).send({ "message": "อีเมลนี้ถูกใช้งานแล้ว", "status": false });
        }

        res.send({ "message": "ชื่อผู้ใช้และอีเมลนี้สามารถใช้ได้", "status": true });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send({ "message": "เกิดข้อผิดพลาดในระบบ", "status": false });
    }
});


app.post('/api/register8', upload.single('imageFile'), async function(req, res) {
    const { email, username, password, firstname, lastname, nickname, gender, height, phonenumber, home, dateOfBirth, educationID, preferences, goalID, interestGenderID } = req.body;
    const fileName = req.file ? req.file.filename : null;

    // ตรวจสอบข้อมูลว่าครบถ้วนหรือไม่
    if (!email || !username || !password || !firstname || !lastname || !nickname || !gender || !height || !phonenumber || !home || !dateOfBirth || !educationID || !preferences || !goalID || !interestGenderID || !fileName) {
        console.log("ข้อมูลไม่ครบถ้วน", {
            email, username, password, firstname, lastname, nickname, gender, height, phonenumber, home, dateOfBirth, educationID, preferences, goalID, interestGenderID, fileName
        });
        return res.status(400).send({ "message": "ข้อมูลไม่ครบถ้วน", "status": false });
    }

    try {
        // ทำการ hash รหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // ค้นหา GenderID
        const [genderResult] = await db.promise().query("SELECT GenderID FROM gender WHERE Gender_Name = ?", [gender]);

        if (genderResult.length === 0) {
            console.log("ไม่พบข้อมูลเพศที่ระบุ");
            return res.status(404).send({ "message": "ไม่พบข้อมูลเพศที่ระบุ", "status": false });
        }

        const genderID = genderResult[0].GenderID;

        // Log ข้อมูลก่อนการบันทึกลง database
        console.log("Inserting data into User: ", {
            username, hashedPassword, email, firstname, lastname, nickname, genderID, height, phonenumber, home, dateOfBirth, educationID, goalID, fileName, interestGenderID
        });

        // บันทึกข้อมูลผู้ใช้
        const sqlInsert = `
            INSERT INTO User (username, password, email, firstname, lastname, nickname, GenderID, height, phonenumber, home, DateBirth, EducationID, goalID, imageFile, interestGenderID )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [insertResult] = await db.promise().query(sqlInsert, [username, hashedPassword, email, firstname, lastname, nickname, genderID, height, phonenumber, home, dateOfBirth, educationID, goalID, fileName, interestGenderID]);

        const userID = insertResult.insertId;

        // บันทึก preferences
        const preferenceIDs = preferences.split(',').map(id => parseInt(id));
        for (const preferenceID of preferenceIDs) {
            await db.promise().query("INSERT INTO userpreferences (UserID, PreferenceID) VALUES (?, ?)", [userID, preferenceID]);
        }

        console.log(`Preferences saved for user ${userID}: `, preferenceIDs);

        res.send({ "message": "ลงทะเบียนสำเร็จ", "status": true });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send({ "message": "บันทึกลง FinLove ล้มเหลว", "status": false });
    }
});

app.post('/api/request-pin', async (req, res) => {
    const { email } = req.body;

    try {
        // ดึง userID จาก email
        const [result] = await db.promise().query("SELECT userID FROM User WHERE email = ?", [email]);

        if (result.length === 0) {
            return res.status(400).send({ message: "ไม่พบอีเมลนี้ในระบบ", status: false });
        }

        const userId = result[0].userID;  // ดึง userID เพื่ออัพเดต PIN
        const pinCode = Math.floor(1000 + Math.random() * 9000).toString(); // PIN 4 หลัก
        const expirationDate = new Date(Date.now() + 3600000); // PIN หมดอายุใน 1 ชั่วโมง

        // อัพเดต pinCode และ pinCodeExpiration โดยใช้ userID
        const updateResult = await db.promise().query(
            "UPDATE User SET pinCode = ?, pinCodeExpiration = ? WHERE userID = ?",
            [pinCode, expirationDate, userId]
        );

        // ตรวจสอบการอัพเดต
        if (updateResult[0].affectedRows === 0) {
            return res.status(500).send({ message: "ไม่สามารถอัพเดต PIN ได้", status: false });
        }

        // ส่ง PIN ไปยังอีเมลผู้ใช้
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'รหัส PIN สำหรับรีเซ็ตรหัสผ่าน',
            text: `รหัส PIN ของคุณคือ: ${pinCode}. รหัสนี้จะหมดอายุใน 1 ชั่วโมง.`
        };

        await transporter.sendMail(mailOptions);

        res.send("PIN ถูกส่งไปยังอีเมลของคุณ");
    } catch (err) {
        console.error('Error sending PIN:', err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการส่ง PIN", status: false });
    }
});


app.post('/api/verify-pin', async (req, res) => {
    const { email, pin } = req.body;

    try {
        // ตรวจสอบว่าอีเมลและ PIN ถูกต้อง
        const [result] = await db.promise().query(
            "SELECT userID, pinCode, pinCodeExpiration FROM User WHERE email = ? AND pinCode = ?",
            [email, pin]
        );

        if (result.length === 0) {
            return res.status(400).send({ message: "PIN ไม่ถูกต้อง", status: false });
        }

        const user = result[0];
        const currentTime = new Date();

        // ตรวจสอบว่า PIN หมดอายุหรือไม่
        if (currentTime > user.pinCodeExpiration) {
            return res.status(400).send({ message: "PIN หมดอายุ", status: false });
        }

        // ถ้า PIN ถูกต้องและยังไม่หมดอายุ
        res.send({ message: "PIN ถูกต้อง", status: true });
    } catch (err) {
        console.error("Error verifying PIN:", err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการยืนยัน PIN", status: false });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { email, pin, newPassword } = req.body;

    // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (!email || !pin || !newPassword) {
        return res.status(400).send({ message: "ข้อมูลไม่ครบถ้วน", status: false });
    }

    console.log("Received Data:", req.body); // Log ข้อมูลที่ได้รับจากแอป Android

    try {
        // ตรวจสอบ PIN และวันหมดอายุ
        const [result] = await db.promise().query(
            "SELECT userID, pinCode, pinCodeExpiration FROM User WHERE email = ? AND pinCode = ? AND pinCodeExpiration > ?",
            [email, pin, new Date()]
        );

        if (result.length === 0) {
            return res.status(400).send({ message: "PIN ไม่ถูกต้องหรือหมดอายุ", status: false });
        }

        const userId = result[0].userID;

        // เข้ารหัสรหัสผ่านใหม่
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // อัปเดตรหัสผ่านใหม่ในฟิลด์ password และลบข้อมูล PIN ออก
        const updateResult = await db.promise().query(
            "UPDATE User SET password = ?, pinCode = NULL, pinCodeExpiration = NULL WHERE userID = ?",
            [hashedPassword, userId]
        );

        if (updateResult[0].affectedRows === 0) {
            return res.status(400).send({ message: "ไม่สามารถอัปเดตรหัสผ่านได้", status: false });
        }

        res.send({ message: "รีเซ็ตรหัสผ่านเรียบร้อยแล้ว", status: true });
    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน", status: false });
    }
});


// แสดงข้อมูลผู้ใช้ทั้งหมด
app.get('/api/user', function(req, res){        
    const sql = "SELECT username, imageFile, preferences FROM user";
    db.query(sql, function(err, result) {
        if (err) throw err;
        
        if(result.length > 0){
            res.send(result);
        }else{
            res.send( {'message':'ไม่พบข้อมูลผู้ใช้','status':false} );
        }        
    });
});

// แสดงรูปภาพของผู้ใช้
app.get('/api/user/image/:filename', function(req, res){
    const filepath = path.join(__dirname, 'assets/user', req.params.filename);  // แก้จาก 'uploads' เป็น 'assets/user'
    res.sendFile(filepath);
});






// เรียกดูข้อมูลผู้ใช้
app.get('/api/user/:id', async function (req, res) {
    const { id } = req.params;
    const sql = `
    SELECT 
        u.username, u.email, u.firstname, u.lastname, u.nickname, 
        g.Gender_Name AS gender, ig.interestGenderName AS interestGender, u.height, u.home, u.DateBirth, 
        u.imageFile,
        e.EducationName AS education,
        go.goalName AS goal,
        COALESCE(GROUP_CONCAT(DISTINCT p.PreferenceNames), 'ไม่มีความชอบ') AS preferences
    FROM user u
    LEFT JOIN gender g ON u.GenderID = g.GenderID
    LEFT JOIN interestgender ig ON u.InterestGenderID = ig.interestGenderID
    LEFT JOIN education e ON u.educationID = e.educationID
    LEFT JOIN goal go ON u.goalID = go.goalID
    LEFT JOIN userpreferences up ON u.UserID = up.UserID
    LEFT JOIN preferences p ON up.PreferenceID = p.PreferenceID
    WHERE u.UserID = ?
    GROUP BY u.UserID
    `;

    try {
        const [result] = await db.promise().query(sql, [id]);
        if (result.length > 0) {
            if (result[0].imageFile) {
                result[0].imageFile = `${req.protocol}://${req.get('host')}/uploads/${result[0].imageFile}`;
            }
            res.send(result[0]);
        } else {
            res.status(404).send({ message: "ไม่พบข้อมูลผู้ใช้", status: false });
        }
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้", status: false });
    }
});





// update ข้อมูลผู้ใช้
app.post('/api/user/update/:id', async function(req, res) {
    const { id } = req.params;
    let { username, email, firstname, lastname, nickname, gender, interestGender, height, home, DateBirth, education, goal, preferences } = req.body;

    try {
        // Fetch current user data
        const [userResult] = await db.promise().query("SELECT * FROM User WHERE UserId = ?", [id]);
        if (userResult.length === 0) {
            return res.status(404).send({ message: "ไม่พบผู้ใช้ที่ต้องการอัปเดต", status: false });
        }

        const currentUser = userResult[0];

        // ตรวจสอบว่า username ไม่ใช่ค่าว่าง
        if (!username || username.trim() === "") {
            return res.status(400).send({ message: "ชื่อผู้ใช้ไม่สามารถว่างได้", status: false });
        }

        // Use current data if no new data is provided
        email = email || currentUser.email;
        firstname = firstname || currentUser.firstname;
        lastname = lastname || currentUser.lastname;
        nickname = nickname || currentUser.nickname;
        height = height || currentUser.height;
        home = home || currentUser.home;

        // Handle DateBirth: ถ้าไม่มีการส่งมา ใช้ค่าปัจจุบันในฐานข้อมูล
        if (DateBirth && DateBirth !== '') {
            DateBirth = new Date(DateBirth).toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
        } else {
            DateBirth = currentUser.DateBirth; // Keep old DateBirth if not updated
        }

        // Translate gender name to ID
        let genderID = currentUser.GenderID;
        if (gender && gender !== '') {
            const [genderResult] = await db.promise().query("SELECT GenderID FROM gender WHERE Gender_Name = ?", [gender]);
            if (genderResult.length === 0) {
                return res.status(404).send({ message: "ไม่พบเพศที่ระบุ", status: false });
            }
            genderID = genderResult[0].GenderID;
        }

        // Translate interestGender name to ID
        let interestGenderID = currentUser.InterestGenderID;
        if (interestGender && interestGender !== '') {
            const [interestGenderResult] = await db.promise().query("SELECT interestGenderID FROM interestgender WHERE interestGenderName = ?", [interestGender]);
            if (interestGenderResult.length === 0) {
                return res.status(404).send({ message: "ไม่พบเพศที่สนใจที่ระบุ", status: false });
            }
            interestGenderID = interestGenderResult[0].interestGenderID;
        }

        // Translate education name to ID
        let educationID = currentUser.educationID;
        if (education && education !== '') {
            const [educationResult] = await db.promise().query("SELECT EducationID FROM education WHERE EducationName = ?", [education]);
            if (educationResult.length === 0) {
                return res.status(404).send({ message: "ไม่พบการศึกษาที่ระบุ", status: false });
            }
            educationID = educationResult[0].EducationID;
        }

        // Translate goal name to ID
        let goalID = currentUser.goalID;
        if (goal && goal !== '') {
            const [goalResult] = await db.promise().query("SELECT goalID FROM goal WHERE goalName = ?", [goal]);
            if (goalResult.length === 0) {
                return res.status(404).send({ message: "ไม่พบเป้าหมายที่ระบุ", status: false });
            }
            goalID = goalResult[0].goalID;
        }

        // Update the User table with all the fields
        const updateUserSql = `
            UPDATE User 
            SET username = ?, email = ?, firstname = ?, lastname = ?, nickname = ?, GenderID = ?, InterestGenderID = ?, height = ?, home = ?, DateBirth = ?, educationID = ?, goalID = ?
            WHERE UserId = ?
        `;
        await db.promise().query(updateUserSql, [username, email, firstname, lastname, nickname, genderID, interestGenderID, height, home, DateBirth, educationID, goalID, id]);

        // Update preferences in userpreferences table
        if (preferences && Array.isArray(preferences)) {
            // ลบ preference เก่าทั้งหมดของผู้ใช้
            await db.promise().query("DELETE FROM userpreferences WHERE UserID = ?", [id]);

            // เพิ่ม preference ใหม่
            for (const preference of preferences) {
                const [preferenceResult] = await db.promise().query("SELECT PreferenceID FROM preferences WHERE PreferenceNames = ?", [preference]);
                if (preferenceResult.length > 0) {
                    await db.promise().query("INSERT INTO userpreferences (UserID, PreferenceID) VALUES (?, ?)", [id, preferenceResult[0].PreferenceID]);
                }
            }
        }

        res.send({ message: "ข้อมูลถูกอัปเดตเรียบร้อย", status: true });
    } catch (err) {
        console.error('Database update error:', err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้", status: false });
    }
});


// API สำหรับอัปเดต preferences ของผู้ใช้
app.post('/api/user/update_preferences/:id', async function (req, res) {
    const { id } = req.params; // รับ userID จากพารามิเตอร์
    const { preferences } = req.body; // รับข้อมูล preferences เป็น comma-separated string

    try {
        // ตรวจสอบว่ามีการส่งข้อมูล preferences มาหรือไม่
        if (!preferences || preferences.trim() === "") {
            return res.status(400).send({ message: "Preferences ไม่สามารถว่างได้", status: false });
        }

        // ลบ preferences เก่าของผู้ใช้ในฐานข้อมูล
        await db.promise().query("DELETE FROM userpreferences WHERE UserID = ?", [id]);

        // แปลง comma-separated string เป็น array
        const preferencesArray = preferences.split(",");

        // เพิ่ม preferences ใหม่ในฐานข้อมูล
        for (const preferenceID of preferencesArray) {
            const preferenceIDNumber = parseInt(preferenceID.trim()); // แปลงเป็น integer
            if (isNaN(preferenceIDNumber)) {
                return res.status(400).send({ message: "Preference ID ไม่ถูกต้อง", status: false });
            }

            // ตรวจสอบว่า PreferenceID มีอยู่ในตาราง preferences หรือไม่
            const [preferenceExists] = await db.promise().query("SELECT PreferenceID FROM preferences WHERE PreferenceID = ?", [preferenceIDNumber]);
            if (preferenceExists.length === 0) {
                return res.status(404).send({ message: `ไม่พบ PreferenceID: ${preferenceIDNumber}`, status: false });
            }

            // เพิ่มข้อมูลในตาราง userpreferences
            await db.promise().query("INSERT INTO userpreferences (UserID, PreferenceID) VALUES (?, ?)", [id, preferenceIDNumber]);
        }

        res.send({ message: "Preferences ถูกอัปเดตเรียบร้อย", status: true });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการอัปเดต preferences", status: false });
    }
});




app.put('/api/user/update/:id', upload.single('image'), async function (req, res) {
    const { id } = req.params;
    let { username, email, firstname, lastname, nickname, gender, interestGender, height, home, DateBirth, education, goal, preferences } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        // ตรวจสอบว่า username ไม่เป็นค่าว่าง
        if (!username || username.trim() === "") {
            return res.status(400).send({ message: "Username ไม่สามารถเว้นว่างได้", status: false });
        }

        // Fetch current user data
        const [userResult] = await db.promise().query("SELECT * FROM User WHERE UserId = ?", [id]);
        if (userResult.length === 0) {
            return res.status(404).send({ message: "ไม่พบผู้ใช้ที่ต้องการอัปเดต", status: false });
        }

        const currentUser = userResult[0];

        // Translate GenderID, EducationID, GoalID, InterestGenderID
        let genderID = currentUser.GenderID;
        if (gender) {
            const [genderResult] = await db.promise().query("SELECT GenderID FROM gender WHERE Gender_Name = ?", [gender]);
            if (genderResult.length > 0) {
                genderID = genderResult[0].GenderID;
            }
        }

        let interestGenderID = currentUser.InterestGenderID;
        if (interestGender) {
            const [interestGenderResult] = await db.promise().query("SELECT interestGenderID FROM interestgender WHERE interestGenderName = ?", [interestGender]);
            if (interestGenderResult.length > 0) {
                interestGenderID = interestGenderResult[0].interestGenderID;
            }
        }

        let educationID = currentUser.educationID;
        if (education) {
            const [educationResult] = await db.promise().query("SELECT EducationID FROM education WHERE EducationName = ?", [education]);
            if (educationResult.length > 0) {
                educationID = educationResult[0].EducationID;
            }
        }

        let goalID = currentUser.goalID;
        if (goal) {
            const [goalResult] = await db.promise().query("SELECT goalID FROM goal WHERE goalName = ?", [goal]);
            if (goalResult.length > 0) {
                goalID = goalResult[0].goalID;
            }
        }

        // อัปเดต preferences หลายรายการ
        if (preferences && Array.isArray(preferences)) {
            // ลบ preference เก่าทั้งหมดของผู้ใช้
            await db.promise().query("DELETE FROM userpreferences WHERE UserID = ?", [id]);

            // เพิ่ม preference ใหม่
            for (const preference of preferences) {
                const [preferenceResult] = await db.promise().query("SELECT PreferenceID FROM preferences WHERE PreferenceNames = ?", [preference]);
                if (preferenceResult.length > 0) {
                    await db.promise().query("INSERT INTO userpreferences (UserID, PreferenceID) VALUES (?, ?)", [id, preferenceResult[0].PreferenceID]);
                }
            }
        }

        // Handle image update
        let currentImageFile = image;
        if (!currentImageFile) {
            // ถ้าไม่มีภาพใหม่และผู้ใช้ไม่มีภาพเก่าอยู่ในระบบ ให้ currentImageFile เป็นค่าว่าง
            currentImageFile = currentUser.imageFile || '';
        } else {
            // ถ้ามีการอัปโหลดภาพใหม่ ให้ทำการตั้งชื่อไฟล์ใหม่และอัปเดต
            const ext = path.extname(req.file.originalname);
            const newFileName = `${uuidv4()}${ext}`;
            fs.renameSync(req.file.path, path.join('uploads', newFileName));
            currentImageFile = newFileName;

            // ลบภาพเก่าถ้ามีอยู่
            if (currentUser.imageFile && currentUser.imageFile !== '') {
                const oldImagePath = path.join(__dirname, 'uploads', currentUser.imageFile);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        // อัปเดตข้อมูลผู้ใช้ รวมถึง InterestGenderID, PreferenceID และรูปภาพ
        const sqlUpdate = `
            UPDATE User 
            SET username = ?, email = ?, firstname = ?, lastname = ?, nickname = ?, imageFile = ?, GenderID = ?, InterestGenderID = ?, height = ?, home = ?, DateBirth = ?, educationID = ?, goalID = ?
            WHERE UserId = ?`;
        await db.promise().query(sqlUpdate, [username, email, firstname, lastname, nickname, currentImageFile, genderID, interestGenderID, height, home, DateBirth, educationID, goalID, id]);

        const imageUrl = currentImageFile ? `${req.protocol}://${req.get('host')}/uploads/${currentImageFile}` : null;

        res.send({
            message: "ข้อมูลผู้ใช้อัปเดตสำเร็จ",
            status: true,
            image: imageUrl
        });
    } catch (err) {
        console.error('Database update error:', err);
        res.status(500).send({ message: "การอัปเดตข้อมูลผู้ใช้ล้มเหลว", status: false });
    }
});




// API สำหรับการลบผู้ใช้
app.delete('/api/user/:id', async function (req, res) {
    const { id } = req.params;

    const sqlGetUserImage = "SELECT imageFile FROM User WHERE UserId = ?";
    const sqlDeleteUser = "DELETE FROM User WHERE UserId = ?";

    try {
        // ดึงชื่อไฟล์รูปภาพของผู้ใช้
        const [imageResult] = await db.promise().query(sqlGetUserImage, [id]);

        if (imageResult.length > 0) {
            const imageFile = imageResult[0].imageFile;

            // ลบข้อมูลผู้ใช้ในตาราง User
            const [deleteResult] = await db.promise().query(sqlDeleteUser, [id]);

            if (deleteResult.affectedRows > 0) {
                // ลบไฟล์รูปภาพจากโฟลเดอร์ uploads
                if (imageFile) {
                    const filePath = path.join(__dirname, 'uploads', imageFile);
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Error deleting image file:', err);
                        } else {
                            console.log('Image file deleted:', filePath);
                        }
                    });
                }

                res.send({ message: "ลบข้อมูลผู้ใช้สำเร็จ", status: true });
            } else {
                res.status(404).send({ message: "ไม่พบผู้ใช้ที่ต้องการลบ", status: false });
            }
        } else {
            res.status(404).send({ message: "ไม่พบผู้ใช้ที่ต้องการลบ", status: false });
        }
    } catch (err) {
        console.error('Database delete error:', err);
        res.status(500).send({ message: "เกิดข้อผิดพลาดในการลบข้อมูลผู้ใช้", status: false });
    }
});









// Function to execute a query with a promise-based approach
function query(sql, params) {
    return new Promise(function (resolve, reject) {
        db.query(sql, params, function (err, results) {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Create or join a chat room
app.post('/chat/join', async function (req, res) {
    const { userID, chatRoomName } = req.body;

    // Check if the chat room exists, if not create it
    let sql = 'SELECT chat_room_id FROM chat_rooms WHERE chat_room_name = ?';
    let results = await query(sql, [chatRoomName]);

    let chatRoomID;
    if (results.length === 0) {
        sql = 'INSERT INTO chat_rooms (chat_room_name) VALUES (?)';
        const insertResult = await query(sql, [chatRoomName]);
        chatRoomID = insertResult.insertId;
    } else {
        chatRoomID = results[0].chat_room_id;
    }

    res.send({ 'message': 'User joined chat room', 'status': true, chatRoomID });
});

// Post a message in a chat room
app.post('/chat/post', async function (req, res) {
    const { chatRoomID, senderID, message } = req.body;

    // Insert the message into the database
    let sql = 'INSERT INTO messages (chat_room_id, sender_id, message) VALUES (?, ?, ?)';
    await query(sql, [chatRoomID, senderID, message]);

    res.send({ 'message': 'Message posted successfully', 'status': true });
});

// Show messages from a chat room
app.get('/chat/show/:chatRoomID', async function (req, res) {
    const chatRoomID = req.params.chatRoomID;

    let sql = `SELECT m.message, u.username AS sender, 
                    CASE
                      WHEN CAST(CURRENT_TIMESTAMP AS DATE) = SUBSTRING(m.sent_at,1,10) THEN CONCAT(DATE_FORMAT(m.sent_at, "%H:%i"), " น.")
                      ELSE DATE_FORMAT(m.sent_at, "%d/%m")
                    END AS sent_at
                FROM messages m
                JOIN user u ON m.sender_id = u.UserID
                WHERE m.chat_room_id = ?
                ORDER BY m.sent_at ASC`;

    const result = await query(sql, [chatRoomID]);
    res.send(result);
});


// Show messages from a chat room
app.get('/chat/show/:chatRoomID', async function (req, res) {
    const chatRoomID = req.params.chatRoomID;
    
    let sql = `SELECT m.message, u.username AS sender, 
                    CASE
                      WHEN CAST(CURRENT_TIMESTAMP AS DATE) = SUBSTRING(m.sent_at,1,10) THEN CONCAT(DATE_FORMAT(m.sent_at, "%H:%i"), " น.")
                      ELSE DATE_FORMAT(m.sent_at, "%d/%m")
                    END AS sent_at
                FROM messages m
                JOIN user u ON m.sender_id = u.UserID
                WHERE m.chat_room_id = ?
                ORDER BY m.sent_at ASC`;
    
    const result = await query(sql, [chatRoomID]);
    res.send(result);
});




app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server listening on port ${process.env.SERVER_PORT}`);
});
