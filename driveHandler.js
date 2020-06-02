const fs = require('fs');
module.exports ={
    returnTreeStructure : function(foldername){
        fs.readdir(`/home/onbit-syn/data/${foldername}`,function(err,files){
            if(err) throw err;
            console.log(files);
            return files;
        })
    }
}