'use strict';

module.exports = function(EndUser) {
  // send verification email after registration
  // DISABLED FOR NOW UNTIL EMAIL IS SET UP.
  // EndUser.afterRemote('create', function(context, userInstance, next) {
  //   console.log('> user.afterRemote triggered');

  //   var options = {
  //     type: 'email',
  //     to: userInstance.email,
  //     from: 'noreply@loopback.com',
  //     subject: 'Thanks for registering.',
  //     template: path.resolve(__dirname, '../../server/views/verify.ejs'),
  //     redirect: '/verified',
  //     user: user
  //   };

  //   userInstance.verify(options, function(err, response, next) {
  //     if (err) return next(err);

  //     console.log('> verification email sent:', response);

  //     context.res.render('response', {
  //       title: 'Signed up successfully',
  //       content: 'Please check your email and click on the verification link ' -
  //           'before logging in.',
  //       redirectTo: '/',
  //       redirectToLinkText: 'Log in'
  //     });
  //   });
  // });

  EndUser.createNewUser = async function(email, password, clientId) {
      // NEED CODE HERE
      // check for existing user
      // create user
  };

  EndUser.remoteMethod('createNewUser', {
    http: { path: '/createNewUser', verb: 'post' },
    accepts: [
      { arg: 'email', type: 'string', required: true },
      { arg: 'password', type: 'string', required: true },
      { arg: 'clientId', type: 'string', required: true }
    ],
    returns: { type: 'string', root: true }
  });
};
