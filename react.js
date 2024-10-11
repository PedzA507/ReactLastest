const express = require('express')
const mysql = require('mysql2')
const app = express()
const port = 4000

const https = require('https');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'UX23Y24%@&2aMb';

const fileupload = require('express-fileupload');
const path = require('path');
const crypto = require('crypto');

// Load SSL certificates
const privateKey = fs.readFileSync('privatekey.pem', 'utf8');
const certificate = fs.readFileSync('certificate.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Import CORS library
const cors = require('cors');

//Database(MySql) configuration
const db = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "1234",
        database: "finlove"
    }
)
db.connect()

//Middleware (Body parser)
app.use(express.json())
app.use(express.urlencoded ({extended: true}))
app.use(cors());
app.use(fileupload());

//Hello World API
app.get('/', function(req, res){
    res.send('Hello World!')
});


/*############## USER ##############*/
// Register
app.post('/api/register', 
    function(req, res) {  
        const { username, password, firstName, lastName } = req.body;
        
        // check existing username
        let sql="SELECT * FROM user WHERE username=?";
        db.query(sql, [username], async function(err, results) {
            if (err) throw err;
            
            if(results.length == 0) {
                // encrypt password and salt using bcrypt
                const salt = await bcrypt.genSalt(10);
                const password_hash = await bcrypt.hash(password, salt);        
                                
                // insert user data into the database
                sql = 'INSERT INTO user (username, password, firstName, lastName) VALUES (?, ?, ?, ?)';
                db.query(sql, [username, password_hash, firstName, lastName], (err, result) => {
                    if (err) throw err;
                
                    res.send({'message':'ลงทะเบียนสำเร็จแล้ว','status':true});
                });      
            }else{
                res.send({'message':'ชื่อผู้ใช้ซ้ำ','status':false});
            }

        });      
    }
);

// LOGIN API for employees only
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    let sql = "SELECT * FROM employee WHERE username=? AND isActive=1";
    let result;

    try {
        // Check if employee exists
        result = await query(sql, [username]);

        if (result.length === 0) {
            return res.status(401).send({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', status: false });
        }

        let employee = result[0];

        // Check login attempts
        if (employee.loginAttempt >= 3) {
            return res.status(403).send({ message: 'บัญชีคุณถูกล็อกเนื่องจากมีการพยายามเข้าสู่ระบบเกินกำหนด', status: false });
        }

        // Check password
        if (bcrypt.compareSync(password, employee.password)) {
            // Reset login attempts after successful login
            sql = "UPDATE employee SET loginAttempt=0, lastAttemptTime=NULL WHERE empID=?";
            await query(sql, [employee.empID]);

            // Generate JWT token
            const token = jwt.sign({
                userID: employee.empID,
                username: employee.username,
                role: employee.positionID === 1 ? 'admin' : 'employee' // Admin role for positionID = 1
            }, SECRET_KEY, { expiresIn: '1h' });

            // Send response with token
            return res.send({
                token: token,
                message: 'เข้าสู่ระบบสำเร็จ',
                status: true,
                role: employee.positionID === 1 ? 'admin' : 'employee'
            });
        } else {
            // Increment login attempt
            sql = "UPDATE employee SET loginAttempt = loginAttempt + 1, lastAttemptTime = CURRENT_TIMESTAMP WHERE empID=?";
            await query(sql, [employee.empID]);

            return res.status(401).send({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', status: false });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).send({ message: 'เกิดข้อผิดพลาดในระบบ', status: false });
    }
});

// LOGOUT API
app.post('/api/logout', (req, res) => {
    const token = req.headers["authorization"] ? req.headers["authorization"].replace("Bearer ", "") : null;

    if (!token) {
        return res.status(400).send({ message: 'Token not provided', status: false });
    }

    try {
        // Verify token
        jwt.verify(token, SECRET_KEY);

        // Here you can implement token blacklist logic or session invalidation if necessary.
        return res.send({ message: 'ออกจากระบบสำเร็จ', status: true });
    } catch (error) {
        return res.status(401).send({ message: 'Invalid token', status: false });
    }
});


//Function to execute a query with a promise-based approach
function query(sql, params) {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
}

//List users
app.get('/api/user', function(req, res){             
    const token = req.headers["authorization"] ? req.headers["authorization"].replace("Bearer ", "") : null;

    if (!token) {
        return res.send({'message': 'ไม่ได้ส่ง token มา', 'status': false});
    }
        
    try {
        let decode = jwt.verify(token, SECRET_KEY);
        console.log("Decoded token:", decode); // Decoded token looks fine
        
        if (decode.positionID != 1 && decode.positionID != 2) {
            return res.send({'message':'คุณไม่มีสิทธิ์ในการเข้าถึง', 'status': false});
        }
        
        let sql = "SELECT * FROM user"; 
        db.query(sql, function(err, result) {
            if (err) {
                console.error("Database error:", err);
                return res.send({'message': 'Database error', 'status': false});
            }
            console.log("Query result:", result); // Check if data is returned from the query
            res.send(result);
        });      

    } catch(error) {
        console.error("Token validation failed:", error);
        res.send({'message':'token ไม่ถูกต้อง', 'status': false});
    }
});



// Show a user Profile
app.get('/api/profile/:id', async function(req, res) {
    const userID = req.params.id;
    const token = req.headers["authorization"] ? req.headers["authorization"].replace("Bearer ", "") : null;

    if (!token) {
        return res.send({'message': 'ไม่ได้ส่ง token มา', 'status': false});
    }

    try {
        let decode = jwt.verify(token, SECRET_KEY);
        console.log("Decoded token:", decode);
        
        if (userID != decode.userID && decode.positionID != 1 && decode.positionID != 2) {
            return res.send({'message':'คุณไม่มีสิทธิ์ในการเข้าถึง', 'status': false});
        }

        // Fetch user data including home (address), phonenumber, and username
        let sql = "SELECT username, firstname, lastname, email, GenderID, home, phonenumber, imageFile FROM user WHERE userID = ? AND isActive = 1"; // เพิ่ม username
        let user = await query(sql, [userID]);

        console.log("Query result:", user);

        if (user.length > 0) {
            user = user[0];
            user['message'] = 'success';
            user['status'] = true;
            res.send(user);
        } else {
            res.send({'message':'ไม่พบผู้ใช้งาน', 'status': false});
        }

    } catch(error) {
        res.send({'message':'token ไม่ถูกต้อง', 'status': false});
    }
});




//Show a user image
app.get('/api/user/image/:filename', function(req, res) {        
    const filepath = path.join(__dirname, 'assets/user', req.params.filename);  
    console.log("File path:", filepath); // แสดงพาธของไฟล์รูปภาพ
    
    res.sendFile(filepath);
});


// Update a user
app.put('/api/user/:id', async function(req, res) {
    const token = req.headers["authorization"].replace("Bearer ", "");
    const userID = req.params.id; 

    try {
        let decode = jwt.verify(token, SECRET_KEY);               
        if (userID != decode.userID && decode.positionID != 1 && decode.positionID != 2) {
            return res.send({'message':'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน', 'status': false});
        }
        
        // Handle image file update if provided
        let fileName = "";
        if (req?.files?.imageFile) {        
            const imageFile = req.files.imageFile;
            fileName = imageFile.name.split(".");
            fileName = fileName[0] + Date.now() + '.' + fileName[1]; 
        
            const imagePath = path.join(__dirname, 'assets/user', fileName);
            fs.writeFile(imagePath, imageFile.data, (err) => {
                if(err) throw err;
            });
        }

        // Destructure data from the request body
        const { password, username, firstname, lastname, email, home, phonenumber } = req.body;

        // Build SQL query
        let sql = 'UPDATE user SET username = ?, firstname = ?, lastname = ?, email = ?, home = ?, phonenumber = ?';
        let params = [username, firstname, lastname, email, home, phonenumber];

        // If password is provided, hash and update it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            sql += ', password = ?';
            params.push(password_hash);
        }

        // If a new image was uploaded, update the image file
        if (fileName != "") {    
            sql += ', imageFile = ?';
            params.push(fileName);
        }

        // Finalize the query with the userID
        sql += ' WHERE userID = ?';
        params.push(userID);

        // Execute the query
        db.query(sql, params, (err, result) => {
            if (err) throw err;
            res.send({ 'message': 'แก้ไขข้อมูลลูกค้าเรียบร้อยแล้ว', 'status': true });
        });
        
    } catch(error) {
        res.send({'message':'โทเคนไม่ถูกต้อง', 'status': false});
    }
});



    
//Delete a user
app.delete('/api/user/:id', async function(req, res) {
    const userID = req.params.id;
    const token = req.headers["authorization"].replace("Bearer ", "");
        
    try {
        let decode = jwt.verify(token, SECRET_KEY);               
        if (userID != decode.userID && decode.positionID != 1 && decode.positionID != 2) {
            return res.send({'message':'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน', 'status': false});
        }
        
        const sql = `DELETE FROM user WHERE userID = ?`; // change to `userID`
        db.query(sql, [userID], (err, result) => {
            if (err) throw err;
            res.send({'message':'ลบข้อมูลลูกค้าเรียบร้อยแล้ว', 'status': true});
        });

    } catch(error) {
        res.send({'message':'โทเคนไม่ถูกต้อง', 'status': false});
    }
});




//List employees
app.get('/api/employee',
    function(req, res){             
        const token = req.headers["authorization"].replace("Bearer ", "");
            
        try{
            let decode = jwt.verify(token, SECRET_KEY);               
            if(decode.positionID != 1) {
              return res.send( {'message':'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน','status':false} );
            }
            
            let sql = "SELECT * FROM employee";            
            db.query(sql, function (err, result){
                if (err) throw err;            
                res.send(result);
            });      

        }catch(error){
            res.send( {'message':'โทเคนไม่ถูกต้อง','status':false} );
        }
        
    }
);

//Show an employee detail
app.get('/api/employee/:id',
    async function(req, res){
        const empID = req.params.id;        
        const token = req.headers["authorization"].replace("Bearer ", "");
            
        try{
            let decode = jwt.verify(token, SECRET_KEY);               
            if(empID != decode.empID && decode.positionID != 1) {
              return res.send( {'message':'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน','status':false} );
            }
            
            let sql = "SELECT * FROM employee WHERE empID = ? AND isActive = 1";        
            let employee = await query(sql, [empID]);        
            
            employee = employee[0];
            employee['message'] = 'success';
            employee['status'] = true;
            res.send(employee); 

        }catch(error){
            res.send( {'message':'โทเคนไม่ถูกต้อง','status':false} );
        }
        
    }
);

//Show an employee image
app.get('/api/employee/image/:filename', 
    function(req, res) {
        const filepath = path.join(__dirname, 'assets/employee', req.params.filename);  
        res.sendFile(filepath);
    }
);

//Generate a password
function generateRandomPassword(length) {
    return crypto
        .randomBytes(length)
        .toString('base64')
        .slice(0, length)
        .replace(/\+/g, 'A')  // Replace '+' to avoid special chars if needed
        .replace(/\//g, 'B'); // Replace '/' to avoid special chars if needed
}


//Add an employee
app.post('/api/employee', 
    async function(req, res){
  
        //receive a token
        const token = req.headers["authorization"].replace("Bearer ", "");        
    
        try{
            //validate the token    
            let decode = jwt.verify(token, SECRET_KEY);               
            if(decode.positionID != 1) {
                return res.send( {'message':'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน','status':false} );
            }            

            //receive data from users
            const {username, firstName, lastName, email, gender } = req.body;

            //check existing username
            let sql="SELECT * FROM employee WHERE username=?";
            db.query(sql, [username], async function(err, results) {
                if (err) throw err;
                
                if(results.length == 0) {
                    //password and salt are encrypted by hash function (bcrypt)
                    const password = generateRandomPassword(8);
                    const salt = await bcrypt.genSalt(10); //generate salte
                    const password_hash = await bcrypt.hash(password, salt);    
                    
                    //save data into database                
                    let sql = `INSERT INTO employee(
                            username, password, firstName, lastName, email, gender
                            )VALUES(?, ?, ?, ?, ?, ?)`;   
                    let params = [username, password_hash, firstName, lastName, email, gender];
                
                    db.query(sql, params, (err, result) => {
                        if (err) throw err;
                        res.send({ 'message': 'เพิ่มข้อมูลพนักงานเรียบร้อยแล้ว', 'status': true });
                    });                    

                }else{
                    res.send({'message':'ชื่อผู้ใช้ซ้ำ','status':false});
                }
            });                        
            
        }catch(error){
            res.send( {'message':'โทเคนไม่ถูกต้อง','status':false} );
        }    
    }
);
    
//Update an employee
app.put('/api/employee/:id', 
    async function(req, res){
  
        //receive a token
        const token = req.headers["authorization"].replace("Bearer ", "");
        const empID = req.params.id;
    
        try{
            //validate the token    
            let decode = jwt.verify(token, SECRET_KEY);               
            if(empID != decode.empID && decode.positionID != 1) {
                return res.send( {'message':'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน','status':false} );
            }
        
            //save file into folder  
            let fileName = "";
            if (req?.files?.imageFile){        
                const imageFile = req.files.imageFile; // image file    
                
                fileName = imageFile.name.split(".");// file name
                fileName = fileName[0] + Date.now() + '.' + fileName[1]; 
        
                const imagePath = path.join(__dirname, 'assets/employee', fileName); //image path
        
                fs.writeFile(imagePath, imageFile.data, (err) => {
                if(err) throw err;
                });
                
            }
            
            //save data into database
            const {password, username, firstName, lastName, email, gender } = req.body;
        
            let sql = 'UPDATE employee SET username = ?,firstName = ?, lastName = ?, email = ?, gender = ?';
            let params = [username, firstName, lastName, email, gender];
        
            if (password) {
                const salt = await bcrypt.genSalt(10);
                const password_hash = await bcrypt.hash(password, salt);   
                sql += ', password = ?';
                params.push(password_hash);
            }
        
            if (fileName != "") {    
                sql += ', imageFile = ?';
                params.push(fileName);
            }
        
            sql += ' WHERE empID = ?';
            params.push(empID);
        
            db.query(sql, params, (err, result) => {
                if (err) throw err;
                res.send({ 'message': 'แก้ไขข้อมูลพนักงานเรียบร้อยแล้ว', 'status': true });
            });
            
        }catch(error){
            res.send( {'message':'โทเคนไม่ถูกต้อง','status':false} );
        }    
    }
);
    
//Delete an employee
app.delete('/api/employee/:id',
    async function(req, res){
        const empID = req.params.id;        
        const token = req.headers["authorization"].replace("Bearer ", "");
            
        try{
            let decode = jwt.verify(token, SECRET_KEY);               
            if(decode.positionID != 1) {
                return res.send( {'message':'คุณไม่ได้รับสิทธิ์ในการเข้าใช้งาน','status':false} );
            }
            
            const sql = `DELETE FROM employee WHERE empID = ?`;
            db.query(sql, [empID], (err, result) => {
                if (err) throw err;
                res.send({'message':'ลบข้อมูลพนักงานเรียบร้อยแล้ว','status':true});
            });

        }catch(error){
            res.send( {'message':'โทเคนไม่ถูกต้อง','status':false} );
        }
        
    }
);

/*############## WEB SERVER ##############*/  
// Create an HTTPS server
const httpsServer = https.createServer(credentials, app);
app.listen(port, () => {
    console.log(`HTTPS Server running on port ${port}`);
});