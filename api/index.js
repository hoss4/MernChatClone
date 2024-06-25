const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bcryptSalt = bcrypt.genSaltSync(10);
const ws = require('ws');
dotenv.config();

mongoose.connect(process.env.MONGO_URL);
const app = express();
app.use(express.json());
app.use(cookieParser());

const jwtSecret = process.env.JWT_SECRET;

app.get('/test', (req, res) => {
    res.json('test ok');
})

app.use(cors(
    {
        credentials: true,
        origin: [process.env.CLIENT_URL, process.env.CLIENT_URL2, process.env.CLIENT_URL3]
    }
));

app.get('/profile', (req, res) => {

    const token = req.cookies?.token;

    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, UserData) => {
            if (err) throw err;
            res.json(UserData);
        });
    }
    else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (user) {
            const isPasswordCorrect = await bcrypt.compareSync(password, user.password);
            if (isPasswordCorrect) {
                jwt.sign({ id: user._id, username }, jwtSecret, { expiresIn: '4h' }, ((err, token) => {

                    if (err) throw err;
                    res.cookie('token', token).status(201).json({
                        id: user._id,

                    });

                }));
            }
        } else {
            res.status(400).json({ message: 'User not found' });
        }


    } catch (err) {
        res.status(500).json(err);
    }
});

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, bcryptSalt);

        const user = await User.create({
            username: username,
            password: hashedPassword,
        });

        jwt.sign({ id: user._id, username }, jwtSecret, { expiresIn: '4h' }, ((err, token) => {

            if (err) throw err;
            res.cookie('token', token).status(201).json({
                id: user._id,

            });

        }));
    } catch (err) {
        res.status(500).json(err.message);
    }
}
);
const server = app.listen(4000);

const wss = new ws.WebSocketServer({ server })

wss.on('connection', (connection, req) => {
    const cookies = req.headers.cookie
    if (cookies) {
        const tokenCookieString = cookies.split(';').find(str => str.includes('token='));

        if (tokenCookieString) {
            const token = tokenCookieString.split('=')[1];

            if (token) {
                jwt.verify(token, jwtSecret, {}, (err, userData) => {


                    if (err) throw err;
                    const { id, username } = userData;
                    
                    connection.userid = id;
                    connection.username = username;

                })
            }
        }
    }
    [...wss.clients].forEach(client => {
         
        client.send(JSON.stringify({online : [...wss.clients].map(client => ({userId:client.userid,username:client.username}))}))
    });
});