const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { pool } = require('./services/db'); // Assuming you have the 'pool' object defined correctly

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

// Add route code Here
app.get('/', (req, res) => {
  res.send('Welcome to Our SCHOOL API');
});

app.get('/student', (req, res) => {
  pool.connect((err, client, done) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    
    const query = 'SELECT * FROM students';
    client.query(query, (error, result) => {
      done();
      if (error) {
        return res.status(400).json({ error });
      }
      if (result.rows.length < 1) {
        return res.status(404).send({
          status: 'Failed',
          message: 'No student information found',
        });
      } else {
        return res.status(200).send({
          status: 'Successful',
          message: 'Students information retrieved',
          students: result.rows,
        });
      }
    });
  });
});

app.post('/student', (req, res) => {
  const data = {
    name: req.body.studentName,
    age: req.body.studentAge,
    classroom: req.body.studentClass,
    parents: req.body.parentContact,
    admission: req.body.admissionDate,
  };

  pool.connect((err, client, done) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    
    const query =
      'INSERT INTO students(student_name, student_age, student_class, parent_contact, admission_date) VALUES($1, $2, $3, $4, $5) RETURNING *';
    const values = [
      data.name,
      data.age,
      data.classroom,
      data.parents,
      data.admission,
    ];

    client.query(query, values, (error, result) => {
      done();
      if (error) {
        return res.status(400).json({ error });
      }
      return res.status(202).send({
        status: 'Successful',
        result: result.rows[0],
      });
    });
  });
});

app.get('/student/:id', (req, res) => {
    const id = req.params.id;
  
    pool.connect((err, client, done) => {
      if (err) {
        return res.status(500).json({ error: err });
      }
  
      const query = 'SELECT * FROM students WHERE id = $1';
      const values = [id];
  
      client.query(query, values, (error, result) => {
        done();
  
        if (error) {
          return res.status(400).json({ error });
        }
  
        if (result.rows.length < 1) {
          return res.status(404).send({
            status: 'Failed',
            message: `No student information found for ID ${id}`,
          });
        } else {
          return res.status(200).send({
            status: 'Successful',
            message: `Student ${id} profile retrieved`,
            student: result.rows[0],
          });
        }
      });
    });
  });
  



app.listen(port, () => {
  console.log(`We are live at 127.0.0.1:${port}`);
});
