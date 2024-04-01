#! /bin/bash
npm run build
if [ $? -eq 0 ]; then
   echo "打包成功，开始连接ssh"
   expect ./scp.sh
else
   echo "打包失败"
fi


