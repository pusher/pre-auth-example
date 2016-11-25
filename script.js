Pusher.logToConsole = true;

var supportedAuthorizers = Pusher.Runtime.getAuthorizers();

// add our own custom authorizer that uses pre retrieved auth data
supportedAuthorizers.preAuthenticated = function (context, socketId, callback) {
  var authData = this.authOptions.preAuth[this.channel.name];
  if (!authData) {
    callback(true, "You need to pre-authenticate" + this.channel.name);
  } else {
    callback(false, this.authOptions.preAuth[this.channel.name]);
  }
};

// replace the default getAuthorizers with our extended version
Pusher.Runtime.getAuthorizers = function () {
  return supportedAuthorizers;
};

var pusher = new Pusher("REDACTED", {
  auth: {
    preAuth: {}
  },
  // set the transport to use our custom authorizer
  authTransport: "preAuthenticated",
  encrypted: true,
});

// retrieve the auth info for the given channel from our server
pusher.preAuthenticate = function (channelName) {
  var request = new XMLHttpRequest();
  request.open("POST", "http://127.0.0.1:5000/pusher/auth", true);
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200) {
      // set the auth info in the preAuth object of the auth options
      pusher.config.auth.preAuth[channelName] =
        JSON.parse(request.responseText);
    }
  };
  request.send(
    "socket_id=" + pusher.connection.socket_id +
    "&channel_name=" + channelName
  );
};

// example usage:
// pusher.preAuthenticate("private-ch");
// ...some other stuff happens...
// pusher.subscribe("private-ch");
