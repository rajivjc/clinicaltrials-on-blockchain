## Clinical Trail Ethereum Blockchain demo

This project is to demonstrate on how blockchain can be used in improving data transparency in clinical trials using Ethereum smart contracts for Ethereum smart contracts. 
This project was built using the Ethereum development and test framework Truffle. 

This software requires access to an Ethereum blockchain network. For simple testing purposes the simplest setup
is to use testrpc which creates an in memory blockchain. This software would also require IPFS which is distributed file system which will be used for storing the trial protocols
in a distributed manner.

## 1. Pre Requisites
Windows, Linux or MacOS running a Git client and NodeJS 5.0+


## 2. Installation

Install TESTRPC

    npm install -g ethereumjs-testrpc

Install Truffle
    
    npm install -g truffle


Install IPFS 

Download the package from https://ipfs.io/docs/install/ and execute the following commands

	tar xvfz go-ipfs.tar.gz
	mv go-ipfs/ipfs /usr/local/bin/ipfs
	ipfs init

	
## 3. Installing the application

In a new command shell clone the repository
Use your own folder name if you like
	
	mkdir clinicaltrials-on-blockchain
	git clone https://github.com/rajivjc/clinicaltrials-on-blockchain.git
	npm install

## 4. Starting the Blockchain
In a new command shell run 
	```
	testrpc
	```
This starts blockchain node and creates ten test accounts.

To stop the blockchain node type ```ctrl-c```

## 5. Taking IPFS online

	ipfs daemon

To take IPFS offline type ```ctrl-c```

## 6. Deploying the application contracts##
* Ensure the TESTRPC instance is running

* From a new command shell window change to the directory and type
    ```
    truffle migrate
    ```

This command runs the deployment scripts in the migrations folder. The contracts are mined into the blockchain


## 7. Starting the application##

The applcation may now be started. This can be served by any web server but the most convenient way to start the application is by running
	
	truffle serve -p 8081

The application will be served by default at http://localhost:8081

Note:- If you have Metamask on your browser, you need to disable to for the demo application to work.

## Demo

[![Click to watch demo](https://img.youtube.com/vi/JGumTDlrDnE/0.jpg)](https://www.youtube.com/watch?v=JGumTDlrDnE)


## 8. Useful Documentation

**TESTRPC**

https://github.com/ethereumjs/testrpc

**Truffle Read The Docs**

https://truffle.readthedocs.io/en/latest/

**Ethereum Contract Deployment**

https://ethereum.gitbooks.io/frontier-guide/content/creating_contract.html

**IPFS**

https://ipfs.io/
