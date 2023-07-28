const jwt = require("jsonwebtoken")

function jwtEncode(data) {
    let encodedData = jwt.sign(data,"myKey");
    return encodedData;
}

function jwtDecode(token){
    let decodedData = jwt.decode(token);
    return decodedData;
}

function Main(){
    let task = process.argv[2]
    let dataKey = process.argv[4]
    let data = process.argv[6]
    if(task === '--encode'){
        if(!dataKey || dataKey === ('--data' || "-D")){
            console.log("Please run node token --encode  --data or -D [userId] for encoding to JWT")
            console.log("And run node token --decode  --data or -D [jwtToken] for decoding to user-data")
            process.exit()
        }
        else{
            let encodedData = jwtEncode({userId:data})
            console.log({jwtToken:encodedData})
            process.exit()
        }
    }
    else if(task === '--decode'){
        if(!dataKey || dataKey === ('--data' || "-D")){
            console.log("Please run node token --encode  --data or -D [userId] for encoding to JWT")
            console.log("And run node token --decode  --data or -D [tokent] for decoding to user-data")
            process.exit()
        }
        else{
            let decodedData = jwtDecode(data)
            console.log({decodedJWToken:decodedData})
            process.exit()
        }
    }
    else{
        console.log("Please run node token.js --encode  --data or -D [userId] for encoding to JWT")
        console.log("And run node token.js --decode  --data or -D [tokent] for decoding to user-data")
        process.exit()

    }  
}

Main()