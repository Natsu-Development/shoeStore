const Account = require('../app/models/account.model');

module.exports = {
    hasExistAccountName: (req, res, next) => {
        Account.find({
            $and: [
                {accountName: req.body.accountName},
                {permission: '2'}
            ]
        }).then((accounts) => {
            if(accounts) {
                const backUrl = req.header('Referer') || '/';
                req.session.registerErr = 'This accountName is existing. Please choose a other accountName';
                return res.redirect(backUrl+ '?warning');
            }
            next();
        }).catch(err => console.log(err));
    }
}