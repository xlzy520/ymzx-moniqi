#!/usr/bin/expect

spawn scp dist/wj-admin.js root@60.204.250.130:/www/wwwroot
expect "*password:"
send "NDEgkewqDA4v7bx\r"

interact

spawn ssh root@60.204.250.130
expect "*password:"
send "NDEgkewqDA4v7bx\r"
expect "*#"
send "ls -l\r"
send "pm2 restart /www/wwwroot/wj-admin.js\r"
interact

