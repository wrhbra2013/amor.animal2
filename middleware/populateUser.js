// middleware/populateUser.js (ou similar)
function populateUserFromSession(req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user; // Torna user acessível em req.user
    res.locals.user = req.session.user; // Torna user acessível diretamente nos templates
  } else {
    req.user = null;
    res.locals.user = null;
  }
  next();
}
module.exports = { populateUserFromSession };
