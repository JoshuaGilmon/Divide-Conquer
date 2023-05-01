const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const app = express()
const port = 3000

app.use(cors())

app.use(bodyParser.json());


const mysql = require('mysql');
const bcrypt = require('bcrypt');
var randomstring = require("randomstring");
var nodemailer = require('nodemailer');
var SpeakEasy = require('speakeasy');
const shell = require('shelljs')
var QRCode = require('qrcode');
const { json, urlencoded } = require('body-parser');

const connection = mysql.createConnection({
  host: "localhost",
    user: "",
    password: "",
    database: "regdata",
});

const newconnection = mysql.createConnection({
  host: "localhost",
    user: "",
    password: "",
    database: "registrationData",
});

connection.connect();

  // Here, `results` is an array of rows returned by the query
  // You can pass this data to the web browser in a JSON file

// Route to handle form submission

// define a route for the POST method

app.post('/update_team', (req, res) => {

  const formData = req.body; // Assuming you're using a middleware like body-parser to parse the request body

  // Loop through the form data and insert it into the MySQL table
  formData.forEach((data) => {

    const sql = `UPDATE Student SET StudentLName ='${data.field2}', StudentFName ='${data.field3}', StudentID = '${data.field}'  Where StudentPK='${data.field1}'`;

    newconnection.query(sql, (err, result) => {
      if (err) throw err;
      console.log(`Inserted ${result.affectedRows} row(s)`);
    });
  });

  res.send('Form data inserted into MySQL table');

});

app.post('/update_school/:id', (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  const DivisionID = req.body.DivisionID;
  const MealTicket = req.body.MealTicket;
  const SponsorName = req.body.SponsorName;
  const SponsorEmail = req.body.SponsorEmail;
  const SponsorPhone = req.body.SponsorPhone

  // update the user in the MySQL database
  const sql = `UPDATE School SET MealTicket = '${MealTicket}', SchoolName = '${name}', Division_FK = '${DivisionID}', SponsorName = '${SponsorName}', SponsorEmail = '${SponsorEmail}', SponsorNumber = '${SponsorPhone}' WHERE SchoolPK = '${id}'`;
  newconnection.query(sql,(err, result) => {
    if (err) throw err;
    console.log('User updated');
    res.send('User updated');
  });
});

app.post('/add_team/:id', (req, res) => {
  const id = req.params.id;

  const sql2 = `SELECT 
  CASE
  WHEN count(TeamID) is null then 1
  ELSE count(TeamID) + 1
  END as "teamid",
	Division_FK as "division"
FROM 
	Team
WHERE 
	Division_FK = (SELECT Division_FK FROM School WHERE SchoolPK = '${id}')
GROUP BY Division_FK`;
  newconnection.query(sql2,(err, result) => {
    if (err) throw err;
    console.log('User updated');

    try{
      value = parseInt(result[0].teamid)
    }
    catch{
      value = 0 + 1
    }

    const sql2 = `SELECT Division_FK FROM School WHERE SchoolPK = '${id}'`;
  newconnection.query(sql2,(err, result1) => {
    if (err) throw err;
    
  const sql = `Insert Team Set TeamID = ${value}, School_FK = '${id}', Division_FK = '${result1[0].Division_FK}'`;
  newconnection.query(sql,(err, result) => {
    if (err) throw err;
    console.log('User updated');
    res.send('User updated');
  });
});
});
});

app.post('/add_student', (req, res) => {
  const { school, team} = req.body;

  const sql2 = `SELECT 
      Division_FK as "division"
    FROM 
      School
    WHERE 
      SchoolPK = '${school}'
	`;
  const Schoolinfo1 = newconnection.query(sql2,(err, result1) => {
    if (err) throw err;
    console.log('User updated');
  const div1 = result1[0].division
  

  const sql1 = `SELECT 
	CASE 
        WHEN count(StudentID) is null then 1
        ELSE  count(StudentID) + 1
      END as "studentid"
    FROM 
      Student
    WHERE 
      Team_FK = '${team}'
      and
      School_FK = '${school}'
	`;
  const Schoolinfo = newconnection.query(sql1,(err, result1) => {
    if (err) throw err;
    console.log('User updated');
  const studID = result1[0].studentid

  if(studID <= 8){
  
  const sql = `Insert Student Set Team_FK = '${team}', StudentID = '${studID}', StudentFName ='First Name', StudentLName ='Last Name', Division_FK = '${div1}', School_FK = '${school}'`;
  newconnection.query(sql,(err, result) => {
    if (err) throw err;
    console.log('User updated');
    res.send('User updated');
  });

}
else{
  res.send('overeight');
}
});
})
})


app.post('/delete_student', (req, res) => {
  const { studentPK} = req.body;
  
  const sql = `DELETE FROM Student Where StudentPK ='${studentPK}'`;
  newconnection.query(sql,(err, result) => {
    if (err) throw err;
    console.log('Team Deleted');
    res.send('Team Deleted');
  });
}); 

app.post('/delete_team', (req, res) => {
  const { school, team} = req.body;
  
  const sql = `DELETE FROM Team Where School_FK= '${school}' AND TeamPK = '${team}'`;
  newconnection.query(sql,(err, result) => {
    if (err) throw err;
    console.log('Team Deleted');
    res.send('Team Deleted');
  });
  // const sql1 = `DELETE FROM Team Where School_FK= '${school}' AND Team = '${team}'`;
  // newconnection.query(sql,(err, result) => {
  //   if (err) throw err;
  // });
}); 

app.post('/top-scores', (req, res) => {
  const id = req.body.ID;
              const sql = `SELECT Admin FROM UserAuth WHERE UserID = '${id}'`;
              newconnection.query(sql,(err, result) => {
                if (err) throw err;
                if(result[0].Admin == 1){
                  shell.exec('sh /var/www/html/filesSql/Scripts/TopTotalScore.sh')
                  res.send("Success");
                }
                else{

                  res.send("Failure");
                }
      });
    });

app.post('/reset-database', (req, res) => {
  const id = req.body.ID;
              const sql = `SELECT Admin FROM UserAuth WHERE UserID = '${id}'`;
              newconnection.query(sql,(err, result) => {
                if (err) throw err;
                if(result[0].Admin == 1){
                  shell.exec('sh /var/www/html/filesSql/Scripts/PermDel.sh')
                  res.send("Success");
                }
                else{

                  res.send("Failure");
                }
      });
    });

    
    app.post('/payment', (req, res) => {
      const id = req.body.ID;
      const paid = req.body.Pay;
                  const sql = `UPDATE School SET Payment = '${paid}' WHERE UserID = '${id}'`;
                  newconnection.query(sql,(err, result) => {
                    if (err) throw err;
                      res.send("Success");
                    
                  })
                
        });

app.post('/update_user', (req, res) => {
  const random = randomstring.generate(30);
  const randomConf = randomstring.generate(30);
  const email = req.body.Email;
  const password = req.body.Password;
  const password2 = req.body.Password2;
  //Check for already used email.
  const sql = `SELECT EMAIL as "emailData" FROM UserAuth WHERE EMAIL = '${email}'`;
          newconnection.query(sql,(err, result) => {
            try{
              console.log(result[0].emailData)
              res.send("same-email-error")
            }
            catch{
                if(password == password2){
                  if(password.length >= 8){
                  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
                  var mfa = SpeakEasy.generateSecret({
                    name: 'DIVDEANDCONQUER​'
                  })
                  bcrypt.genSalt(12, function(err, salt) {
                      bcrypt.hash(password, salt, function(err, hash) {
                          const hashed = hash
                          const sql = `INSERT UserAuth SET UserID = '${random}', Email = '${email}', Password = '${hashed}', Conf = '${randomConf}', Date = '${date}', Admin = '0', MFA = '${mfa.ascii}'`;
                          newconnection.query(sql,(err, result) => {
                            if (err) throw err;
                            console.log('User created');
                            const sql = `INSERT School SET Payment = '0', UserID = '${random}'`;
                            newconnection.query(sql,(err, result) => {
                            if (err) throw err;
                            console.log('School created');
                  });
                  QRCode.toDataURL(mfa.otpauth_url, function(err, data){
                    res.send(data);
                  })
                  });
                  });
                  });
                  //EMAIL
                  var transporter = nodemailer.createTransport({
                    service: 'outlook',
                    auth: {
                      user: 'gswdivideandconquer@outlook.com',
                      pass: ''
                    }
                  });
                  
                  const url = `https://math.gswcm.net/verifyemail.html?ID=${randomConf}`
                  var mailOptions = {
                    from: 'gswdivideandconquer@outlook.com',
                    to: email,
                    subject: 'Confirm Email for Divide and Conquer',
                    text: 'Please follow this link to confirm your email: ' + url
                  };
                
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                }
                else{
                  res.send('password-less-than-min');
                }
                  }
                  else{
                    res.send('password-match-error');
                  }
              }
            })
 });
  

app.post('/verifyemail', (req, res) => {
  const id = req.body.ID;
              const sql = `UPDATE UserAuth SET Conf = NULL WHERE Conf = '${id}'`;
              newconnection.query(sql,(err, result) => {
                if (err) throw err;
                console.log('Email verified.');
                res.send("Success");
      });
    });

app.post('/login_user', (req, res) => {
  const email = req.body.Email;
  const passwordplain = req.body.Password;
  const token = req.body.Token;
          const sql = `SELECT USERID as "usid", PASSWORD as "hash", Conf as "emailConf", MFA as "mfa" FROM UserAuth WHERE EMAIL = '${email}'`;
          newconnection.query(sql,(err, result) => {
            try{
            const usid = (result[0].usid)
            const emailConf = (result[0].emailConf)
            const mfa = (result[0].mfa)
            if (emailConf != null){

              res.send('email-conf-error')
            }
            else{
            mfaVerifyValue = MFAVerify(token, mfa)
            console.log(mfaVerifyValue)
            if (mfaVerifyValue == true){
            bcrypt.compare(passwordplain, result[0].hash, function(err, result) { 
              if (result) {
                res.send(usid);
                }
                else { 
                  res.send('Failure');
                } });
              }
            else{
              res.send('mfa-conf-error')
            }
              }
            }
            catch{
              res.send('Failure');
              return false;
            }
  });
});

app.post('/passwordreset', (req, res) => {
    const id = req.body.ID;
    const password = req.body.Password;
    const password2 = req.body.Password2;
    if(password == password2){
      if(password.length >= 8){
      bcrypt.genSalt(12, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                const hashed = hash
                const sql = `UPDATE UserAuth SET Password = '${hashed}', ResetRandom = NULL WHERE ResetRandom = '${id}'`; //URL id.
                newconnection.query(sql,(err, result) => {
                  if (err) throw err;
                  console.log('User pass updated');
                  res.send("Success");
        });
      });
    });
  }
  else{
    res.send('password-less-than-min');
  }
    }
    else{
      res.send('password-match-error');
    }
})

app.post('/forgot_user', (req, res) => {
  const email = req.body.Email;

  const sql = `SELECT EMAIL as "email", USERID as "usid" FROM UserAuth WHERE EMAIL = '${email}'`;
  newconnection.query(sql,(err, result) => {
    try{
    const usid = (result[0].usid)
    const emaildb = (result[0].email)
    res.send('Sent')

    const random = randomstring.generate(30);

    const sql2 = `UPDATE UserAuth SET ResetRandom = '${random}' WHERE USERID = '${usid}'`;
    newconnection.query(sql2,(err, result) => {console.log("Updated")});

    if(email == emaildb){
      var transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
          user: 'gswdivideandconquer@outlook.com',
          pass: ''
        }
      });
      
      const url = `https://math.gswcm.net/passwordreset.html?ID=${random}`
      var mailOptions = {
        from: 'gswdivideandconquer@outlook.com',
        to: emaildb,
        subject: 'Reset Password for Divide and Conquer',
        text: 'Please follow this link to reset your password: ' + url
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      }); }
    else{
      console.log("Unknown email")
    }
  }
  catch{
    console.log("Unknown email")
    res.send("Failure")
  }
});
});

app.get('/data_noas',(req, res) =>{
    // Query the database
    const myVariable = req.query.variable;
    const sql = `SELECT 
    SchoolName,
    Division_FK,
    SponsorName,
    SponsorNumber,
    SponsorEmail,
    CASE
      WHEN Payment = 1 THEN 'Paid'
      ELSE 'Not Paid'
    END,
    MealTicket
  FROM 
    School WHERE SchoolPK = '${myVariable}'`;

    console.log(myVariable)
  
    newconnection.query(sql, function(error, results, fields) {
      if (error) throw error;
  
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(results));
    });
  });


  app.get('/data',(req, res) =>{
    // Query the database
    const myVariable = req.query.variable;
    const sql = `SELECT 
    SchoolName as "School Name",
    Division_FK as "Division",
    SponsorName as "Sponsor Name",
    SponsorNumber as "Sponsor Number",
    SponsorEmail as "Sponsor Email",
    CASE
      WHEN Payment = 1 THEN 'Paid'
      ELSE 'Not Paid'
    END as "Payment",
    MealTicket as "Meal Tickets Requested"
  FROM 
    School WHERE SchoolPK = '${myVariable}'`;

    console.log(myVariable)
  
    newconnection.query(sql, function(error, results, fields) {
      if (error) throw error;
  
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(results));
    });
  });
  app.get('/get_school',(req, res) =>{
    // Query the database
    const myVariable = req.query.variable;
    console.log(myVariable)
    const sql = `SELECT *  FROM School WHERE UserID = '${myVariable}'`;
  
    newconnection.query(sql, function(error, results, fields) {
      if (error) throw error;
  
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(results));
    });
  });

  app.get('/team',(req, res) =>{
    // Query the database
    const myVariable = req.query.variable; 
    const team = req.query.team;
    const sql = `SELECT *  FROM Student WHERE School_FK = '${myVariable}' AND Team_FK ='${team}'`;
  
    newconnection.query(sql, function(error, results, fields) {
      if (error) throw error;
  
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(results));
    });
  });

  app.get('/team2',(req, res) =>{
    // Query the database
    const myVariable = req.query.variable; 
    const team = req.query.team;
    const sql = `SELECT Team_FK as "Team ID", StudentID as "Student ID", StudentFName as "Student First Name", StudentLName as "Student Last Name"  FROM Student WHERE School_FK = '${myVariable}' AND Team_FK ='${team}'`;
  
    newconnection.query(sql, function(error, results, fields) {
      if (error) throw error;
  
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(results));
    });
  });

  app.get('/team_data',(req, res) =>{
    // Query the database
    const myVariable = req.query.variable;
    const sql = `SELECT *  FROM Team WHERE School_FK = '${myVariable}'`;
  
    newconnection.query(sql, function(error, results, fields) {
      if (error) throw error;

      console.log(results)
  
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(results));
    });
  });

  app.get('/logindata',(req, res) =>{
    // Query the database
    const myVariable = req.query.variable;
    const sql = `SELECT Password FROM UserAuth WHERE email = '${myVariable}'`;

    console.log(myVariable)
  
    connection.query(sql, function(error, results, fields) {
      if (error) throw error;
  
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(results));
    });
  });

app.get('/data2', (req, res) => {
  // Get a connection from the connection pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server Error');
      return;
    }

    // Run the SQL query
    const sql = 'SELECT * FROM School';
    connection.query(sql, (err, results, fields) => {
      // Release the connection back to the pool
      connection.release();

      if (err) {
        console.error(err);
        res.status(500).send('Server Error');
        return;
      }

      // Convert the result to a string and return it
      const resultString = JSON.stringify(results);
      res.send(resultString);
    });
  });
});

function MFAVerify(token, mfa){
  return SpeakEasy.totp.verify({
    secret: `${mfa}`,
    encoding: 'ascii',
    token: `${token}`
  })
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../user_home.html'));
});

app.get('/datas', (req, res) => {
  const data = { foo: 'bar2' };
  res.json(data);
});

app.listen(port, () => {
  console.log(`Divide-Conquer is open on port ${port}`)
})