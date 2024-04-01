#!/usr/bin/expect
spawn ssh root@154.12.36.215
expect "*password:"
send "3nV6RRw4hH\r"
expect "*#"
interact

