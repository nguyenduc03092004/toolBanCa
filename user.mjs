import fs from 'fs';
import datas from './readUsers.mjs';
let users = []
for (let i = 0; i < datas.length; i++) {
    users.push({
        id: i + 1,
        userName: datas[i].replace(',', '').trim(),
        passWord: '123456hg'
    })
}
console.log(users)
export default users