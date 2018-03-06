/**
 * Gets username string to be used as a suffix for resources at dev stages
 * @returns {string} username or undefined if username not found in aws and system environments
 */
var username = null;
module.exports.userNameSuffix = function () {
    if(username) {
        return username;
    }
    var userName = null;
    var cmd = "aws iam get-user --output text --query 'User.UserName'";
    try {
        var child_process = require('child_process');
        userName = child_process.execSync(cmd, { encoding: 'utf8' });
    }
    catch(err) {
        // on CodePipeline the aws-cli command fails with the message:
        //     An error occurred (ValidationError) when calling the GetUser operation:
        //     Must specify userName when calling with non-User credentials
        console.log("Warning. Error executing: <" + cmd + ">: " + err.message);
    }

    if (!userName) {
        //If not received username from aws command, get username from system environment
        userName = process.env['USER'];
    }

    //remove dot from the username trim white space
    //  and convert to lowercase (required for certain AWS resources)
    username = userName.replace(/\./g,'').trim().toLowerCase();
    if (username.length > 15) {
        // truncating username to avoid issue https://jira.bgchtest.info/browse/PT4-88
        // at the moment (06/01/2017) the max length for username we can accept is 16
        username = username.substring(0, 15);
    }
    return username;
};
