var appDir = path.dirname(import.meta.url);
appDir = appDir.split('///')
appDir = appDir[1]
console.log(appDir);

import {mlog,say} from './vendor/logs.js'
process.on('uncaughtException', (err) => {
mlog('Глобальный косяк приложения!!! ', err.stack);
}); 

let test = true
//let platurl = "api-dev" 
//platurl = "api" 

import request from 'request'

 
import express from 'express'
import exphbs from 'express-handlebars'
import fileUpload from 'express-fileupload'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import path from 'path'
import fs from 'fs-extra'
import https from 'https'
import urlencode from 'urlencode';


const app = express();
const hbs = exphbs.create({
defaultLayout: 'main',
extname: 'hbs',
helpers: {
    OK: function(){
    i_count = 1
    },
    I_C: function (opts){
    let anso = ''
    for (let i = 0; i < i_count; i++) {
        anso = anso + "I"
    }
    i_count++
    return anso
    },
    PLS: function (a,opts){

        return a+10
        },
    if_eq: function (a, b, opts) {
        if (a == b){ // Or === depending on your needs
            // logman.log(opts);
            return opts.fn(this);
        } else
            return opts.inverse(this);
    },
    if_more: function (a, b, opts) {
    if (a >= b){ // Or === depending on your needs
        // logman.log(opts);
        return opts.fn(this);
        } else
        return opts.inverse(this);
    },
    for: function(from, to, incr, block) {
        var accum = '';
        for(var i = from; i < to; i += incr)
            accum += block.fn(i);
        return accum;
    }
}
});

const TEMPFOLDER = path.join(appDir,'public/temp');

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views','views');

if (test){
    app.use(express.static(path.join(appDir, 'public')));
    app.set('views','views');
} else {
    app.use(express.static(path.join('//',appDir, 'public')));
    app.set('views',path.join('//',appDir, 'views'));
}

console.log(path.join(appDir, 'public'));
app.use(cookieParser());
//app.use(fileUpload());
app.use(session({resave:false,saveUninitialized:false, secret: 'keyboard cat', cookie: {  }}))
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : TEMPFOLDER,
    defCharset: 'utf8',
    defParamCharset: 'utf8'
}));

app.use(async function (req, res, next) {
    let page = req._parsedOriginalUrl.pathname;
    /*
    if (page=='/data' || page=='/kabstart' || page=='/upload' || page=='/addmat' || page=='/stream' ) {
        next();
        return 1
    }
    if (req.session.access==undefined) {
        if (page!='/auth') {
            res.redirect("/auth")
        } else next();
    } else {
        if (page=='/auth') {
            res.redirect("/")
        } else next();
    }*/

    next();
    mlog(page,req.session.username,getcurip(req.socket.remoteAddress),req.query)
    
})

app.get('/',async (req,res)=>{
    res.render('index',{
        title: 'Грамотей',
        auth: 1
    });
})  

app.get('/auth',async (req,res)=>{
    console.log(req.query);
    if (req.query.pass!=undefined) {
        let body = {username:req.query.login,password:req.query.pass}
        //body = {username:"teacher1",password:"password2"}
        let y = request({
            url: `https://${platurl}.platonics.ru/teacher/login`,
            headers: {
                'Content-Type': 'application/json'
              },
            method: "POST",
            json: true,  
            body: body
        },function (error, response, body) {
            if (body.detail!='Invalid credentials'){
                console.log(body);
                mlog(body.access);
                req.session.user_id = body.user_id
                req.session.username = body.username
                req.session.refresh = body.refresh
                req.session.access = body.access
                req.session.is_staff = body.is_staff
                res.send('ok')
            } else {
                res.send('nok')
            }

        });
    } else
    res.render('auth',{
        title: 'Авторизация',
        auth: 1
    });
})  

app.get('/kabstart',async (req,res)=>{
    console.log(req.query);

    kabs[req.query.kab] = {kab:req.query.kab,online:req.query.online,host:req.query.host,stat:JSON.parse(req.query.stat)}
    mlog(`Кабинет №${req.query.kab} - онлайн!\nЗапись:${kabs[req.query.kab].stat[0].outputActive} Стрим:${kabs[req.query.kab].stat[1].outputActive}`)

    res.send(JSON.stringify(req.query))
})  

app.get('/kabs',async (req,res)=>{
    res.send(JSON.stringify(kabs))
})  
app.get('/kabsurl',async (req,res)=>{
    platurl=req.query.url
    console.log(kabs);
    for (let k = 0; k < kabs.length; k++) {
        if (kabs[k]!=null) {
            console.dir(kabs[k]);
            request({
                url: `http://${kabs[k].host}:777/dev?url=`+req.query.url,
                headers: {
                    'Content-Type': 'application/json',
                  },
                method: "GET",
                json: true,  
            }, function (error, response, body){
                console.log(error);
               // res.send(body)
                console.log(body);
            });
        }
    }   
    res.send('ok')
})  

app.get('/getless',async (req,res)=>{
    console.log(req.query);
    request({
        url: `https://${platurl}.platonics.ru/teacher/courses/`+req.query.id,
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${req.session.access}`
          },
        method: "GET",
        json: true,  
    }, function (error, response, body){
        //console.log(response);
        res.send(body)
        console.log(body);
    });
   
    
})  

app.get('/getgroup',async (req,res)=>{
    console.log(req.query);
    request({
        url: `https://${platurl}.platonics.ru/teacher/assignment/courses/`+req.query.id,
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${req.session.access}`
          },
        method: "GET",
        json: true,  
    }, function (error, response, body){
        res.send(body)
        console.log(body);
    });
   
    
})  

app.get('/sendcmd',async (req,res)=>{
    console.log(req.query);
    let urls = `http://${req.query.host}:777?cmd=${req.query.cmd}&less=${req.query.less}&course=${req.query.course}&access=${urlencode(req.session.access)}&mat=${req.query.mat}&gr=${urlencode(req.query.gr)}`
    mlog(urls)

    if (req.query.cmd=="streamstart") {
        let body = {course_id:req.query.course,group_id:req.query.gr,stream_url:`https://api-dev.platonics.ru/streams/obs1/kab${req.query.kab}/playlist.m3u`,start_date:getdate()}
        console.log(body);
        request({
            url: `https://${platurl}.platonics.ru/teacher/streams/`,
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${req.session.access}`
              },
            method: "POST",
            json: true,  
            body: body
        },function (error, response, body) {
            mlog(body);
            console.log(response.toJSON());
            let stream_id = body.stream_id
           //let stream_id = 1
            let urls = `http://${req.query.host}:777?cmd=${req.query.cmd}&streamid=${stream_id}&access=${urlencode(req.session.access)}&mat=${req.query.mat}&gr=${urlencode(req.query.gr)}`
            request({
                url: urls,
                method: "GET",
            }, function (error, response, body){
                console.log(error);
                res.send(body)
                console.log(body);
            });
        })
    } else {
        request({
            url: urls,
            method: "GET",
        }, function (error, response, body){
            console.log(error);
            res.send(body)
            console.log(body);
        });
    }

})

app.get('/addmat',async (req,res)=>{
    console.log(req.query);
    console.log(req.query.vkhash);
    await send_url(req.query.url,req.query.access,req.query.vkhash,req.query.less)
    res.send('ok')
})

app.get('/stream',async (req,res)=>{
    request({
        url: 'http://platon.teyhd.ru:1935/obs1/house/playlist.m3u',
        method: "GET",

    }, function (error, response, bodys){
       //console.log(error);
       res.send(bodys)
        //console.log(response);
       mlog(bodys)
        //console.dir(bodys);
    })
    //
    
})
app.post('/kabstart',async (req,res)=>{
    console.log(req.query);
    console.log(req.body);
    res.send(JSON.stringify(req.query))
})  

app.post('/upload',async (req,res)=>{
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('Тут нет файла');
    }
    let video = req.files.video_file
    if (test) {
        video.mv('./public/video/'+video.name)
    } else {
        video.mv( path.join('//',appDir, 'public/video',video.name))
    }
    
    console.dir(req.files);
    res.send(video.name)
})  


//console.log(await authp(5,4));

async function authp(username,password){
    let body = {username:username,password:password}
   // body = {username:"teacher1",password:"password2"}
    let y = request.get({
        url: `https://${platurl}.platonics.ru/teacher/login`,
        headers: {
            'Content-Type': 'application/json'
          },
        method: "POST",
        json: true,  
        body: body
    });
    return y;
}

function getcurip(str) {
    let arr = str.split(':');
    arr = arr[arr.length-1];
    return arr;
}

async function start(){
    try {
        if (test){
            app.listen(707,()=> {
                mlog('Сервер - запущен')
                mlog('Порт:',707);
            })
        } else{
            var options = {
               // key: fs.readFileSync('/etc/letsencrypt/live/platon.teyhd.ru/privkey.pem'),
                //cert: fs.readFileSync('/etc/letsencrypt/live/platon.teyhd.ru/fullchain.pem')
              };
           /// https.createServer(options, app).listen(443);
        }

        mlog('Сервер - запущен')
    } catch (e) {
        mlog(e);
    }
}

//send_url()

async function send_url(url,access,vkhas,less){
    var hrth = `Запись урока`
    var name = ``
    var cont = `<h1>Запись урока </h1><video src="https://platon.teyhd.ru:707/video/${url}" controls></video>`
    name = `VK`
    cont = `<h1>Запись урока </h1> <iframe src="${url}" width="853" height="480" allow="autoplay; encrypted-media; fullscreen; picture-in-picture;" frameborder="0" allowfullscreen></iframe>`

    request({
        url: `https://${platurl}.platonics.ru/teacher/steps`,
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${access}`
          },
        method: "POST",
        json: true,  
        body: {
            "title": "Запись урока"+name,
            "lesson_id": less,
            "type": "html",
            "previous_step_id": 0,
            "order_number": 0
        }
    }, function (error, response, body){
        //console.log(response);
        console.log(body);
        request({
            url: `https://${platurl}.platonics.ru/teacher/htmls`,
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${access}`
              },
            method: "POST",
            json: true,  
            body: {
                "title": "Запись урока "+name,
                "step_id": body.id,
                "content": cont
            }
        }, function (error, response, body){
            console.log(error);
            console.log(body);
            
        });

    });
}

start();
/*
let bodys ={}
bodys.access = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzAzOTQyOTAxLCJpYXQiOjE2OTUzMDI5MDEsImp0aSI6IjU3YmE3OTlhZDYxNzQyOGY4ODlkMTFmZjRmNzAzMTE0IiwidXNlcl9pZCI6NH0.IWYCy0FGkhRoxMhDffLZZd7mu_qcdF9tEGZymc_Ha10`

let body = {course_id:205001926792,group_id:1,stream_url:(`http://platon.teyhd.ru:1935/obs1/house/playlist.m3u8`),start_date:"2023-10-06"}
console.log(body);
request({
    url: `https://${platurl}.platonics.ru/teacher/streams/`,
    headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${bodys.access}`
      },
    method: "POST",
    json: true,  
    body: body
},function (error, response, body) {
    console.log(response.toJSON());
    console.log(response.statusCode);
  //  mlog(body);
})
*/
/*
let body = {end_date:"2023-10-06"}
console.log(body);
request({
    url: `https://${platurl}.platonics.ru/teacher/streams/652908522524`,
    headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${bodys.access}`
      },
    method: "POST",
    json: true,  
    body: body
},function (error, response, body) {
   // console.log(response.toJSON());
    console.log(response.statusCode);
    mlog(body);
})
*/

function getdate() {
    let d = new Date()
    return `${d.getFullYear()}-${curdate(d.getMonth()+ 1)}-${curdate(d.getDate())}`
}

function curdate(num) {
    return num<10 ? '0'+num : num
}


//448397830121
//973497765181

//172.24.0.151  172.24.0.51
/*
http://platon.teyhd.ru:1935/obs1/kab9/playlist.m3u
http://platon.teyhd.ru:1935/obs1/kab12/playlist.m3u
http://platon.teyhd.ru:1935/obs1/kab14/playlist.m3u
http://platon.teyhd.ru:1935/obs1/kab15/playlist.m3u
http://platon.teyhd.ru:1935/obs1/kab16/playlist.m3u
http://platon.teyhd.ru:1935/obs1/kab18/playlist.m3u
http://platon.teyhd.ru:1935/obs1/kab21/playlist.m3u
http://platon.teyhd.ru:1935/obs1/kab/playlist.m3u
*/