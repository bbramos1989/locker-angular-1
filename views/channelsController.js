lockerweb.controller("CtrlChannels", function($scope, $rootScope, $stateParams, $state, $interval, ChannelService) {
    $scope.isSecret = false;

    console.log("channels");

    // FILTROS
    $scope.controls = {
        filters: 'todos'      
        // secretChannel:false;      
    };

    $('#area').addClass('animated flipInY');
        
    // FUNCTION INIT
    $scope.init = function(){
        $rootScope.res();
        $scope.initChannelInterval();
    };

    // FUNCTION FILTER CHANNELS
    $scope.filterType = function(filtrinhos){        
        $scope.controls.filters = filtrinhos;       
        switch(filtrinhos){
            case'todos':
                console.log("TODOS");
                $rootScope.channelsList = $rootScope.allChannels;
            break;
            case'conversas':
                console.log("CONVERSAS");
                $rootScope.channelsList = [];
                for(var k in $rootScope.allChannels){
                    if($rootScope.allChannels[k].chat_type != 'group'){
                        $rootScope.channelsList.push($rootScope.allChannels[k]);
                    }
                }
            break;
            case'grupo':
                console.log("GRUPO");
                $rootScope.channelsList = [];
                for(var i in $rootScope.allChannels){
                    if($rootScope.allChannels[i].chat_type == 'group'){
                        $rootScope.channelsList.push($rootScope.allChannels[i]);
                    }
                }
            break;
        }
    };

    // FORMDATA LISTCHANNEL
    var dataParams = new FormData();
    dataParams.append("page-size", 1000);

    $rootScope.createGroupStatus = false;
    // FUNCTION CREATEGROUP
    $scope.createGroup = function(){
        $rootScope.createGroupStatus = true;
        console.log("$rootScope.createGroupStatus 01", $rootScope.createGroupStatus);
        $state.go("contacts", {addGroup: "addGroup"});
    };
    
    // FUNCTION SYNC CHANNEL
    $scope.syncChannel =  function(){    
        ChannelService.listChannel(dataParams, function(response){
            for(var l in response.data){     
                response.data[l].isSecret = false;      
                for(var o in response.data[l].participants){
                    if(response.data[l].participants[o].req_pass == "1" && response.data[l].participants[o].participant_id == $rootScope.me.id){
                        response.data[l].isSecret = true;
                    }
                    // treat the avatar double/group/single
                    if(response.data[l].chat_type == "double" && (response.data[l].avatar == undefined || response.data[l].avatar == null || response.data[l].avatar == "")){
                        response.data[l].avatar = "assets/img/contact-default.png";
                    }else if(response.data[l].chat_type == "group" && (response.data[l].avatar == undefined || response.data[l].avatar == null || response.data[l].avatar == "")){
                        response.data[l].avatar = "assets/img/group.png";
                    }else if(response.data[l].chat_type == "single" && (response.data[l].avatar == undefined || response.data[l].avatar == null || response.data[l].avatar == "")){
                        response.data[l].avatar = "assets/img/contact-default.png";
                    }
                }
            }


            function inChannels(channel){
                for(var i in $rootScope.channelsList){
                    if(channel.id == $rootScope.channelsList[i].id){
                        return i;  
                    }
                }
                return -1;
            }

            for(var r in response.data){
                var i = inChannels(response.data[r])
                if(i > -1){
                    $rootScope.channelsList[i] = response.data[r];
                }else{
                    $rootScope.channelsList.push(response.data[r]);
                }                       
            }         

            $rootScope.allChannels = response.data;

            $("#todos").on("click", function(){
               $scope.controls.filters = "todos";    

            });
            $("#conversa").on("click", function(){
               $scope.controls.filters = "conversas";    

            });
            $("#grupo").on("click", function(){
                $scope.controls.filters = "grupo";    
            });
           
            switch($scope.controls.filters){
                case'todos':
                    $rootScope.channelsList = $rootScope.allChannels;
                break;
                case'conversas':
                    $rootScope.channelsList = [];
                    for(var k in $rootScope.allChannels){
                        if($rootScope.allChannels[k].chat_type != 'group'){
                            $rootScope.channelsList.push($rootScope.allChannels[k]);
                        }
                    }
                break;
                case'grupo':
                    $rootScope.channelsList = [];
                    for(var i in $rootScope.allChannels){
                        if($rootScope.allChannels[i].chat_type == 'group'){
                            $rootScope.channelsList.push($rootScope.allChannels[i]);
                        }
                    }
                break;
            }

            for(var k in $rootScope.channelsList){
                $rootScope.channelsList[k].secretChannel = false;
                var storageSecret = JSON.parse(localStorage.getItem("secret-channel-" + $rootScope.me.id)); 
                for(var i in storageSecret){
                    if(storageSecret[i].id == $rootScope.channelsList[k].id){
                        $rootScope.channelsList[k].secretChannel = true;             
                    }
                }
            }                   
        });
    };

    // FUNCTION INIT CHANNEL INTERVAL
    $scope.initChannelInterval = function(){        
        $scope.syncChannel();
        clearInterval(window.syncChannelInterval);
        window.syncChannelInterval = setInterval(function(){
            $scope.syncChannel();
        }, 5000);
    };

    // FUNCTION CLICK CHANNEL
    $scope.clickChannel = function(currentChannel){
        console.log("clicou clickChannel", currentChannel);
        for(var i in currentChannel.participants){           
            if(currentChannel.participants[i].participant_id == $rootScope.me.id && currentChannel.participants[i].req_pass == "1"){
                var password = currentChannel.participants[i].participant.password;     
                $scope.popupPasswordChannel(password, currentChannel);    
            }
        }  
        if(password == undefined){
            $rootScope.viewChannel = true;
            localStorage.setItem("channelId", currentChannel.id);
            $state.go("messages", {id: currentChannel.id});
            $rootScope.initEmojis();
        }
    };

    // FUNCTION POPUP INSERT PASSWORD CHANNEL SECRET
    $scope.popupPasswordChannel = function(mePassword, currentChannel){
        swal({
            title: "Conversa Secreta",
            text: "Por favor, infome sua senha de login",
            type: "input",
            showCancelButton: true,
            closeOnConfirm: false,
            animation: "slide-from-top",
            inputPlaceholder: "senha",
            inputType: "password"
        },
        function(inputValue){
            if (inputValue === false){
                return false;
            }
            if (inputValue === "") {
                swal.showInputError("Este campo é obrigatorio!");
                return false;
            }                   
            var hash = $.md5(inputValue);
            if(hash ==  mePassword){
                swal.close();
                localStorage.setItem("channelId", currentChannel.id);
                $state.go("messages", {id: currentChannel.id});
                $rootScope.viewChannel = true;
            }else{
                swal("Senha invalida!", "Tente novamente.", "error");
            }  
        });
    };
    $scope.init();
 }).service(
    'ChannelService', [
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
        service.listChannel = function(params,callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Channel/List";
            service.req.method = 'post';
            service.req.data = params;       
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };
        service.editChannel = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Channel/Edit";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).success(function(response){
                if (typeof callback === 'function'){
                    callback(response);
                }
            });
        };
        service.changeAvatar = function(params,callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Channel/ChangeAvatar";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).success(function(response){
                if (typeof callback === 'function'){
                    callback(response);
                }
            });
        };    
    }
]);

