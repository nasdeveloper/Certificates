

'use strict';

var dappAddress = "n1g7FtGyjhqowFmEpy7mde3CgPKQmH2Bt5g";
var InputPapers = function() {

}
InputPapers.prototype = {

    init: function() {
        var self = this;
        $("#submit").click(function() {
            self.commitPapers();
        });
    },

    commitPapers: function() {
        var papers_name = $("#papers_name").val();
        var papers_sex = $("#papers_sex").val();
        var papers_Type = $("#papers_Type").val();
        var papers_no = $("#papers_no").val();
        var papers_image = $("#papers_image").attr("src");
        var papers_time = getNowFormatDate();
        var warning_note = "";
		
        if(papers_name == "") {
            warning_note = "您的姓名不能为空";
            $("#papers_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#papers_input_warning").show();
            // 弹框
            return;
        }
        if (papers_sex == "") {
            warning_note = "请选择您的性别";
            $("#papers_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#papers_input_warning").show();
            // 弹框
            return;
        }
        if (papers_Type == "") {
            warning_note = "请选择证件类别";
            $("#papers_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#papers_input_warning").show();
            // 弹框
            return;
        }
        if (papers_no == "") {
            warning_note = "请填写证件编号";
            $("#papers_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#papers_input_warning").show();
            // 弹框
            return;
        }
        if (papers_image == ""||papers_image == "img/blank.png") {
            warning_note = "请选择证件图片上传";
            $("#papers_input_warning").html("<strong>注意: </strong>" + warning_note);
            $("#papers_input_warning").show();
            // 弹框
            return;
        }else{
			var file_src=$("#myfile").attr("src");
			var isIE = /msie/i.test(navigator.userAgent) && !window.opera;
			 var fileSize;
			 if(isIE){
				 var fileSystem = new ActiveXObject("Scripting.FileSystemObject");        
				 var file = fileSystem.GetFile (file_src);     
				 fileSize = file.Size;
			 }else{
				  fileSize = document.getElementById("myfile").files[0].size;
			 }
			fileSize=fileSize/1024;
			if (fileSize>20) {
				warning_note = "证件图片不能大于20K";
				$("#papers_input_warning").html("<strong>注意: </strong>" + warning_note);
				$("#papers_input_warning").show();
				// 弹框
				return;
			}
		}
        // 提交
        var func = "add_papers_to_list";
        var req_arg_item = {
            "name": papers_name,
            "sex": papers_sex,
            "papersType": papers_Type,
            "papersNo": papers_no,
			"time" : papers_time,
            "image": papers_image
        };
        var req_args = [];
        req_args.push(req_arg_item);

        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : func,
                    "args" : JSON.stringify(req_args),
                }
            },
            "method": "neb_sendTransaction"
        }, "*");
    },

    listenWindowMessage: function() {
        var self = this;
        window.addEventListener('message', function(e) {
            // e.detail contains the transferred data
            if(e.data && e.data.data && e.data.data.neb_call) {
                // 收到返回数据
                if(e.data.data.neb_call.result) {
                    // 解析数据
                    var obj = JSON.parse(e.data.data.neb_call.result);
					$("#papers_input_warning").show();
					$("#papers_input_warning").text(obj.message);
                } else {
                    console.log("Get Data From Constract Faield");
                }
            }
        });
    }
}
//获取当前时间
	function getNowFormatDate() {
		var date = new Date();
		var seperator1 = "-";
		var seperator2 = ":";
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		if (month >= 1 && month <= 9) {
		month = "0" + month;
		}
		if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
		}
		var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
		+ " " + date.getHours() + seperator2 + date.getMinutes()
		+ seperator2 + date.getSeconds();
		return currentdate;
	}

var inputpapersObj;

function checkNebpay() {
    console.log("check nebpay")
    try{
        var NebPay = require("nebpay");
    }catch(e){
        //alert ("Extension wallet is not installed, please install it first.")
        console.log("no nebpay");
        $("#noExtension").removeClass("hide")
    }

    // 环境ok，拉取数据
    inputpapersObj = new InputPapers();
    inputpapersObj.init();
    inputpapersObj.listenWindowMessage();
}



function initPage() {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("web page loaded...");
        $("#papers_input_warning").hide();
        setTimeout(checkNebpay,1000);
    });
}

initPage();
    