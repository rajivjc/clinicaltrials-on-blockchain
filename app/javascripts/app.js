var accounts;
var regulatorInstance;
var regulatorContractAddress;
var ctInstance;
var ctContractAddress;
var defaultGas = 4700000;
var userAccounts = [];

var regulatorAccount, croAccount, pharmaAccount, currentAccount;
var contractAddress = regulatorContractAddress;

var subjects = 10;
var dataPoints = 5;
var sideEffect = ['NONE', 'NAUSEA', 'VOMITTING', 'HEADACHE', 'HEARTBURN', 'COMA'];
var genderArray = ['Male', 'Female'];

var hostName = "localhost";
var ipfs = window.IpfsApi(hostName, 5001);
var trialDocHash;
var clinicalTrailCreationTxnHash;


function hex2string(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        var v = parseInt(hex.substr(i, 2), 16);
        if (v) str += String.fromCharCode(v);
    }
    return str;
}

// Initialize
function deployRegulator() {
    Regulator.new({ from: currentAccount, gas: defaultGas }).then(
        function(regInstance) {
            regulatorInstance = regInstance;
            regulatorContractAddress = regulatorInstance.address;
            $('#sectionAAddress').html('<i class="fa fa-address-card"></i> ' + regulatorInstance.address);
            $('#sectionATxnHash').html('<i class="fa fa-list-alt"></i> ' + regulatorInstance.transactionHash);
            $('#sectionBAddress').html('<i class="fa fa-address-card"></i> ' + regulatorInstance.address);
            $('#sectionBTxnHash').html('<i class="fa fa-list-alt"></i> ' + regulatorInstance.transactionHash);
            $("#deployRegContractSuccess").html('<i class="fa fa-check"</i>' + " Regulatory Contract mined!");
            $("#deployRegContractSuccess").show().delay(5000).fadeOut();
            initializeRegulatorEvents();
        });
}

function initializeRegulatorEvents() {
    var events = regulatorInstance.allEvents();
    events.watch(function(error, result) {
        if (error) {
            console.log("Error: " + error);
        } else {
            $('#audittrailbody').append('<tr><td>' + result.event +
                '</td><td>' + result.args.msgSender +
                '</td><td>' + hex2string(result.args.msg) +
                '</td><td>' + Date(result.args.timestamp) + '</td>');
        }
    });
}


function initializeClinicalTrialEvents() {
    var ct = ClinicalTrial.at(ctContractAddress);
    var events = ct.allEvents();
    events.watch(function(error, result) {
        if (error) {
            console.log("Error: " + error);
        } else {
            $('#audittrailbody').append('<tr><td>' + result.event +
                '</td><td>' + result.args.msgSender +
                '</td><td>' + hex2string(result.args.msg) +
                '</td><td>' + Date(result.args.timestamp) + '</td>');
        }
    });
}

function addCroForApproval(cro, croUrl) {
    document.getElementById("crodiv").style.display = "block";
    regulatorInstance.submitCro.sendTransaction(cro, croUrl, { from: currentAccount, gas: defaultGas })
        .then(function(txHash) {
            $("#submitCroSuccess").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
            $("#submitCroSuccess").show().delay(5000).fadeOut();
        }).then(function() {
            readFromRegulator();
        });
}

function readFromRegulator() {
    regulatorInstance.getCroById(0).then(function(data) {
        data[0] = hex2string(data[0]);
        data[1] = hex2string(data[1]);
        var table = document.getElementById("crotable").getElementsByTagName('tbody')[0];
        $("#crotable tbody").empty();
        var row = table.insertRow(0);
        var nameCell = row.insertCell(0);
        var urlCell = row.insertCell(1);
        var addressCell = row.insertCell(2);
        var statusCell = row.insertCell(3);
        nameCell.innerHTML = data[0];
        urlCell.innerHTML = data[1];
        addressCell.innerHTML = data[2];
        statusCell.innerHTML = getStatus(data[3].c[0]);
    });
}

function getStatus(data) {
    switch (data) {
        case 0:
            return "Submitted";
        case 1:
            return "Approved";
        default:
            return "Pending";
    }
}

function approveCroWithId0() {
    regulatorInstance.changeCroStatus.sendTransaction(pharmaAccount, 1, { from: regulatorAccount, gas: defaultGas }).then(
        function(txHash) {
            $("#approveCroSuccess").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
            $("#approveCroSuccess").show().delay(5000).fadeOut();
            readFromRegulator();
        }
    );
}

function submitProposal() {
    var drugName = $("#inputDrugName").val();
    var trialFrom = $("#datepickertrialfrom").val();
    var trialTo = $("#datepickertrialto").val();
    var trialFromTs = (moment(trialFrom, "M/D/YYYY").valueOf()) / 1000;
    var trialToTs = (moment(trialTo, "M/D/YYYY").valueOf()) / 1000;

    regulatorInstance.submitProposal.sendTransaction(drugName, trialFromTs, trialToTs, { from: croAccount, gas: defaultGas }).then(
        function(txHash) {
            $("#submitProposalSuccess").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
            $("#submitProposalSuccess").show().delay(5000).fadeOut();
            readProposalById0();
        }
    );
}

function readProposalById0() {
    document.getElementById("trialproposaldiv").style.display = "block";
    regulatorInstance.getProposalById(0).then(function(data) {
        $("#drugName").html(hex2string(data[1]));
        $("#tdfrom").html(moment.unix(data[2].c[0]).format("MM/DD/YYYY"));
        $("#tdto").html(moment.unix(data[3].c[0]).format("MM/DD/YYYY"));
        $("#tdstatus").html(getStatus(data[5].c[0]));
        if (getStatus(data[5].c[0]) == "Approved") {
            $("#clinicalTrialAddress").html('<i class="fa fa-address-card"></i> ' + data[6]);
            $("#clinicalTrialCreationTxnHash").html('<i class="fa fa-list-alt"></i> ' + clinicalTrailCreationTxnHash);
            $("#clinicalTrialHash").html('<i class="fa fa-check"</i>' + " Clinical Trial Contract mined!");
            $("#clinicalTrialHash").show().delay(5000).fadeOut();
            ctContractAddress = data[6];
            initializeClinicalTrialEvents();
        }
    });

}


function acceptProposalId0() {

    regulatorInstance.acceptProposal.sendTransaction(0, { from: regulatorAccount, gas: defaultGas }).then(
        function(txHash) {
            clinicalTrailCreationTxnHash = txHash;
            $("#acceptProposalSuccess").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
            $("#acceptProposalSuccess").show().delay(5000).fadeOut();
            readProposalById0();
        }
    );
}

function addSubjects() {
    var ct = ClinicalTrial.at(ctContractAddress);
    document.getElementById("trialdiv").style.display = "block";

    function addSubjectTransaction(sub, currentValue) {
        var deferred = Q.defer();
        ct.addSubject.sendTransaction(sub, { from: currentAccount, gas: defaultGas }).then(function(txHash) {
            $("#addSubjectHash").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
            $("#addSubjectHash").show().delay(5000).fadeOut();
            getSubjectById(currentValue);
            deferred.resolve();
        }).catch(function(e) {
            console.log("catching---->" + e)
            if ((e + "").indexOf("invalid JUMP") || (e + "").indexOf("out of gas") > -1) {
                // We are in TestRPC
                $("#addSubjectError").show().delay(5000).fadeOut();
            } else if ((e + "").indexOf("please check your gas amount") > -1) {
                // We are in Geth for a deployment
            } else {
                throw e;
            }
        });
        return deferred.promise;
    }

    var subjectsRange = [];
    for (i = 0; i < subjects; i++) {
        subjectsRange.push(i);
    }

    subjectsRange.reduce(function(previousValue, currentValue) {
        return previousValue.then(function() {
            var data = {};
            data['name'] = 's' + currentValue.toString();
            data['dob'] = getRandomInt(1, 12) + '-' + getRandomInt(1, 30) + '-' + getRandomInt(2014, 2015);
            data['gender'] = genderArray[getRandomInt(0, 1)];
            var sub = data['name'] + '/' + data['dob'] + '/' + data['gender'];
            return addSubjectTransaction(sub, currentValue);
        })
    }, Q.resolve('start'));
}


function getSubjectById(currentValue) {
    var ct = ClinicalTrial.at(ctContractAddress);
    ct.getSubjectById(currentValue).then(function(_subjId) {
        var table = document.getElementById("subjecttable").getElementsByTagName('tbody')[0];
        var row = table.insertRow(0);
        var nameCell = row.insertCell(0);
        var dobCell = row.insertCell(1);
        var genderCell = row.insertCell(2);
        var fields = hex2string(_subjId).split('/');
        nameCell.innerHTML = fields[0];
        dobCell.innerHTML = fields[1];
        genderCell.innerHTML = fields[2];
    });
}

function getRandomInt(min, max) {
    return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
}

function addDataPoints() {
    var ct = ClinicalTrial.at(ctContractAddress);

    function addDataTransaction(_subjId, _json) {
        var deferred = Q.defer();
        //croAccount
        ct.addDataPoint.sendTransaction(_subjId, _json, { from: currentAccount, gas: defaultGas }).then(function(txHash) {
            $("#addDataPointstHash").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
            $("#addDataPointstHash").show().delay(5000).fadeOut();
            deferred.resolve();
        }).catch(function(e) {
            console.log("catching---->" + e)
            if ((e + "").indexOf("invalid JUMP") || (e + "").indexOf("out of gas") > -1) {
                // We are in TestRPC
                $("#addDataError").show().delay(5000).fadeOut();
            } else if ((e + "").indexOf("please check your gas amount") > -1) {
                // We are in Geth for a deployment
            } else {
                throw e;
            }
        });
        return deferred.promise;
    }

    var subjectsRange = [];
    for (i = 0; i < subjects; i++) {
        subjectsRange.push(i);
    }

    subjectsRange.reduce(function(previousValue, currentValue) {
        return previousValue.then(function() {
            var promises = []
            for (j = 0; j < dataPoints; j++) {
                var data = {};
                data['dose'] = Math.floor((Math.random() * 100) + 1);
                data['units'] = 'mg';
                data['response'] = Math.floor((Math.random() * 100) + 1);
                data['side-effects'] = sideEffect[getRandomInt(0, 5)];
                var _json = data['dose'] + '/' + data['units'] + '/' + data['response'] + '/' + data['side-effects'];
                promises.push(addDataTransaction(currentValue, _json));
            }
            return Q.all(promises);
        })
    }, Q.resolve('start'));
}


function readFromTrial(actor) {
    var ct = ClinicalTrial.at(ctContractAddress);

    function readDataPoint(_patientIdx, _dataIdx, _patient) {
        var deferred1 = Q.defer();
        ct.getDataPointForSubject(_patientIdx, _dataIdx).then(function(data) {
            data[1] = hex2string(data[1]);
            if (actor == 'cro') {
                $('#trialdatabody').append('<tr><td>' + "Dose/Units/Response/Side Effects - " + data[1] + " added at " + Date(data[0]) + '</td></tr>');
            } else {
                $('#trialdatabodypharma').append('<tr><td>' + "Dose/Units/Response/Side Effects - " + data[1] + " added at " + Date(data[0]) + '</td></tr>');

            }
            deferred1.resolve();
        })
        return deferred1.promise;
    }

    function readDataForPatient(_patientIdx) {
        var deferred = Q.defer();
        ct.getSubjectById(_patientIdx).then(function(_patient) {
            if (actor == 'cro') {
                $('#trialdatabody').append('<tr><td style="font-weight:bold">' + hex2string(_patient) + '</td></tr>');
            } else {
                $('#trialdatabodypharma').append('<tr><td style="font-weight:bold">' + hex2string(_patient) + '</td></tr>');
            }
            var promises = [];
            ct.getDataCounterForSubject(_patientIdx).then(function(_counterForPatient) {
                for (var i = 0; i < parseInt(_counterForPatient); i++) {
                    promises.push(readDataPoint(_patientIdx, i, _patient));
                }
                Q.all(promises).then(function() {
                    deferred.resolve();
                })
            })
        })

        return deferred.promise;
    }

    ct.getSubjectsCount().then(function(_count) {
        var range = [];
        for (var i = 0; i < _count; i++) {
            range.push(i);
        }

        range.reduce(function(previousValue, currentValue) {
            return previousValue.then(function() {
                return readDataForPatient(currentValue);
            })
        }, Q.resolve('start'));
    })

}

function showAccounts() {
    var accountSelect = document.getElementById("accountSelect");
    userAccounts.forEach(function(account) {
        var option = document.createElement("option");
        if (account == regulatorAccount) {
            option.text = account + " - Regulator";
        } else if (account == croAccount) {
            option.text = account + " - CRO";
        } else if (account = pharmaAccount) {
            option.text = account + " - Pharma";
        }
        option.value = account;
        accountSelect.add(option);
    });
}


function store() {
    const file = document.getElementById('source').files[0]
    const reader = new FileReader()
    reader.onload = function() {
        var toStore = buffer.Buffer(reader.result);
        ipfs.add(toStore, function(err, res) {
            if (err || !res) {
                return console.error('ipfs add error', err, res)
            }

            res.forEach(function(file) {
                console.log('successfully stored', file);
                submitTrialProtocolDocument(file.path);
                display(file.path);
            })
        })
    }
    reader.readAsArrayBuffer(file)
}

function submitTrialProtocolDocument(docHash) {
    console.log(docHash);
    regulatorInstance.submitTrialProtocolDocument.sendTransaction(0, docHash, { from: croAccount, gas: defaultGas }).then(
        function(txHash) {
            console.log("Submitting trial protocal docHash into trial proposal ", txHash);
            $("#uploadIpfsSuccess").html('<i class="fa fa-check"</i>' + ' IPFS Document Hash ' + docHash + " added to IPFS");
            $("#uploadIpfsSuccess").show().delay(7000).fadeOut();
            $("#uploadProtocalSuccess").html('<i class="fa fa-check"</i>' + ' Transaction ' + txHash + " added to the blockchain");
            $("#uploadProtocalSuccess").show().delay(7000).fadeOut();
            readProposalById0();
        }
    );
}

function display(hash) {
    document.getElementById('hash').innerHTML =
        "<a target='_blank' href='http://" + hostName + ":8080/ipfs/" + hash + "'>" + hash + "</a>"
}

function getBlockDetails(blockNo) {
    var block = web3.eth.getBlock(blockNo);
    $('#blkNum').html(block.number);
    $('#transactionCount').html(block.transactions.length);
    $('#transactions').html(block.transactions[0]);
    $('#timestamp').html(Date(block.timestamp));
    $('#difficulty').html(("" + block.difficulty).replace(/['"]+/g, ''));
    $('#nonce').html(block.nonce);
    $('#size').html(block.size);
    $('#miner').html(block.miner);
    $('#gasLimit').html(block.gasLimit);
    $('#gasUsed').html(block.gasUsed);
    $('#receiptRoot').html(block.receiptRoot);
    $('#stateRoot').html(block.stateRoot);
    $('#sha3Uncles').html(block.sha3Uncles);

    $('#modalBlockDetails').modal({
        keyboard: true,
        backdrop: "static"
    });
}

function getBlockInfo() {
    var maxBlocks = 100;
    var blockNum = parseInt(web3.eth.blockNumber, 10);
    if (maxBlocks > blockNum) {
        maxBlocks = blockNum + 1;
    }
    // get latest 100 blocks
    blocks = [];
    for (var i = 0; i < maxBlocks; ++i) {
        blocks.push(web3.eth.getBlock(blockNum - i));
    }
    $("#”transactions tbody").empty();
    blocks.forEach(function(block) {
        for (var index = 0; index < block.transactions.length; index++) {
            var t = block.transactions[index];
            $('#transactionsbody').append('<tr><td><a  target="#" onclick="getBlockDetails(' + block.number + ');return false;" href="' + t.blockNumber +
                ' ">' + block.number + '</a></td><td>' + block.hash +
                '</td><td>' + block.parentHash +
                '</td>');
        }
    });

}

window.onload = function() {

    web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
            alert("There was an error fetching your accounts.");
            return;
        }
        if (accs.length == 0) {
            alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
            return;
        }
        accounts = accs;

        pharmaAccount = accounts[0];
        currentAccount = accounts[0];
        regulatorAccount = accounts[1];
        croAccount = accounts[2];

        userAccounts.push(pharmaAccount);
        userAccounts.push(regulatorAccount);
        userAccounts.push(croAccount);
        $('#pharmaAccount').html('User Account : ' + pharmaAccount);
        //web3.eth.defaultAccount = accounts[0];
    });

    $("#accountSelect").change(function(e) {
        e.preventDefault();
        currentAccount = $("#accountSelect option:selected").val();
        currentAccountText = $("#accountSelect option:selected").text();
        var fields = currentAccountText.split('-');
        $('#actor').text(fields[1]);
        if (currentAccount == pharmaAccount) {
            $('#mytabs a[href="#sectionA"]').tab('show');
        } else if (currentAccount == regulatorAccount) {
            $('#mytabs a[href="#sectionB"]').tab('show');
        } else {
            $('#mytabs a[href="#sectionC"]').tab('show');
        }

    });

    $("#deployRegContract").click(function() {
        var accountSelected = $("#accountSelect option:selected").val();
        deployRegulator();
    });

    $("#addCroForApproval").click(function() {
        var cro = $("#addCro").val();
        var croUrl = $("#addCroUrl").val();
        addCroForApproval(cro, croUrl);
    });

    $("#approveCRO").click(function() {
        approveCroWithId0();
    });

    $("#acceptProposal").click(function() {
        acceptProposalId0();
    });

    $("#deployCtContract").click(function() {
        submitProposal();
    });

    $("#btnAddSubject").click(function() {
        addSubjects();
    });

    $("#btnAddDataPoints").click(function() {
        addDataPoints();
    });

    $("#btnTrialData").click(function() {
        readFromTrial('cro');
    });

    $("#btnTrialDataPharma").click(function() {
        readFromTrial('pharma');
    });

    $("#modalClose").click(function() {
        $('#modalBlockDetails').modal('hide');
    });


    $(function() {
        $("#datepickertrialfrom").datepicker();
        $("#datepickertrialto").datepicker();
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        var target = $(e.target).attr("href") // activated tab
        if (target == "#sectionA") {
            $('#actor').text("Pharma");
            currentAccount = pharmaAccount;
            $('#pharmaAccount').html('User Account : ' + pharmaAccount);


        } else if (target == "#sectionB") {
            $('#actor').text("Regulator");
            currentAccount = regulatorAccount;
            $('#regulatorAccount').html('User Account : ' + regulatorAccount);
        } else if (target == "#sectionC") {
            $('#actor').text("CRO");
            currentAccount = croAccount;
            urrentAccount = regulatorAccount;
            $('#croAccount').html('User Account : ' + croAccount);
        }

        if (target = "#dropdown2") {
            getBlockInfo();
        }
    });
};
