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

  //when click submit
  document.getElementById("btn1").onclick = function(){

    //get address
    var address = document.getElementById("address").value;
    //get mosaic data
    nem.com.requests.account.mosaics.owned(endpoint, address).then(function(res){
      var table = document.getElementById("mosaicQuantityTable");
      //delet all rows before add new rows
      while(table.rows[1]) table.deleteRow(1);
      for(var i = 0, len = res["data"].length; i < len; i++){
        //prepare data
        var name = res["data"][i]["mosaicId"]["name"];
        var quantity = res["data"][i]["quantity"];
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


    //mosaic transaction
    nem.com.requests.account.transactions.all(endpoint, address).then(function(res){
      console.log(res);
      //search transaction data
      for(var i = 0, len = res["data"].length; i < len; i++){
        var transaction = res["data"][i]["transaction"]
        if("mosaics" in transaction){
          console.log("mosaic exist");
          var mosaic = transaction["mosaics"]
          //search mosaic data
          for(var j = 0, len2 = mosaic.length; j < len2; j++){
            var mosaicTx = mosaic[j]
            if(mosaicTx["mosaicId"]["name"] == "xem"){
              console.log("xem");
            }else {
              //prepare data
              var timestamp = transaction["timeStamp"];
              var date = nem.utils.format.nemDate(timestamp)
              console.log(date);
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
              var mosaicTxTable = document.getElementById("mosaicTxTable")
              //delet all rows before add new rows
              //while(mosaicTxTable.rows[1]) mosaicTxTable.deleteRow(1);
              //create row
              var newtr = mosaicTxTable.insertRow(-1);
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
        }else {
          console.log("no mosaic");
        }
      }
    });

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
