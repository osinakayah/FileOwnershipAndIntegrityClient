var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Web3 = require('web3');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
})

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

web3.eth.defaultAccount = web3.eth.accounts[0];
let abi =  [
    {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "status",
                "type": "bool"
            },
            {
                "indexed": false,
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "owner",
                "type": "string"
            },
            {
                "indexed": false,
                "name": "fileHash",
                "type": "string"
            }
        ],
        "name": "logFileAddedStatus",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "owner",
                "type": "string"
            },
            {
                "name": "fileHash",
                "type": "string"
            }
        ],
        "name": "set",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "fileHash",
                "type": "string"
            }
        ],
        "name": "get",
        "outputs": [
            {
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "name": "owner",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];
var ProofContract = web3.eth.contract(abi);
var ProofInstance = ProofContract.at('0xbe285682d216b79d889020406b31d86cc6d169cd');

io.on('connection', function (socket) {
    console.log('Connected')
});

app.get('/submit', function (req, res) {
    let fileHash = req.query.hash;
    let owner = req.query.owner;
    ProofInstance.set(owner, fileHash, (error, transactionHash)=>{
        if(error){
            console.log(error);
            res.send(error);
        }else{
            console.log(transactionHash);
            console.log('successful transaction');
            res.send(transactionHash);
        }
    });
});

app.get('/getInfo', (req, res)=>{
    let fileHash = req.query.hash;

    ProofInstance.get(fileHash, (error, fileHash)=>{
        if(error){
            //console.log(error);
            res.send(error)
        }
        else {
            //console.log(fileHash);
            res.send(fileHash);
        }
    });
});

var logEvent = ProofInstance.logFileAddedStatus();
logEvent.watch((error, result)=>{
    if(error){
        console.log(error);
    }else {
        console.log(result);
    }
});
server.listen(9999)