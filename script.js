//load library
var nem = require("nem-sdk").default;

//create endpoint = NIS
//select nis from list randomly
var nisList = ["104.128.226.60", "23.228.67.85", "37.120.188.83", "188.68.50.161", "150.95.145.157"];
var nis = nisList[Math.floor( Math.random() * nisList.length)];
var endpoint = nem.model.objects.create("endpoint")(`http://${nis}`, 7890);
console.log(nis);
console.log(endpoint);

//ページ読み込みまでjavascript待つ
document.addEventListener("DOMContentLoaded", function(){
  //get network status
  nem.com.requests.chain.height(endpoint).then(function(res){
    var row = document.getElementById("height");
    var resHeight = document.createTextNode(res["height"]);
    var height = row.insertCell(-1);
    height.appendChild(resHeight);
  });

  function namespaceTable(endpoint, address){
    nem.com.requests.account.namespaces.owned(endpoint, address).then(function(res){
      var table = document.getElementById('namespace')
      while(table.rows[1]) table.deleteRow(1);
      var data = res["data"];
      for(var key in data){
        var namespaceName = data[key]["fqn"];
        var newtr = table.insertRow(-1);
        var namespaceNameCell = newtr.insertCell(-1);
        var namespaceNameNode = document.createTextNode(namespaceName);
        namespaceNameCell.appendChild(namespaceNameNode);
        console.log(res);
      }
    })
  }

  function mosaicQuantityTable(endpoint, address){
    nem.com.requests.account.mosaics.owned(endpoint, address).then(function(res){
      var table = document.getElementById('mosaicQuantity')
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
      var table = document.getElementById('mosaicTxTable')
      while(table.rows[1]) table.deleteRow(1);
      //search transaction data
      var data = res["data"]
      for(var key in data){
        var transaction = data[key]["transaction"]
        if("mosaics" in transaction){
          var mosaic = transaction["mosaics"]
          //search mosaic data
          for(var j in mosaic){
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

  //list of address
  var addresses = [];
  //when click submit
  document.getElementById("btn1").onclick = function(){
    //get address
    var address = document.getElementById("address").value;

    //execute only first time
    if (addresses.indexOf(address) == -1) {
      addresses.push(address)
      //get list
      var ul = document.getElementById('addressList');
      while (ul.lastChild) {
        ul.removeChild(ul.lastChild);
      }
      //make list
      for (address of addresses) {
        var item = document.createTextNode(address);
        var newli = document.createElement('li');
        newli.appendChild(item);
        ul.appendChild(newli);
      }
      console.log(addresses);
      //only execute firsttime
      if (addresses.length>1){
        //container of each address
        var container = document.getElementById('tables');
        var table = document.getElementsByName('table');
        var firstAddress = document.getElementById('firstAddress');
        var anotherAddress = table[0].cloneNode(true);
        anotherAddress.name = 'table';
        container.appendChild(anotherAddress);
      }

      //create tables
      var head = document.getElementById('tableHead');
      var headNode = document.createTextNode(address);
      while (head.firstChild) {
        head.removeChild(head.firstChild);
      }
      head.appendChild(headNode);
      namespaceTable(endpoint, address);
      mosaicQuantityTable(endpoint, address);
      mosaicTxTable(endpoint, address);
      //flaot each address info
      var target = document.getElementsByName('table');
      target[0].style.cssFloat = 'left';

    }

  }
});
