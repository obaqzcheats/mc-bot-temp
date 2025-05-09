


// this contains mongo db connection, or a json database PLEASE ONLY USE ONE

const mongo = require('mongoose')

const config = require('../config.json')
const { log } = require('../functions/util')

mongo.connect(config.dburi, {  }).then(() => log('info', 'connected to database'))

const userschema = new mongo.Schema({
    id: String,
    coins: Number,
    xbox: Object,
    playfab: String,
    linked: Boolean
})

const user = mongo.model("user", userschema);
mongo.set("strictQuery", true);

const createuser = async (id) => {
    const test = await user.findOne({ id: id })
    if (test) return { error: 'user already exists' } // this could be changed and better but i rushed this bit smh

    const dbuser = new user({ id: id, coins: 0, xbox: {}, playfab: '', linked: false })
    await dbuser.save()
    return dbuser
}



/*
        JSON way i wouldnt do it this way as you need loads of storage
                just change the stuff inside of interaction event
*/

/* 
const fs = require('fs');
const path = require('path');
const filepath = path.join(__dirname, '../data/database/users.json');

const read = () => {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch {
    return {};
  }
};

const write = (data) => fs.writeFileSync(filepath, JSON.stringify(data));

const searchuser = (id) => read()[id] || null;

const savedata = (id, newdata) => {
  const users = read();
  users[id] = { ...(users[id] || {}), ...newdata };
  write(users);
};

const remove = (id) => {
  const users = read();
  if (users[id]) {
    delete users[id];
    write(users);
  }
};

const resetuser = (id) => {
  const users = read();
  if (users[id]) {
    users[id] = { blacklisted: users[id].blacklisted };
    write(users);
  }
};

const reset = () => write({});

module.exports = { searchuser, savedata, remove, resetuser, reset };
 */


module.exports = { user, createuser }