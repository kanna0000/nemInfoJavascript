//load library
var nem = require("nem-sdk").default;

//create endpoint = NIS
var endpoint = nem.model.objects.create("endpoint")("http://104.128.226.60", 7890);

//ページ読み込みまでjavascript待つ
document.addEventListener("DOMContentLoaded", function(){
  //get network status
  nem.com.requests.chain.height(endpoint).then(function(res){
    //get row
    var row = document.getElementById("row");
    //create text node
    var resHeight = document.createTextNode(res["height"]);
    //add new cell to row
    var height = row.insertCell(-1);
    //add to Node
    height.appendChild(resHeight);
  });

  //list of address
  var addresses = [];

  //functions
  function createTable(id, names){
    //names might be list
    var tablediv = document.getElementById(id);
    var table = document.createElement('table');
    tablediv.appendChild(table);
    var newtr = table.insertRow(-1);
    for(var name of names){
      var newth = document.createElement('th');
      var header = document.createTextNode(name);
      newtr.appendChild(newth);
      newth.appendChild(header);
    }
    return table
  }

  function namespaceTable(endpoint, address){
    nem.com.requests.account.namespaces.owned(endpoint, address).then(function(res){
      var table = createTable('namespace', ['namespace'])
      while(table.rows[1]) table.deleteRow(1);
      var data = res["data"];
      console.log(data);
      for(var key in data){
        var namespaceName = data[key]["fqn"];
        var newtr = table.insertRow(-1);
        var namespaceNameCell = newtr.insertCell(-1);
        var namespaceNameNode = document.createTextNode(namespaceName);
        namespaceNameCell.appendChild(namespaceNameNode);
      }
    })
  }

  function mosaicTable(endpoint, address){
    nem.com.requests.account.mosaics.owned(endpoint, address).then(function(res){
      var table = createTable('mosaicQuantity', ["mosaic name", "amount"])
      while(table.rows[1]) table.deleteRow(1);
      var data = res["data"]
      for(var key in data){
        //prepare data
        var name = data[key]["mosaicId"]["name"];
        var quantity = data[key]["quantity"];
        //create row
        var newtr = table.insertRow(-1);
        //create cell
        var mosaicName = newtr.insertCell(-1);
        var mosaicQuantity = newtr.insertCell(-1);

        if (name == "xem"){
          // format xem balance
          var xemQuantity = nem.utils.format.nemValue(quantity);
          //create node
          var name = document.createTextNode(name);
          var quantity = document.createTextNode(xemQuantity[0] + "." + xemQuantity[1]);
        }else {
          //create node
          var name = document.createTextNode(name);
          var quantity = document.createTextNode(quantity);
        }
        //add node to cell
        mosaicName.appendChild(name);
        mosaicQuantity.appendChild(quantity);
      }
    }, function(err) {
  	console.error(err)
    });
  }

  function mosaicTxTable(endpoint, address){
    nem.com.requests.account.transactions.all(endpoint, address).then(function(res){
      //search transaction data
      var data = res["data"]
      for(var key in data){
        var transaction = data[key]["transaction"]
        if("mosaics" in transaction){
          var mosaic = transaction["mosaics"]
          //search mosaic data
          for(var j = 0, len2 = mosaic.length; j < len2; j++){
            var mosaicTx = mosaic[j]
            if(mosaicTx["mosaicId"]["name"] == "xem"){
            }else {
              //prepare data
              var timestamp = transaction["timeStamp"];
              var date = nem.utils.format.nemDate(timestamp)
              var mosaicQuantity = mosaicTx["quantity"]
              var mosaicName = mosaicTx["mosaicId"]["name"]
              if (transaction["recipient"] == address) {
                var txType = "incoming"
                var mosaicQuantity = "+" + mosaicQuantity
              }else {
                var txType = "outgoing"
                var mosaicQuantity = "-" + mosaicQuantity
              }
              //change table
              var table = createTable('mosaicTxTable', ['time', 'mosaic name', 'type', 'quantity'])
              //var mosaicTxTable = document.getElementById("mosaicTxTable")
              //delet all rows before add new rows
              //while(mosaicTxTable.rows[1]) mosaicTxTable.deleteRow(1);
              //create row
              var newtr = table.insertRow(-1);
              //create cell
              var dateCell = newtr.insertCell(-1);
              var mosaicNameCell = newtr.insertCell(-1);
              var mosaicTxTypeCell = newtr.insertCell(-1);
              var mosaicQuantityCell = newtr.insertCell(-1);
              //create node
              var date = document.createTextNode(date);
              var name = document.createTextNode(mosaicName);
              var type = document.createTextNode(txType);
              var quantity = document.createTextNode(mosaicQuantity);
              //add node to cell
              dateCell.appendChild(date);
              mosaicNameCell.appendChild(name);
              mosaicTxTypeCell.appendChild(type);
              mosaicQuantityCell.appendChild(quantity);
            }
          }
        }
      }
    });
  }
  //when click submit
  document.getElementById("btn1").onclick = function(){

    //get address
    var address = document.getElementById("address").value;
    //definded in **. List of address
    addresses.push(address)
    console.log(addresses);
    for (var address of addresses){
      //get namespace data
      namespaceTable(endpoint, address)
      //get mosaic data
      mosaicTable(endpoint, address)
      //mosaic transaction
      mosaicTxTable(endpoint, address)
    }
  }
});

// var common = nem.model.objects.create("common")(password, privateKey)
//
//
// //prepare transaction send 10xem
// var transferTransaction = nem.model.objects.create("transferTransaction")("TA5JGQFARU255WAK3UGPTPCYNHMD5RSFUWX7Y55E", 10);
// console.log(transferTransaction);
//
// var transactionEntity =  nem.model.transactions.prepare("transferTransaction")(common, transferTransaction, nem.model.network.data.testnet.id)
//
// send
// nem.model.transactions.send(commn, transactionEntity, endpoint)
