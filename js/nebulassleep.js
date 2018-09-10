var chainnetConfig = {
    mainnet: {
        name: "主网",
        contractAddress: "n1sRJc54JJzmpabguzz1uodtyR2cECHUXde",
        host: "https://mainnet.nebulas.io",
        payhost: "https://pay.nebulas.io/api/mainnet/pay"
    },
    testnet: {
        name: "测试网",
        contractAddress: "n1x4Nkgspa4ERz4UxhjXYe5vWNCpm1QnwAW",
        host: "https://testnet.nebulas.io",
        payhost: "https://pay.nebulas.io/api/pay"
    }
}

var chainInfo = chainnetConfig["mainnet"];
var HttpRequest = require("nebulas").HttpRequest;
var Neb = require("nebulas").Neb;
var Unit = require("nebulas").Unit;
var Utils = require("nebulas").Utils;

var myneb = new Neb();
myneb.setRequest(new HttpRequest(chainInfo.host));
var nasApi = myneb.api;


var NebPay = require("nebpay");
var nebPay = new NebPay();




if (typeof(webExtensionWallet) === "undefined") {

  alert("请首先安装webExtensionWallet插件");
}

$(".account_detail").hide();
$(".init_account").hide();
$(".upload_data").hide();
//隐藏数据统计
$(".service_wrapper").hide();



var dappAddress = chainInfo.contractAddress;

getAccountname();

function getAccountname(){
    var to = dappAddress;
    var value = "0";
    var callFunction = "searchAccount";
    var callArgs = "";
    nebPay.simulateCall(to, value, callFunction, callArgs, {
        listener: getAccountnameListener
    });
}

function getAccountnameListener(resp) {
    var res = JSON.parse(resp.result);

    if (res != null){

        $("#span_addr").text(res.accountaddress);
        $("#span_name").text(res.accountname);
        $("#span_gender").text(res.accountgender);

        //得到数据，绘图
        getDataArray();

        $(".account_detail").show();
        $(".upload_data").show();
        $(".service_wrapper").show();
        $(".init_account").hide();
        $(".loading_div").hide();

    }else{
        $(".account_detail").hide();
        $(".upload_data").hide();
        $(".service_wrapper").hide();
        $(".init_account").show();
        $(".loading_div").hide();
    }

}



//初始化
$("#initAccount").click(function() {
    var tmpname = $("#name").val();
    var tmpgender = $("#gender").val();

    if (tmpname == "" || tmpgender == "") {
        alert("请完整填写表单！");
        return false;
    }
    if (tmpgender!="男"&&tmpgender!="女"){
        alert("请正确填写性别！");
        return false;
    }
    if (tmpname.length >15) {
        alert("姓名长度过长！");
        return false;
    }
    else{
        startinit(tmpname,tmpgender);
    }
})

function startinit (name,gender){
    var to = dappAddress;
    var value = "0";
    var callFunction = "initAccount";

    var callArgs = "[\""+name+"\",\""+gender+"\"]";

    nebPay.call(to, value, callFunction, callArgs, {
      listener: initAccountListener
  });
}


function initAccountListener(resp) {
  console.log("监听");
  if (resp == "Error: Transaction rejected by user"){
    console.log(resp);
        alert("初始化取消");
        return false;
    }else{
        console.log(resp);
        alert("已提交区块链网络，请等待写入区块链！");
        checkPayStatus(resp.txhash);
    }

}

//增加并更新体重

$("#upload_data").click(function() {
  var sleep_time = $("#sleep_time").val();
  var sleep_enough = $("#sleep_enough").val();
  var rest_enough = $("#rest_enough").val();
  var unsleep_emotion = $("#unsleep_emotion").val();
  var day_sleep = $("#day_sleep").val();
  var difficult_sleep = $("#difficult_sleep").val();
  var easy_awake = $("#easy_awake").val();
  var awake_difficult_sleep = $("#awake_difficult_sleep").val();
  var nightmare = $("#nightmare").val();
  var sleep_pill = $("#sleep_pill").val();

  if (sleep_time == "" || sleep_time ==null || isNaN(sleep_time) || sleep_enough == "" || sleep_enough ==null || isNaN(sleep_enough) || rest_enough == "" || rest_enough ==null || isNaN(rest_enough) || unsleep_emotion == "" || unsleep_emotion ==null || isNaN(unsleep_emotion) || day_sleep == "" || day_sleep ==null || isNaN(day_sleep) || difficult_sleep == "" || difficult_sleep ==null || isNaN(difficult_sleep) || easy_awake == "" || easy_awake ==null || isNaN(easy_awake) || awake_difficult_sleep == "" || awake_difficult_sleep ==null || isNaN(awake_difficult_sleep) || nightmare == "" || nightmare ==null || isNaN(nightmare) || sleep_pill == "" || sleep_pill ==null || isNaN(sleep_pill) ) {
    alert("请正确输入！");
    return false;
  }else{
    startupload(sleep_time,sleep_enough,rest_enough,unsleep_emotion,day_sleep,difficult_sleep,easy_awake,awake_difficult_sleep,nightmare,sleep_pill);
    return false;
  }

})

function startupload (sleep_time,sleep_enough,rest_enough,unsleep_emotion,day_sleep,difficult_sleep,easy_awake,awake_difficult_sleep,nightmare,sleep_pill){

    var to = dappAddress;
    var value = "0";
    var callFunction = "addSleepArray";
    var callArgs = "["+sleep_time+","+sleep_enough+","+rest_enough+","+unsleep_emotion+","+day_sleep+","+difficult_sleep+","+easy_awake+","+awake_difficult_sleep+","+nightmare+","+sleep_pill+"]";
    //监听
    nebPay.call(to, value, callFunction, callArgs, {
      listener: function(resp){
            console.log("test listenr "+resp.txhash);
            if(resp == "Error: Transaction rejected by user"){
                alert("上传取消");
                return false;
            }else{
                alert("已提交区块链网络，请等待写入区块链！");
                checkPayStatus(resp.txhash);
            }
        }
    });
}



function checkPayStatus(txhash) {
    console.log("checkpaystatas "+txhash);
    $(".account_detail").hide();
    $(".init_account").hide();
    $(".service_wrapper").hide();
    $(".upload_data").hide();
    $(".loading_div").show();
    var timerId = setInterval(function(){
        nasApi.getTransactionReceipt({
            hash:txhash
        }).then(function(receipt){
            console.log("checkPayStatus");
            if(receipt.status == 1){
                clearInterval(timerId);
                var res = receipt.execute_result;
                console.log("test success return="+res);


                getAccountname();

            }else if(receipt.status == 0){
                clearInterval(timerId);
                console.log("test fail err="+receipt.execute_error);
                alert("失败，请再次尝试！");

                getAccountname();
            }
        }).catch(function(err){
            console.log("test error");
        });
    },3*1000);
}




function getDataArray(){

    var to = dappAddress;
    var value = "0";
    var callFunction = "searchSleepArray";
    var callArgs = "";

    nebPay.simulateCall(to, value, callFunction, callArgs, {
        listener: searchHandle
    });
}

function judgescore(num){

    if (num>=0&&num<=5){
        return 1;
    }
    if (num>=6&&num<=12){
        return 2;
    }
    if (num>=13&&num<=18){
        return 3;
    }
    if (num>=19&&num<=24){
        return 4;
    }
    if (num>=25&&num<=31){
        return 5;
    }
}

function searchHandle(resp) {

    var res = JSON.parse(resp.result);

    var totalnum = res.totalnum;
    var sleep_time_array = res.sleep_time_array;
    var sleep_time_num = res.sleep_time_num;
    var sleep_enough_num = res.sleep_enough_num;
    var rest_enough_num = res.rest_enough_num;
    var unsleep_emotion_num = res.unsleep_emotion_num;
    var day_sleep_num = res.day_sleep_num;
    var difficult_sleep_num = res.difficult_sleep_num;
    var easy_awake_num = res.easy_awake_num;
    var awake_difficult_sleep_num = res.awake_difficult_sleep_num;
    var nightmare_num = res.nightmare_num;
    var sleep_pill_num = res.sleep_pill_num;

    console.log("record.scorearray::::"+totalnum);
    console.log("record.scorearray::::"+sleep_time_array);
    console.log("record.addressarray::::"+sleep_time_num);

    var lineChartData = {
      labels : ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"],
      datasets : [
      {
        label: "Sleep Time",
        fillColor : "rgba(255,255,255,0.2)",
        strokeColor : "rgba(255,255,255,1)",
        pointColor : "rgba(255,255,255,1)",
        pointStrokeColor : "#fff",
        pointHighlightFill : "#fff",
        pointHighlightStroke : "rgba(255,255,255,1)",
        data : []
      },
      {
        fillColor : "rgba(255,255,255,0.2)",
        pointColor : "rgba(255,255,255,1)",
        pointStrokeColor : "#fff",
        pointHighlightFill : "#fff",
        data : [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
      }
      ]

    }
    if (totalnum==31){
      for (var i=0;i<31;i++){
        lineChartData.datasets[0].data.push(sleep_time_array[i]);
      }
    }else{
      for (var i=0;i<totalnum;i++){
        lineChartData.datasets[0].data.push(sleep_time_array[i]);
      }
    }
    $("#span_sleep_enough_num").text(sleep_enough_num);
    $("#span_rest_enough_num").text(rest_enough_num);
    $("#span_unsleep_emotion_num").text(unsleep_emotion_num);
    $("#span_day_sleep_num").text(day_sleep_num);
    $("#span_difficult_sleep_num").text(difficult_sleep_num);
    $("#span_easy_awake_num").text(easy_awake_num);
    $("#span_awake_difficult_sleep_num").text(awake_difficult_sleep_num);
    $("#span_nightmare_num").text(nightmare_num);
    $("#span_sleep_pill_num").text(sleep_pill_num);
    $("#span_sleep_time_num").text(sleep_time_num);
    var score = 0;

    if (sleep_time_num>=9){
        score += 1;
    }
    if (sleep_time_num>=7&&sleep_time_num<=8){
        score += 2;
    }
    if (sleep_time_num>=5&&sleep_time_num<=6){
        score += 3;
    }
    if (sleep_time_num>=3&&sleep_time_num<=4){
        score += 4;
    }
    if (sleep_time_num<=2){
        score += 5;
    }

    score = score+judgescore(sleep_enough_num)+judgescore(rest_enough_num)+judgescore(unsleep_emotion_num)+judgescore(day_sleep_num)+judgescore(difficult_sleep_num)+judgescore(easy_awake_num)+judgescore(awake_difficult_sleep_num)+judgescore(nightmare_num)+judgescore(sleep_pill_num);

    $("#span_score").text(score);
    //console.log(lineChartData);
    var ctx = document.getElementById("canvas").getContext("2d");
    window.myLine = new Chart(ctx).Line(lineChartData, {
        responsive: true
    });
}



