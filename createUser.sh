#!/bin/bash
echo "creating user...."

#adding a new user with home directory
if sudo useradd -p $2 -m $1
then echo "user created...."
else echo "error: creating user"
fi
#making the ftp directory under /home/newuser
if sudo mkdir /home/$1/ftp
then 
    if sudo chown nobody:nogroup /home/$1/ftp
    then 
	if sudo chmod a-w /home/$1/ftp
	    then echo "successful in creating the ftp directory"
	fi
    fi
else echo "error: making ftp directory"
fi

#making directory to store the uploaded files
if sudo mkdir /home/$1/ftp/files
    then 
	if sudo chown $1:$1 /home/$1/ftp/files
	    then echo "successful in creating uploading directory"
	fi
else echo "error: making files directory"
fi 
