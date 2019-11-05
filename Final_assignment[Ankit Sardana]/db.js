const mysql = require('mysql')

const connection = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'finalassignment'
    }
)

function getAllBands(email) {
    return new Promise(function (resolve, reject) {
        connection.query(`SELECT * from band b where b.email='${email}'`,// b where b.name=${name}`,
            function (err, rows, cols) {
                if (err) {
                    reject(err)
                }
                else
                    resolve(rows)
            })
    })
}
function checkCredentials(email, password) {
    return new Promise(function (resolve, reject) {
        connection.query(`select * from user u where u.email='${email}' and u.password='${password}' `,
            function (err, rows, cols) {
                if (err) {
                    reject(err)
                }
                else
                    resolve(rows)
            })
    })
}


function addNewBand(bandName, email, bandDescription) {
    return new Promise(function (resolve, reject) {
        connection.query(`INSERT INTO band(bandName,description,email) values(?,?,?)`,
            [bandName, bandDescription, email],
            function (err, result) {
                if (err)
                    reject(err)
                else
                    resolve()
            })
    })
}
function createCredentials(name, email, dob, pass) {
    return new Promise(function (resolve, reject) {
        connection.query(`INSERT INTO user(email,name,password,dob) values(?,?,?,?)`,
            [email, name, pass, dob],
            function (err, result) {
                if (err)
                    reject(err)
                else
                    resolve()
            })
    })
}
function removeBand(bandId) {
    return new Promise(function (resolve, reject) {
        connection.query(`delete from band where id=?`,
            [bandId],
            function (err, result) {
                if (err)
                    reject(err)
                else
                    resolve()
            })
    })
}
function updateBand(bandId, bandName, description) {
    return new Promise(function (resolve, reject) {
        connection.query(`UPDATE band SET bandName=?,description=? where id=?`,
            [bandName, description, bandId],
            function (err, result) {
                if (err)
                    reject(err)
                else
                    resolve()
            })
    })
}
function resetPassword(email, password) {
    return new Promise(function (resolve, reject) {
        connection.query(`update user u SET u.password='${password}' where u.email='${email}'`,
            function (err, rows, cols) {
                if (err)
                    reject(err)
                else
                    resolve(rows)
            })
    })
}

exports = module.exports = {
    getAllBands,
    addNewBand,
    checkCredentials,
    removeBand,
    updateBand,
    createCredentials,
    resetPassword

}
