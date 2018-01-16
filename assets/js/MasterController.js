lockerweb.controller("MasterController", function($scope, $state, ChannelService, $stateParams, $location, $rootScope, MasterService, MessageService, $interval, SQLService) {
	$rootScope.route = "";
    //$rootScope.urlRoute = "http://dev.locker.cwsoftwares.com.br/appapi";
    //$rootScope.urlRoute = "https://api.lockerapp.com.br/appapi";
     //$scope.login = false;
    $rootScope.channelsList = [];
    var urlNav = window.location.href;
    // if(urlNav.indexOf("localhost") > -1){
    //     $rootScope.urlRoute = "http://dev.locker.cwsoftwares.com.br/appapi";
    // }else{
    //     $rootScope.urlRoute = "https://api.lockerapp.com.br/appapi";
    // }
     $rootScope.urlRoute = "http://localhost/locker%20-%20Copia/locker-api/appapi"
    moment.locale('pt-BR');   
    //
    localStorage.setItem('channelId', "");

    // RESIZE CONTENT WINDOW    
    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $rootScope.route = toState.name;
        if($rootScope.route !== "login"){
           $rootScope.login = false;
        }else{
            $rootScope.login = true;
        }
    });

    $rootScope.res = function(){
        setTimeout(function(){
            $('#main-view,.navmenu,.message-default,.content-messages,.content-view,.flex-column,.img-default').css('height',($(window).height()-100)+'px');
        }, 100);
    };

    $rootScope.res();
    $(window).on('resize', $rootScope.res); 
    

   	// ALERT DISPOSITIVOS MOVEIS
    var urlHost = "";
    // $(window).resize(function() {
    //     $(".img-avatar").height($(".img-avatar").width());
    //     if($(window).width() < 799){      
    //   	    $state.go("app");
    //    }
    //     if($(window).width() > 799){
    //         if(url.indexOf("mobile") == -1){
    //             console.log("mobile");
    //             urlHost = window.location.href;
    //         }
    //         window.location.href = urlHost; 
    //         console.log("location.href", location.href);
    //         // $state.go("", {id:localStorage.getItem("channelId")});
    //     } 
    // });

    // ALERT DISPOSITIVOS MÓVEL
    var url =  window.location.href;
    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };
    if(isMobile.any() && $rootScope.route != "newPassword") {
        if(url.indexOf("newpassword") == -1 && url.indexOf("activateuser") == -1 && url.indexOf("term") == -1){
            setTimeout(function() {
                $state.go("app");
            }, 300);
        }       
    }

    if(!localStorage.getItem("uuID")){
        $rootScope.uuID = guid();
        localStorage.setItem("uuID",$rootScope.uuID);  
    }else{
        $rootScope.uuID = localStorage.getItem("uuID");
    }

    try{
        if(localStorage.getItem("me")){
            SQLService.init(JSON.parse('me'));
        }
    }catch(e){
        // CODE
    }

    // VARIABLE GLOBALS
    try{
        $rootScope.token = localStorage.getItem('token');
    }catch(e){}// SE TIVER ARMAZENA "token" DO LOCAL STORAGE NO ROOTSCOPE.token

    try{
        $rootScope.me = JSON.parse(localStorage.getItem("me"));
    }catch(e){}// SE TIVER ARMAZENA "me" DO LOCAL STORAGE NO ROOTSCOPE.me    


    // CONVERTER IMAGE SEND TO BACKEND
    $rootScope.b64toBlob = function(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }        
        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    };
    
    $rootScope.blobToFile = function(theBlob, fileName){
        theBlob.lastModifiedDate = new Date();
        theBlob.name = fileName;
        theBlob.filename = fileName;
        return theBlob;
    };

    // CHANGE ROTA AND KEEP ID 
    $scope.channels = function(){
        $scope.navColor =  1;
        var channelId = localStorage.getItem("channelId");
        if(channelId == ""){
            channelId = 0;
        }
        $state.go('channels', {id:channelId});
    };  
    $scope.contacts = function(){
        $scope.navColor =  2;
        $state.go('contacts', {id:localStorage.getItem("channelId")});
    };
    $scope.settings = function(){
        $scope.navColor =  3;
        $state.go('settings', {id:localStorage.getItem("channelId")});
    };
    $scope.logout = function(){
        MasterService.logout(function(response){
            localStorage.clear();
            $state.go('login');
        });
    };
    $scope.resetPassword = function(){
        $state.go('resetpassword', {id:localStorage.getItem("channelId")});
    };
    // FUNCTION DEACTIVE ACCOUNT
    $scope.delete = function(){
        swal({
              title: "Tem certeza que deseja desativar sua conta?",              
              type: "warning",
              showCancelButton: true, 
              confirmButtonText: "Confirmar",
              cancelButtonText:"Cancelar",
              closeOnConfirm: false
            },
            function(){                
              MasterService.deleteAccount(function(response){
                if(response.status === "success"){
                    swal("Desativada!", "Conta desativada com sucesso.", "success");    
                }        
              });  
              $state.go('login');
              
            });       
    };
    $scope.profile = function(){
        $state.go('profile', {id:localStorage.getItem("channelId")});
    };

    // FUNCTION OPEN PROPAGAND
    $scope.bringPropagand = function(){
        MasterService.bringPropagand(function(response){
            if(response.status == "success"){
                $rootScope.viewPropagand = true;
                $scope.propagand = JSON.parse(response.data);
                $("#painel-anuncio").show();
            }else{
                //$("#painel-anuncio").hide();
            }
        });
    };   
    // FUNCTION CLOSE PROPAGAND
    $scope.closePropagand = function(){
        // console.log("close propagand");
        $("#painel-anuncio").slideToggle();
    }; 

    // FUNCTION GEOLOCALIZATION 
    $scope.geolocalization = function(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition($scope.showPosition);
        } else { 
            window.alert("Geolocalização não é suportado por seu Browser.");
        }    
    };
    // FUNCTION SHOW POSITION 
    $scope.showPosition = function(position){
        if(position != "" || position != null){
            $scope.position = position;
        }else{
            MasterService.getLatitude(function(response){
                if(response.status == "success"){
                    $scope.position = response;
                }
            });
        }        
    };
    $scope.geolocalization();
 }).service(
    'MasterService', [
        '$rootScope',
        '$http',
        function($rootScope, $http) {
            var service = this;
            service.req = {
                url : null,
                method : 'post',
                headers: {
                    'Content-Type': undefined,
                    'Access-Token' : $rootScope.token
                },
                data: ""
            };
            // SERVICE ME - PARAMS = email, password
            service.userMe = function(callback){
                service.req.headers['Access-Token'] = $rootScope.token;
                service.req.url = $rootScope.urlRoute + "/User/Me";
                service.req.method = 'post';
                $http(service.req).then(function(response){
                    if (typeof callback === 'function'){
                        callback(response.data);
                    }
                });
            };
            service.getLatitude = function(callback){
                service.req.headers['Access-Token'] = $rootScope.token;
                service.req.url = $rootScope.urlRoute + "/User/getLatitude";// params = 'nothing'
                service.req.method = 'post';
                $http(service.req).then(function(response){
                    if (typeof callback === 'function'){
                        callback(response.data);
                    }
                });
            };
            service.bringPropagand = function(callback){
               // service.req.headers['Access-Token'] = $rootScope.token;
                service.req.url = $rootScope.urlRoute + "/Ads/GetAdwords";// params = email, password
                service.req.method = 'get';
                $http(service.req).then(function(response){
                    if (typeof callback === 'function'){
                        callback(response.data);
                    }
                });
            };
			service.logout = function(callback){
                service.req.headers['Access-Token'] = $rootScope.token;
                service.req.url = $rootScope.urlRoute + "/User/Logout";
                service.req.method = 'post';
                $http(service.req).then(function(response){
                    if (typeof callback === 'function'){
                        callback(response.data);
                    }
                });
            };
            service.deleteAccount = function(callback){
                service.req.headers['Access-Token'] = $rootScope.token;
                service.req.url = $rootScope.urlRoute + "/User/DeleteUser";
                service.req.method = 'post';
                $http(service.req).then(function(response){
                    if (typeof callback === 'function'){
                        callback(response.data);
                    }
                });
            };            
        }
    ]).service('SQLService', 
    function(){
        var serviceSql = this;
        var dbLocker = {};
        var DB = {};
        var openedDB = null;
        var messages = {};
        var messagesOS = {};
        serviceSql.init = function (me){            
            if (!window.indexedDB) {
                window.alert("Seu navegador não suporta uma versão estável do IndexedDB. Alguns recursos não estarão disponíveis.");
            }else{
                /*
                window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;           
                window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
                window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;   
                */
                //openedDB = window.indexedDB.open("Locker"+localStorage.getItem('uuID'), 7);  
                
                serviceSql.DB = new Dexie("LOCKER"+me.id);
                serviceSql.DB.version(4).stores({
                      messages: '++_id, id, channel_id, [id+channel_id], updated_at'
                     
                });
                // dbLocker = {db : openDatabase ('Locker'+localStorage.getItem('uuID')+"_"+me.id, '1.0', 'Locker Web SQL Database', 20 * 1024 * 1024)};
                // dbLocker.db.transaction (function (tx) {
                //     tx.executeSql ("CREATE TABLE IF NOT EXISTS MESSAGES (id INTEGER, channel_id INTERGER NOT NULL,message TEXT,type TEXT,created_at TEXT,user_id INTERGER,upload TEXT,thumbnail TEXT,owner TEXT, internal_id TEXT,extras TEXT)");
                //     localStorage.setItem("MESSAGES", JSON.stringify(['id','channel_id','message','type','created_at','user_id','upload', 'thumbnail', 'owner', 'internal_id', 'extras']));
                //     tx.executeSql ("CREATE TABLE IF NOT EXISTS CHANNELS (id INTEGER, user_id INTERGER NOT NULL,name TEXT,avatar TEXT,created_at TEXT,active_channel INTERGER,type_chat TEXT,chat_type TEXT,participants TEXT, extras TEXT)");
                //     localStorage.setItem("CHANNELS", JSON.stringify(['id','user_id' ,'name', 'avatar' , 'created_at', 'active_channel', 'type_chat', 'chat_type','participants', 'extras' ]));
                // });
            }   
        };

        serviceSql.add =  function(table, row, callback, index){  
            row.id = parseInt(row.id);
            row.channel_id = parseInt(row.channel_id);
            serviceSql.DB[table].put(row).then(function (message) {
                callback(message, index, "success");
                //alert ("Nicolas has shoe size " + message.id);
            }).catch(function(error) {
                callback("message", "index", "fail");
            });
        };
        serviceSql.update = function(table, row, _id, callback){
            // console.log("table", table);
            // console.log("row", row);
            // console.log("_id", _id);
            row.id =  parseInt(row.id);
            _id = parseInt(_id);
            serviceSql.DB[table].update(_id, row).then(function(updated){
                if(updated){
                    callback(updated);
                }else{
                    console.log("não encontrou");
                }
           });
        };
        serviceSql.getAll = function(table, last, channel_id, callback){
            //var result = DB.messages.where("[id+channel_id]").between([last,channel_id], [999999999999,channel_id], true, true).toArray().then(function (result) {
            //serviceSql.DB.on("ready", function() { 
                serviceSql.DB[table].where("channel_id").equals(channel_id).offset(last).toArray().then(function (result){
                    callback(result);
                    return result; // Important: Understand what 'return' means here!
                });
            //});
        };
        serviceSql.getMessages = function(table, channel_id, callback){
            //var result = DB.messages.where("[id+channel_id]").between([last,channel_id], [999999999999,channel_id], true, true).toArray().then(function (result) {            
            //serviceSql.DB.on("ready", function() { 
                serviceSql.DB[table].where("channel_id").equals(channel_id).toArray().then(function (result){               
                    callback(result);
                    return result; // Important: Understand what 'return' means here!
                });
           // });
        };
        serviceSql.deleteMessages = function(table, message_id, callback){
            //var result = DB.messages.where("[id+channel_id]").between([last,channel_id], [999999999999,channel_id], true, true).toArray().then(function (result) {
            message_id = parseInt(message_id);           
            serviceSql.DB[table].delete(message_id).then(function (){              
                callback(message_id);
                // return result; // Important: Understand what 'return' means here!
            });
        };
        
        serviceSql.getBy = function(table, by, value, callback, data){
            serviceSql.DB[table].where(by).equals(parseInt(value)).first(function (result){
                if(typeof result == 'undefined'){
                    result = false;
                }
                callback(result, data);   
                return result; // Important: Understand what 'return' means here!
            });
        };
        // serviceSql.dbInsert =  function(table, data, callback){
        //     var json = {};
        //     for(var t in data){
        //         for(var j in JSON.parse(localStorage.getItem(table))){
        //             if(t == JSON.parse(localStorage.getItem(table))[j]){
        //                 json[t] = data[t];
        //             }
        //         }
        //     }
        //     console.log(json);
        //     var sql = "INSERT INTO "+table+"(";
        //     var cols = [];
        //     var vals = [];
        //     var vals2 = [];
        //     for(var i in json){
        //         cols.push(i);
        //         vals.push(json[i]);    
        //         vals2.push("?");    
        //     }
        //     sql = sql + cols.join(",") + ") VALUES(" + vals2.join(",") + ")";
        //     console.log(sql);
        //     dbLocker.db.transaction(function (tx) {
        //         console.log(tx);
        //         tx.executeSql(sql,vals, function (tx, results){
        //             console.log(results);
        //             callback(tx, results);
        //         });
        //     });
        // };
        // serviceSql.dbUpdate =  function(table, data, key, val, callback){
        //     var sql = "UPDATE "+table+" SET ";
        //     var cols = [];
        //     var vals = [];
        //     for(var i in data){
        //         cols.push(i + " = ?");
        //         vals.push(data[i]);    
        //     }
        //     sql = sql + cols.join(",") + " WHERE " + key + " = ? ";
        //     console.log(sql);
        //     dbLocker.db.transaction(function (tx) {
        //         vals.push(val);
        //         tx.executeSql(sql,vals, function (tx, results){
        //             callback(tx, results);
        //         });
        //     });
        // };
        // serviceSql.dbDelete =  function(table, key, val, callback){
        //     var sql = "DELETE FROM "+table+" WHERE " + key + " = ? ";
        //     console.log(sql);
        //     dbLocker.db.transaction(function (tx) {
        //         tx.executeSql(sql,[val], function (tx, results){
        //             callback(tx, results);
        //         });
        //     });
        // };
        // serviceSql.dbFindOne = function(table,key,val,callback,rowData){
        //     serviceSql.dbSelect("SELECT * FROM " + table + " WHERE " + key + " = ? ",[val], function(result){
        //         callback(result,rowData);
        //     });
        // };
        // serviceSql.dbSelect =  function(sql, params, callback){
        //     dbLocker.db.transaction(function (tx) {
        //         tx.executeSql(sql,params, function (tx, results){
        //             callback(results.rows);
        //         });
        //     });
        // };
    }
);

//UU ID
    function guid() {
        function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }   