const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const { Pool } = require('pg');

dotenv.config();
app.use(cors({
    origin: 'http://localhost:3040'
}));
app.use(express.json());

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL
});

//TEST 
app.get(`/`, (req, res) => {
    res.status(200).json({'Hello':'World'});
});
app.get(`/test`, (req, res) => {
    res.status(200).json({message: 'Successful Test'});
});

//GET all 
app.get('/api/family', (req, res) => {
    pool.query(`SELECT * FROM family`, (err, result) => {
        if (err) {
            res.status(500).json({Error: 'Internal Server Error'});
        } else {
            res.status(200).json(result.rows);
        }
    });
});

//CREATE  
app.post('/api/family', (req, res) => {
    const {name, birthday, age} = req.body
    if (!name || !birthday || !age) {
        res.status(400).json({Error: 'Missing Fields'});
    } else {
        pool.query(`INSERT INTO family (name, birthday, age) VALUES ($1, $2, $3) RETURNING *`, [name, birthday, age])
        .then(result => {
            res.status(201).json(result.rows);
        })
    }
})


//READ by Id
app.get('/api/family/:id', (req, res) => {
    const id = req.params.id;
    pool.query(`SELECT * FROM family WHERE id=$1`, [id])
    .then((result) => {
        if (result.rows.length === 0) {
            res.status(400).json({Error: 'Member Not Found'})
        } else {
            res.status(200).json(result.rows[0])
        }
    })
})

//UPDATE - PUT
app.put('/api/family/:id', (req, res) => {
    const id = req.params.id;
    const { name, birthday, age } = req.body;
    if (!name || !birthday || !age ) {
        res.status(400).json({Error: 'Missing Fields'})
    } else {
        pool.query(`UPDATE family SET name=$1, birthday=$2, age=$3 WHERE id=$4 RETURNING *`, [name, birthday, age, id])
            .then((result) => {
                if (result.rowCount === 0) {
                    res.status(404).json({Error: 'Member Not Found'})
                } else {
                    res.json(result.rows);
                }
            });
        }
    })

//UPDATE - PATCH
app.patch('/api/family/:id', (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const query = 'UPDATE family SET name = COALESCE($1, name), birthday = COALESCE($2, birthday), age = COALESCE($3, age) WHERE id = $4 RETURNING *';
    const values = [data.name || null, data.birthday || null, data.age || null, id];

    pool.query(query, values)
        .then((result) => {
            if (result.rows.length === 0) {
                res.status(404).json({Error: 'Member Not Found'})
            } else {
                res.json(result.rows[0])
            }
        })
        .catch(error => {
            res.status(500).json({ Error: 'Database Error' });
        })
    })


//DELETE 
app.delete('/api/family/:id', (req, res) => {
    const id = req.params.id;
    pool.query(`DELETE FROM family WHERE id=$1 RETURNING *;`, [id])
    .then((result) => {
        if (result.rows.length === 0) {
            res.status(404).json({Error: 'Member Not Found'})
        } else {
            res.json({Message: 'Delete successful'})
        }
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Listening to port: ${PORT}`);
})