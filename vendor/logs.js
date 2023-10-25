import fs from 'fs-extra'
import path from 'path'

import request from 'request'
import urlencode from 'urlencode'
var appDir = path.dirname(import.meta.url);
appDir = appDir.split('///')
appDir = appDir[1]
let test =false
if (!test) {
  appDir = "//"+appDir
}


function curdate(minute){
    minute = (minute < 10) ? '0' + minute : minute;
    return minute;
  }

export function mlog (par) {
    let datecreate = new Date();
    let texta = `\n ${curdate(datecreate.getHours())}:${curdate(datecreate.getMinutes())}:${curdate(datecreate.getSeconds())}`;
    let obj = arguments;
  
    for (const key in obj) {
      if (typeof obj[key]=='object') {
        for (const keys in obj[key]){
          texta = `${texta} \n ${keys}:${obj[key][keys]}`
        }
      } else {
        texta = `${texta} ${obj[key]}`
      }
      
    } 
    fs.writeFileSync(path.join(appDir,'logs',`${curdate(datecreate.getDate())}.${curdate(datecreate.getMonth()+1)} log.txt`),
    texta,
    {
      encoding: "utf8",
      flag: "a+",
      mode: 0o666
    });
  
    console.log(texta);
    return texta
  }
export function say(msg,all=false) {
  var numb = ['79176334420']
  var tgnum = [304622290]
  if (all===true){
    numb.forEach(element => {
      setTimeout(() => send(element,msg), 1500);
    });
    tgnum.forEach(element => {
      setTimeout(() => sendtg(element,msg), 1500);
    });
  } else{
    setTimeout(() => sendtg(tgnum[0],msg), 1500);
  }
  
}

function sendtg(num,msg) {

    console.log(1);

 /* rp(`http://localhost:3334/?msg=${urlencode(msg)}&num=${urlencode(num)}`)
  .then(function (body) {
      console.log('Отправка сообщения - пришло:', body); // Print the HTML for the Google homepage.
      return body
  })
  .catch(function (err) {
    //console.dir(err);
  });*/
}


