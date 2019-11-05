const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const session = require("express-session");
const db = require('./db')
const methodOverride = require('method-override');
const nodemailer = require('nodemailer')
app.set("view engine", "hbs");
app.use(methodOverride('_method'));
app.use('/public', express.static(__dirname + './views'))
var MySQLStore = require('express-mysql-session')(session);

var options = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'session_test'
};

var sessionStore = new MySQLStore(options);

app.use(session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const loggedInOnly = (failure = "/login") => (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect(failure);
  }
};

app.get('/forgotpassword', (req, res) => {
  res.render('forgotPassword')
})

app.delete('/delete', (req, res) => {
  let id = req.body.bandDelete;
  db.removeBand(id)
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => {
      res.send(err)
    })
})

app.delete('/delete/:id', (req, res) => {
  let id = req.params.id;
  db.removeBand(id)
    .then(() => {
      res.send("Successfully deleted")
    })
    .catch((err) => {
      res.send(err)
    })
})

app.get("/", loggedInOnly(), (req, res) => {
  db.getAllBands(req.session.user.email).then((bands) => {
    res.render("index", {
      name: req.session.user.username,

      bands

    })

  }).catch((err) => {
    res.send(err)
  })
})
app.post("/signup", (req, res) => {
  const { name, email, dob, pass, cPass } = req.body;
  if (pass === cPass) {
    db.createCredentials(name, email, dob, pass).then(() => {
      res.redirect('/')

    })
      .catch((err) => {
        res.send(err)
      });
  } else (res.send("Password didn't match"))
});
app.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("login");
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.checkCredentials(email, password).then((check) => {
    if (check.length > 0) {
      req.session.user = {
        username: check[0].name,
        email: check[0].email
      };
      res.redirect("/");
    }
    else {
      res.sendStatus(401);
    }
  });
});


app.post('/add', (req, res) => {
  let band = req.body.band;
  let bandDescription = req.body.bandDescription;
  let email = req.session.user.email;
  console.log(band);
  console.log(email);
  db.addNewBand(band, email, bandDescription)
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => {
      res.send(err)
    })
})
app.put('/update', (req, res) => {
  let bandId = req.body.bandUpdate;
  console.log(bandId);
  const { band, bandDescription } = req.body;
  console.log(band);
  console.log(bandDescription);
  db.updateBand(bandId, band, bandDescription)
    .then(() => {
      res.redirect("/")
    })
    .catch((err) => {
      console.log(err);
      res.send(err)
    })
})

function removeBand(el) {
  console.log(el.id);
  console.log("Welcome ,remove this band")
  db.removeBand(el.id)
    .then(() => {
      console.log("working")
    })
    .catch((err) => {
      res.send(err)
    })
}
app.post('/edit', function (req, res) {
  if (req.session.user) {
    res.render("edit", {
      id: req.body.bandEdit
    })
  }
  else {
    res.redirect('/');
  }
});

app.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});

app.post('/forgotpassword', (req, res) => {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'yourEmail@gmail.com',
      pass: 'yourEmailPassword'
    }
  });
  let no = Math.floor(1000 + Math.random() * 9000);
  req.session.no = no.toString();
  let email = req.body.email
  req.session.email = email
  var mailOptions = {
    from: 'yourEmail@gmail.com',
    to: req.body.email,
    subject: 'RESET PASSWORD',
    text: no.toString()
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  res.render('enterOtp')
})

app.get('/resetpassword', (req, res) => {
  res.render('login')
})

app.post('/resetpassword', function (req, res) {
  db.resetPassword(req.session.email, req.body.password)
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => {
      res.send(err)
    })
})

app.post('/otpset', (req, res) => {
  let no = (req.session.no).toString();
  if (no.localeCompare(req.body.otp) == 0)
    res.render('resetpassword')
  else
    res.render('login')
})



app.listen(8000, () => console.log("running at port 8000"));
