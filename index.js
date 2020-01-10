const express = require("express");
const mysql = require("mysql");
const { check, body, validationResult } = require("express-validator");
const escape = require("escape-html");
const con = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"node2020",
    port:"3301"
});
con.connect((err) => {
    err ? console.log(err.message) : console.log("Connected");
});

const app = express();
app.use(express.urlencoded({extended: false}))

app.get('/create', (req,res)=>{
    res.sendFile(__dirname+"/post.html");
});
app.post('/create', [
    body('title').escape(),
    body('content').escape()
], (req,res)=>{
    const { title, content } = req.body;
    
    const q = `INSERT INTO posts (title, content) VALUES (?, ?)`;

    con.query(q, [title, content], (err)=>{
        err ? res.send(err.message) : res.redirect("/");
    })
});

app.get('/', (req,res)=>{
    const q = "SELECT * FROM posts";
    con.query(q, (err, result)=>{
        err ? res.send(err.message) : res.send(require('./template.js')(makeHtml(result)));
    })
});
app.get('/delete/:id', check("id").isNumeric(), (req,res)=>{
    if (validationResult(req).errors.length>0) return res.redirect('/?error');
    const id = req.params.id;
    const q = 'DELETE FROM posts WHERE id='+id;
    con.query(q, (err)=>{
        err ? res.send(err.message) : res.redirect("/");
    })
});

function makeHtml(result){
    let html = result.map(data => {
        return `
            <h1>${data.title}</h1>
            <p>${data.content}</p>
            <a href="/delete/${data.id}">Ta bort </a>
            <hr>        
        `;
    });
    html = html.join('');
    return html;
}

app.listen(3678, ()=>console.log("Listening on 3678"));
