// /home/wander/amor.animal2/middleware/auth.js
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
        next();
    } else {
        res.render('./logar')   
    };

};

module.exports = {
    isAdmin
}