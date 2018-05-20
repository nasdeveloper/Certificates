

'use strict';

var dappAddress = "n1pMW5zKRQs38FLVLKSyw1Bu5sV8EYEzPns";
var PapersShow = function() {
	this.picTrans = new PictureSaveAndRead();
    this.picTrans.init();
}
PapersShow.prototype = {

    init: function() {
        var self = this;
        $("#commit_search").click(function() {
            var key_input = $("#search_key_input").val();
            if (key_input == "") {
                return;
            }
            $("#loader_paper").show();
            self.doSearchByKey(key_input);
        });

        $("#search_myself").click(function() {
            $("#loader_paper").show();
            self.doSearchMySelf();
        });
        
		$('.login5 a').click(function(){
			$('.box2').hide();
		});
    },

    doSearchByKey: function(key) {
        // 查询用户信息
        var req_args = [];
        req_args.push(key);
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_papers_by_id",
                    "args" : JSON.stringify(req_args)
                }
            },
            "method": "neb_call"
        }, "*");
        
    },
    doSearchMySelf: function() {
        // 查询我的信息
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_my_papers",
                    "args" : ""
                }
            },
            "method": "neb_call"
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
                    if (obj.type == "papersList") {
                        $("#loader_paper").hide();
                        self.parsepapersInfo(obj);
                    }else if(obj.type == "papers") {
						self.parsePapers(obj);
					}else {
                        console.log("no need attation");
                    }
                }else{
					console.log("Get Data From Constract Faield");
				}
            }
        });
    },

	parsePapers: function(papers_info) {
		var self = this;
        // 设置内容
        if (papers_info.papers != "") {
            // 显示内容
            $("#model_loading").modal("hide");
			$("#model_part").show();
			var modal = document.querySelector( '#modal-1');
			var overlay = document.querySelector( '.md-overlay' );
			classie.add( modal, 'md-show' );
			// overlay.removeEventListener( 'click', classie.remove( modal, 'md-show' ) );
			// overlay.addEventListener( 'click', classie.remove( modal, 'md-show' ) );
            $("#papers_id").text(papers_info.papers.from);
            $("#papers_name").text(papers_info.papers.name);
            $("#papers_sex").text(papers_info.papers.sex);
            $("#papers_type").text(papers_info.papers.papersType);
            $("#papers_no").text(papers_info.papers.papersNo);
            $("#papers_image").attr("src",papers_info.papers.image);
            $("#papers_time").text(papers_info.papers.time);
            $("#papers_warning").hide();
        } else {
            // 显示没有查询到结果
            $(".box2").hide();
        }
    },
	
    parsepapersInfo: function(papers_info) {
        $("#section_papers").show();
        if (papers_info.data.length == 0) {
            // 显示没有评论
            $("#papers_list").hide();
            $("#papers_warning").show();
            
        } else {
            $("#papers_warning").hide();
            $("#papers_list").empty();
            $("#papers_list").show();
            // 显示内容
            var papers_list = template(document.getElementById('papers_list_t').innerHTML);
            var papers_list_html = papers_list({list: papers_info.data});
            $("#papers_list").append(papers_list_html);
        }
    },
	 // transImgToBase64: function(img_url) {
        // var self = this;
        // var image = new Image;
        // // image.crossOrigin = "Anonymous";
        // image.src = img_url;
        // image.crossOrigin = "Anonymous";
        // var deferred=$.Deferred();
        // image.onload = function (){
            // //将base64传给done上传处理
            // deferred.resolve(self.getBase64OfPic(image));
        // }
        // return deferred.promise();//问题要让onload完成后再return

    // },
	// getBase64OfPic: function(img_obj) {
        // var canvas = document.createElement("canvas");
        // canvas.width = img_obj.width;
        // canvas.height = img_obj.height;
        // var ctx = canvas.getContext("2d");
        // ctx.drawImage(img_obj, 0, 0, canvas.width, canvas.height);
        // var data_url = canvas.toDataURL();
        // return data_url;
    // },
}

var papersEvalutionObj;

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
    papersEvalutionObj = new PapersShow();
    papersEvalutionObj.listenWindowMessage();
    papersEvalutionObj.init();
    
}
//显示详情信息
function showPapersDetail(key){
     // 查询用户信息

     $("#model_loading").modal("show");
	var req_args = [];
	req_args.push(key);
	window.postMessage({
		"target": "contentscript",
		"data":{
			"to" : dappAddress,
			"value" : "0",
			"contract" : {
				"function" : "query_papers_by_key",
				"args" : JSON.stringify(req_args)
			}
		},
		"method": "neb_call"
	}, "*");
}

//隐藏详情信息
function closeDetail(){
	var modal = document.querySelector( '#modal-1');
	classie.remove( modal, 'md-show' );
}

function initPage() {
    document.addEventListener("DOMContentLoaded", function() {
        console.log("web page loaded...");
        $("#section_papers_info").hide();
        $("#section_papers_papers").hide();
        $("#loader_paper").hide();
        setTimeout(checkNebpay,1000);
    });
}

initPage();
    