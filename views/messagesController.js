lockerweb.controller("CtrlMessages", function($state, $scope, $stateParams, $rootScope, MessageService, SQLService, ngAudio, Upload) { 
    console.log("messages");

    $rootScope.currentId = $stateParams.id; 
    $scope.iconAudio = true;
    $scope.iconSend = false;
    $scope.boxTimer = true;
    $scope.partcipantsView = [];
    $scope.nameParticipant = [];
    $scope.timerRunning = true;
    $scope.optionsMsgHeader = false;
    $scope.idMessage = [];
    $scope.numberMessageSelected = 0;
    $scope.sqlID = [];
    $scope.insertPassword = false;
    $scope.onlineCall = false;
    $scope.call = {
        accepted: false,
        init: false,
        chatName: "",
        calling: false,
        timer : false
    };

    var ringtone = new Audio('../assets/song/ringtone-call.mp3');

    // FUNCTION RINGTONE CALL VIDEO START
    $scope.playRingtoneCall = function() {
        ringtone.play();
    };
    
    // FUNCTION RINGTONE CALL VIDEO PAUSE
    $scope.stopRingtoneCall = function() {
        ringtone.pause();
        ringtone.currentTime = 0;
    };
    
    // HEADER MSG  
    $scope.optionsMsg = function(idMessages){
        $("#menu-message").hide();
        $scope.optionsMsgHeader = true;
        $(".messages-all .chat .message").css('cursor', 'pointer');
    };
    
    // FUNCTION CLOSE OPTIONS
    $scope.closeOptions = function(){
        $(".options-msg").addClass('animated fadeOutUp');
        $scope.optionsMsgHeader = false; 
    };

    // SELECIONAR MSGS
    $scope.seletedMessage = function(idMessages){          
        var pos = $scope.idMessage.indexOf(idMessages.id);   
        var posSQL = $scope.idMessage.indexOf(idMessages._id);        

        if(idMessages.selected == true){              
            idMessages.selected = false;  
            $scope.idMessage.splice(pos, 1); 
            $scope.sqlID.splice(posSQL, 1);                         
        }else{ 
            $scope.idMessage.push(idMessages.id); 
            $scope.sqlID.push(idMessages._id); 
            idMessages.selected = true; 
        }

        $scope.numberMessageSelected = $scope.idMessage.length;  
 
        // EXCLUDE MSGS    
        $scope.excludeMsgs = function(){        
            for (var k in $scope.sqlID){    
                // SQL DELETE MESSAGES      
                SQLService.deleteMessages('messages', $scope.sqlID[k], function(){
                    // CODE
                });
                for(var l in $scope.messages){
                    if($scope.messages[l]._id == $scope.sqlID[k]){
                      $scope.messages.splice(l, 1);
                    }
                }
            }               
            $scope.optionsMsgHeader = false;     
        };
    };

    // FUNCTION TIMER CALL
    $scope.timerCall = function(){
        if($scope.call.timer == false){
            $scope.call.timer = true;
            setTimeout(function(){
                if($scope.call.timer != false){
                    $scope.closeCall();
                }
            }, 20000);
        }
    };

    $rootScope.channelDetail = "";
    // FUNCTION SYNC CALL 0000000
    $scope.syncCall = function(){
        // FORMDATA CHANNEL DETAIL
        // console.log("syncCall");
        var formChannelDetail = new FormData();
        formChannelDetail.append('channel_id', localStorage.getItem("channelId"));
        // SERVICE CHANNEL DETAIL
        MessageService.channelDetail(formChannelDetail, function(response){
            if(response.status == "success"){
                if(response.data.videochat_name == ""){
                    response.data.stream_type = "";
                }
                $rootScope.channelDetail = response.data;
                // console.log("$rootScope.channelDetail", $rootScope.channelDetail);

                // detecta que alguém está ligando
                if(response.data.videochat_name != "" && response.data.videochat_name != null && $scope.call.accepted == false){
                    // console.log("Recebendo chamada");
                    $scope.call.chatName = response.data.videochat_name;
                    $scope.call.calling = true;
                    $scope.timerCall();
                    $("#modal-calls").show();
                    $scope.playRingtoneCall();
                }
                if((response.data.videochat_name == "" || response.data.videochat_name == null) && $scope.call.accepted == true){
                    setTimeout(function(){
                        // console.log("desligou 1");
                        $scope.call.accepted = false;
                        $scope.call.init = false;
                        $scope.endCall();
                    }, 1000);
                }
                if(response.data.videochat_name == "" && $scope.call.accepted == false && $scope.call.init == false && $scope.call.calling == true){
                    // console.log("desligou 2");
                    $scope.call.calling = false;
                    $scope.stopRingtoneCall();
                    $scope.endCall();
                } 
                if(response.data.videochat_name == "" && $scope.call.accepted == false && $scope.call.init == true){
                    // console.log("desligou 3");
                    $scope.call.calling = false;
                    $scope.stopRingtoneCall();
                    $scope.endCall();
                }
                if($rootScope.route == "messages"){
                    setTimeout(function(){
                        // console.log("chamar denovo");
                        $scope.syncCall();
                    }, 4000);
                }
                if(response.data.type_chat == "double" && response.data.participants.length == 2){
                    if(response.data.participants[0].id != $rootScope.me.id){
                        if(response.data.participants[0].last_access_status == "online"){
                            $scope.onlineCall = true;
                        }else{
                            $scope.onlineCall = false;
                        }
                    }else{
                        if(response.data.participants[1].last_access_status == "online"){
                            $scope.onlineCall = true;
                        }else{
                            $scope.onlineCall = false;
                        }
                    }
                }
            }
        });
    };

    // EXECUTE FUNCTIOn SYNC CALL
    $scope.syncCall();

    // FUNCTION VERIFY STATUS CONTACT IF ONLINE OR NO
    $scope.verifyStatus = function(){
        // FORMDATA CHANNEL LAST ACCESS
        var paramsChannelLastAccess = new FormData();
        paramsChannelLastAccess.append('channel_id', $stateParams.id);
        // SERVICE CHANNEL LAST ACCESS
        MessageService.channelLastAccess(paramsChannelLastAccess, function(response){
            if($rootScope.route == "messages"){
                setTimeout(function(){
                    $scope.verifyStatus();
                }, 4000);
            }
        });
    };

    // EXECUTE FUNCTION VERIFY STATUS
    $scope.verifyStatus();

    $scope.newConnection = function(roomVideo, call){
        $scope.connection = new RTCMultiConnection();
        // this line is VERY_important
        $scope.connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
        // $scope.connection.socketURL = 'https://stream.lockerapp.com.br:9001/';

        // if you want audio+video conferencing
        $scope.connection.session = {
            audio: true,
            video: true
        };
        /* connection.onerror = function(){
            alert("erro na conexão")
        }
        connection.onMediaError = function(){
            alert("mediaError");
        }*/
        $scope.connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        };
        $scope.connection.maxParticipantsAllowed = 2;

        $scope.connection.onleave = function(event){
            // console.log("onleave");
            $scope.endCall();
        };
        $scope.connection.onstream = function(event){
            if(event.type == "local"){
                var myElements = angular.element(document.querySelector('#local-call'));
                var video = event.mediaElement;
                myElements.append(video);
            }else{
                $scope.call.accepted = true;
                $scope.call.timer = false;
                $scope.stopRingtoneCall();
                var myElements = angular.element(document.querySelector('#remote-call'));
                var video = event.mediaElement;
                myElements.append(video);
                if($rootScope.channelDetail.stream_type == "video"){
                    AudioToggle.setAudioMode(AudioToggle.SPEAKER);
                }else{
                    AudioToggle.setAudioMode(AudioToggle.EARPIECE);
                }
            }
        };
        setTimeout(function(){
            $scope.connection.openOrJoin(roomVideo);
        }, 500);
    };

    // FUNCTION START VIDEO CALL
    $scope.startVideoCall = function(isBtn){
        if (navigator.getUserMedia){
        navigator.getUserMedia({video: true}, function(){
            $rootScope.channelDetail.stream_type = "video";
            if(!isBtn){
                $("#menu-message").slideToggle();
            }
            var room =  "sala" + Math.floor(Math.random() * 100000);
            // FORMDATA STARTCALL (VIDEO)
            var formStartCallVideo =  new FormData();
            formStartCallVideo.append("videochat_name", room);
            formStartCallVideo.append("channel_id", $stateParams.id);
            formStartCallVideo.append("stream_type", "video");

            // SERVICE STARTCALL (VIDEO)
            MessageService.startCall(formStartCallVideo, function(response){
                if(response.data.status == "success"){
                    $scope.call.accepted = false;
                    $scope.call.init = true;
                    $rootScope.channelDetail.stream_type = "video";
                    $("#modal-calls").show();
                    $scope.newConnection(room);
                }else{
                    console.log("Erro", response);
                }
            });
        }, function(){
            swal("Erro", "Seu dispositivo está sem câmera.", "warning");
        });
        }
    };

    // FUNCTION START CALL (CALL)
    $scope.startCall = function(isBtn){
        if (navigator.getUserMedia){
            navigator.getUserMedia({audio: true}, function(){
                $rootScope.channelDetail.stream_type = "call";
                if(!isBtn){
                    $("#menu-message").slideToggle();
                }
                var room = "sala" + Math.floor(Math.random() * 100000);

                // FORMADATA STARTCALL (CALL)
                var formStartCall =  new FormData();
                formStartCall.append("videochat_name", room);
                formStartCall.append("channel_id", $stateParams.id);
                formStartCall.append("stream_type", "call");

                // SERVICE STARTCALL (CALL)
                MessageService.startCall(formStartCall, function(response){
                    if(response.data.status == "success"){
                        $("#modal-calls").show();
                        $scope.call.accepted = false;
                        $scope.call.init = true;
                        $rootScope.channelDetail.stream_type = "call";
                        $scope.newConnection(response.data.data.videochat_name, true);
                    }
                });
            }, function(){
                swal("Erro", "Seu dispositivo não tem microfone.", "warning");
            });
        }
    };

    // FUNCTION RECEIVED CALL
    $scope.receivedCall = function(whatCall){
        $scope.stopRingtoneCall();
        $rootScope.channelDetail.stream_type = whatCall;
        $scope.call.accepted = true;
        $scope.call.init = true;
        $scope.call.timer = false;
        $scope.newConnection($scope.call.chatName);
    };

    // FUNCTION END CALL
    $scope.endCall = function(reject){
        // FORMDATA ENDCALL
        var paramsEndCall = new FormData();
        paramsEndCall.append("channel_id", $stateParams.id);

        // SERVICE ENDCALL
        MessageService.endCall(paramsEndCall, function(response){
            if(response.data.status == "success"){
                $scope.stopRingtoneCall();
                $("#modal-calls").hide();
                $scope.call.accepted = false;
                $scope.call.init = false;
                $scope.call.timer = false;
                $rootScope.channelDetail.stream_type = "";
                $rootScope.channelDetail.videochat_name = "";
                if(!reject){
                    // $scope.connection.disconnect();
                    $scope.connection.attachStreams.forEach(function(localStream){
                        localStream.stop();
                    });
                    $scope.connection.close();
                    $scope.connection.closeSocket();
                }
            }else{
                console.log("service endCall ERROR", response);
            }
        });
    };
 
    $scope.closeHeader = function(){
        $scope.optionsMsgHeader = false;
    };
    $scope.startTimer = function (){
        $scope.$broadcast('timer-start');
        $scope.timerRunning = true;
    };
    $scope.stopTimer = function (){
        $scope.$broadcast('timer-stop');
        $scope.timerRunning = false;
    };
    $scope.toBottom = function(){
        $(".messages-all").scrollTop($(".messages-all")[0].scrollHeight+150);
    };

    if(!localStorage.getItem("scroll-"+$stateParams.id)){
        localStorage.setItem("scroll-"+$stateParams.id,0);
    }
    $scope.breakScroll = function(){
        if(parseInt(localStorage.getItem("scroll-"+$stateParams.id)) + $(".messages-all")[0].offsetHeight == $(".messages-all")[0].scrollHeight){
            localStorage.setItem("scrollBottom-"+$stateParams.id,"true");
        }else{
            localStorage.setItem("scrollBottom-"+$stateParams.id,"false");
        }
    };    
    $(".messages-all").scroll(function(evt){
        var y = evt.target.scrollTop;
        if(localStorage.getItem("scrollBottom-" + $stateParams.id) == "true"){
            localStorage.setItem("scrollBottom-" + $stateParams.id, "false");
        }
        localStorage.setItem("scroll-" + $stateParams.id, y);
        $scope.breakScroll();
    });

    // Input Search open/closed 
    $("#search").on('click', function() {
        $("#search-message").animate({width:'toggle'}, 300);
    });

    // MENU MESSAGE
    $("#menu-message").hide();
    $scope.openMenuMessage = function(){
        $("#menu-message").slideToggle();
    };

    // FUNCTION VERIF ON FAIL CAM

    $scope.haveCam = true;
    var failCam = function(e){
        swal("Erro", "Seu dispositivo está sem câmera.", "warning");
        $scope.iconCamera = true;
        $scope.haveCam = false;
    };

    var successCam = function(s){
        $scope.haveCam = true;
        swal("Erro", "Seu dispositivo não tem câmera.", "warning");
        var context = new VideoContext();
        var mediaStreamTrack = context.createMediaStreamTrack(s);
        recorder = new Recorder(mediaStreamTrack);
        recorder.record();
        $scope.startTimer();
        $scope.videoRecord = true;
        setInterval(function() {
            $("#videoRecord").fadeToggle();
        },300);
        $scope.boxTimer = false;
    };

    window.URL = window.URL || window.webkitURL;
    navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

    var recorder;
    var video = document.querySelector('video');
    $scope.button = true;
    $scope.startRecording = function(){
        if (navigator.getUserMedia){
        navigator.getUserMedia({video: true}, successCam, failCam);
        }else{
            // console.log('navigator.getUserMedia not present');
        }
        $scope.button = false;
    }; 

    // FUNCTION VERIF ON FAIL CAMERA


    // FUNCTION VERIF ON FAIL MIC
    $scope.haveMic = true;
    var onFail = function(e){
        swal("Erro", "Seu dispositivo não tem microfone.", "warning");
        $scope.iconAudio = true;
        $scope.haveMic = false;
    };

    // INIT - AUDIO //
    // FUNCTION VERIF ON SUCCESS MIC
    var onSuccess = function(s){
        $scope.haveMic = true;
        var context = new AudioContext();
        var mediaStreamSource = context.createMediaStreamSource(s);
        recorder = new Recorder(mediaStreamSource);
        recorder.record();
        $scope.startTimer();
        $scope.audioRecord = true;
        setInterval(function() {
            $("#audioRecord").fadeToggle();
        },300);
        $scope.boxTimer = false;
    };

    window.URL = window.URL || window.webkitURL;
    navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    var recorder;
    var audio = document.querySelector('audio');
    $scope.button = true;
    $scope.startRecording = function(){
        if (navigator.getUserMedia){
        navigator.getUserMedia({audio: true}, onSuccess, onFail);
        }else{
            // console.log('navigator.getUserMedia not present');
        }
        $scope.button = false;
    };        

    // FUNCTION STOP RECORDING
    $scope.stopRecording = function(){
        recorder.stop();
        $scope.iconAudio = true;
        $scope.audioRecord = false;
        $scope.iconSend = false;
        $scope.boxTimer = true;
        recorder.exportWAV(function(s) { 
            $scope.audioBlob = $rootScope.blobToFile(s,'MeuAudio.mp3'); 
            $scope.sendAudio($scope.audioBlob);
        }, 'audio/mp3');          
    };

    // FUNCTON STOP ALL
    $scope.stopAll = function(){
        recorder.stop();
        $scope.iconAudio = true;
        $scope.audioRecord = false;
        $scope.iconSend = false;
        $scope.boxTimer = true;
        $scope.stopTimer();
    };  
    // FIM - AUDIO //     

    // CHANNEL DETAIL SYNC
    if(typeof $stateParams.id != "undefined" && $stateParams.id != "0"){
        
        // FORMDATA DETAILS CHANNEL
        var dataParams = new FormData();
        $rootScope.currentId = $stateParams.id;
        dataParams.append("channel_id", $rootScope.currentId);   

        // SERVICE CHANNEL DETAIL    
        MessageService.channelDetail(dataParams, function(response){
            $rootScope.channelDetail = response.data;
            for(var l in $scope.channelDetail.participants){
                if($rootScope.channelDetail.participants[l].id == $rootScope.me.id && $rootScope.channelDetail.participants[l].req_pass == "1"){
                    $scope.insertPassword = true;
                }
                $scope.partcipantsView.push($rootScope.channelDetail.participants[l].name);
            }
            if($rootScope.channelDetail.type_chat == 'double'){
                if($rootScope.channelDetail.participants[0].id == $rootScope.me.id){   
                    if(!$rootScope.channelDetail.participants[1]){
                        $scope.status = null;
                    }
                }else{
                    $scope.status = $rootScope.channelDetail.participants[0].status;     
                }
            }
            if((response.data.avatar == null || response.data.avatar == "") && response.data.type_chat == "double"){
                   $rootScope.channelDetail.avatar = "assets/img/contact-default.png";
            }
            if((response.data.avatar == null || response.data.avatar == "") && response.data.type_chat == "group"){
                   $rootScope.channelDetail.avatar = "assets/img/group.png";
            }
        });
    }

    // OPEN DETAIL CHANNEL
    $scope.openDetailChannel = function(){
        $state.go('group', {id:$rootScope.currentId});
    };

    // CLEAR MESSAGES
    $scope.clearChannel = function(){
        console.log("Entrou na limpar conversa");
        $("#menu-message").slideUp();
        swal({
            title: "Mensagens",
            text: "Deseja limpar esta conversa?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#2a9fd5",
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
            closeOnConfirm: false,
            closeOnCancel: false
        },
        function(isConfirm){
            if (isConfirm) {
                // SQL GET MESSAGES
                SQLService.getMessages('messages', parseInt($rootScope.currentId), function(response){      
                    console.log("response getMessages", response);
                    for(var i = 0; i < response.length; i++) {                
                        var row = response[i];               
                        SQLService.deleteMessages('messages', row._id, function(response){                            
                            $rootScope.ultimaMsg --;
                            // CLEAR
                            $scope.messages = [];                                                      
                        });                                                           
                    }
                    // FORMDATA REMOVE MESSAGES
                    var formRemoveAllMessages = new FormData();
                    formRemoveAllMessages.append('channel_id', $rootScope.currentId);

                    // SERVICE REMOVE MESSAGES 
                    MessageService.removeMessages(formRemoveAllMessages, function(response){
                        if(response.status == "success"){
                           swal("Sucesso!", "Mensagens excluídas com sucesso.", "success");
                        }else{
                            swal("Erro!", "Não foi possível limpar o canal. Tente novamente!", "error");
                        }
                    });   
                    swal.close();  
                }); 
            }else{ 
                swal.close();
                $("#menu-message").slideUp();
            }
        });
    };

    // OPEN DETAIL CONTACT
    $scope.infoContact = function(){         
        if($scope.channelDetail.type_chat == 'double'){
            if($scope.channelDetail.participants[0].id == $rootScope.me.id){
                $state.go('contactDetail', {id:$rootScope.currentId, contactid:$scope.channelDetail.participants[1].id});    
            }else{
                $state.go('contactDetail', {id:$rootScope.currentId, contactid:$scope.channelDetail.participants[0].id}); 
            }
        }else{
            $state.go('group', {id:$rootScope.currentId});
        }       
    };

    // PAGINATION CONFIG
    $scope.control = {
        pageSize: 11
    };    

    $scope.messages = [];
    $scope.offset = 0;
    $scope.load = false;

    $scope.moreMessagesStat = true;
    // FUNCTION MORE MESSAGES
    $scope.moreMessages = function(){
        if(!$scope.moreMessagesStat){
            return;
        }
        $scope.moreMessagesStat = false;
        $scope.load = true;
        $scope.offset += 10;       
        sql = "select * from MESSAGES WHERE channel_id = ? order by id DESC LIMIT 10 OFFSET "+ $scope.offset;
        param = [$rootScope.currentId];
        // SQLService.dbSelect(sql,param,function(response){
        //     var rows = [];           
        //      for(var i=0; i<response.length; i++) {
        //         var row = response.item(i);
        //         row.created_at = moment(new Date(row.created_at)).format('LT');                
        //         rows.push(row);

        //     }   
        //     rows = rows.reverse();       
        //     $scope.messages = rows.concat($scope.messages);  
        //     $scope.moreMessagesStat = true;  
        //     $scope.load = false; 

        // });

    };

    // FUNCTION SCREEN LIST
    $scope.screenList = function(){
        $rootScope.currentId = parseInt($stateParams.id);        
        $rootScope.ultimaMsg = parseInt($rootScope.ultimaMsg);
        // SQL GET ALL
        SQLService.getAll('messages', $rootScope.ultimaMsg, $rootScope.currentId, function(response){
            // console.log("response SQLService.getAll", response);
            var rows = [];  
            for(var i = 0; i < response.length; i++) {                
                var row = response[i];
                if(row.type == null){
                    row.type = "audio";
                    row.open = true;
                }
                if(row.type != "text" && row.type != "audio"){
                   row.open = true;
                }
                // row.created_at = moment(row.created_at).format("HH:ss");
                rows.push(row);                
            }
            var lastMessage = rows[rows.length - 1];
            // console.log("lastMessage VARIAVEL CRIADA", lastMessage);

            if(lastMessage != undefined && lastMessage.id != undefined && lastMessage.message_status != 'read'){
                // FORMDATA MARKONREAD
                var dataParams =  new FormData();
                // console.log("lastMessage.id", lastMessage._id);
                dataParams.append('message_id', lastMessage._id);

                // SERVICE ARKONREAD
                MessageService.markOnReadMessage(dataParams, function(data, _row){
                    // console.log("data", data);
                    // console.log("_row", _row);
                    _row.message_status = 'read';
                    _row.updated_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                    // SQL UPDATE
                    SQLService.update("messages", _row, _row._id, function(response){  
                        // console.log("response", response); 
                        // CODE                  
                    });
                }, lastMessage);
            }
            if(localStorage.getItem("scrollBottom-" + $stateParams.id) == "true"){
                $scope.toBottom();
            }
            $scope.messages = $scope.messages.concat(rows);          
            $rootScope.ultimaMsg = $scope.messages.length;

            for(var m in $scope.messages){
                var today = moment(moment(new Date()).format("YYYY-MM-DD 00:00:00"));
                var compare = moment(moment(new Date($scope.messages[m].created_at)).format("YYYY-MM-DD 00:00:00"));   
                var diff = today.diff(compare, 'days');
                switch(diff){
                    case 0:
                        $scope.messages[m].dateLabel = "Hoje";
                        break;
                    case 1:
                        $scope.messages[m].dateLabel = "Ontem";
                        break;
                    default:
                    $scope.messages[m].dateLabel = moment($scope.messages[m].created_at).format("DD/MM/YYYY");
                }
            }
        });
    };  

    // FUNCTION REMOVE CHAT
    $scope.deleteChannel = function(){  
        console.log("entrou aquiiiiiiiiiiiiii");
        $scope.openMenuMessage();
        swal({
                title: "Atenção!",
                text: "Deseja excluir chat?",
                type: "warning",
                confirmButtonColor: "#33a8df ",
                confirmButtonText: "Confirmar",
                cancelButtonText: "Cancelar",
                showCancelButton: true,
                closeOnConfirm: false,
                closeOnCancel: true
            },
        function(isConfirm){
            if (isConfirm) {
                // console.log("isConfirm", isConfirm);
                // FORMDATA REMOVE CHAT
                var paramsRemoveChat = new FormData();
                // console.log("formdata paramsRemoveChat", paramsRemoveChat);
                paramsRemoveChat.append('channel_id', $stateParams.id);
                // console.log("$stateParams", $stateParams);

                // SERVICE REMOVE CHAT
                // console.log("entrou no serviço");
                MessageService.deleteChannel(paramsRemoveChat, function(response){
                    // console.log("IFZINHO", paramsRemoveChat);
                    // console.log("response", response);
                    if(response.data.status == "success"){
                        // console.log("entrou no if do serviço");
                        swal("Sucesso!", "Chat foi excluido com sucesso!", "success"); 
                    }else{
                        swal("Erro", "Não foi possível excluir o chat. Tente novamente.","error");
                    }
                });
            }
        });
    };


    // FUNCTION GLOBAL CHECK AGE
    $rootScope.checkAge = function(detailChannel){
        if(detailChannel.message_expires != null && detailChannel.message_expires > 0){
            // SQL GET MESSAGES
            SQLService.getMessages('messages',parseInt(detailChannel.id), function(response){
                if(response.length > 0){
                    for(var i = 0; i < response.length; i++) {                
                        var row = response[i];

                        if($.trim(row.updated_at) != ""){
                            var actual = moment(new Date());  
                            var compare = moment(new Date(row.updated_at));
                            dif = actual.diff(compare,'seconds');

                            if(detailChannel.message_expires != null && detailChannel.message_expires > 0){ 
                                if(dif > detailChannel.message_expires){   
                                    // SQL DELETE MESSAGES                     
                                    SQLService.deleteMessages('messages',row._id, function(responseDelete){                            
                                        $rootScope.ultimaMsg --;
                                        for(var o in $scope.messages){
                                            if($scope.messages[o]._id == responseDelete){
                                                $scope.messages.splice(0, o + 1);
                                                $rootScope.ultimaMsg = $rootScope.ultimaMsg - o+1;
                                            }
                                        }                                                            
                                    });                         
                                }
                            }                                            
                        }
                    }
                }       
            });
        }
    };

    // FUNCTION MARK ON READ MESSAGE 
    $scope.markOnReadMessage = function(listMessages){
        console.log("Entrou na markonread", listMessages.length);

        // FORMDATA MARKONREAD
        var formMarkonReadMessage =  new FormData();
        formMarkonReadMessage.append('message_id', listMessages[listMessages.length - 1].id);

        // SERVICE ARKONREAD
        MessageService.markOnReadMessage(formMarkonReadMessage, function(data, _row){
            console.log("data", data);
            console.log("_row", _row);
            
            _row.message_status = 'read';
            _row.updated_at = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            
            // SQL UPDATE
            SQLService.update("messages", _row, _row._id, function(response){  
                console.log("response SQLService.update", response); 
                // CODE                  
            });
        });
    };

    // FUNCTION SYNC LIST
    $scope.syncList = function(){
        // FORMDATA LISTMESSAGE
        var dataParams = new FormData();
        dataParams.append('page-size', 1000);
        dataParams.append('channel_id', $rootScope.currentId);
        // SERVICE LIST MESSAGE
        MessageService.listMessage(dataParams, function(response){     
            if(response.data.length > 0){
                console.log("$rootScope.viewChannel", $rootScope.viewChannel);
                if($rootScope.viewChannel == true){
                    console.log("Entrou verifica de onde veio");
                    $scope.markOnReadMessage(response.data);
                }
                // execute function mark on read message
                var verifyDbProcess = setInterval(function(){
                    $scope.dbProcess = false;
                    for(var f in $scope.messages){
                        if($scope.messages[f].id == 0){
                            $scope.dbProcess = true;
                        }
                    }
                    if($scope.dbProcess == false){
                        clearInterval(verifyDbProcess);
                        for(var i in response.data){
                            var exist = false;
                            for(var v in $scope.messages){
                                if($scope.messages[v].id == parseInt(response.data[i].id)){
                                    exist = true;
                                }
                            }
                            if(exist == false){
                                var rowData = response.data[i];
                                // SQL GET BY
                                SQLService.getBy('messages', 'id', rowData.id, function(respGetBy, _rowData){                        
                                    if(respGetBy == false){
                                        // SQL ADD
                                        SQLService.add("messages", _rowData, function(respAdd){
                                            // CODE
                                        });
                                    }                        
                                }, rowData);
                            }                
                        }
                    }
                }, 500);
            }
        });
    };

    // FUNCTION INIT EMOJI
    $rootScope.initEmojis = function(){
        $.emojiarea.path = 'src/componentes/jquery-emojiarea-master/packs/basic/images/';
        var $emoticon = $('#textarea');
        $emoticon.siblings('.emoji-wysiwyg-editor, .emoji-button').remove();

        $emoticon.emojiarea({
            buttonLabel:'<i class=\'btn-emoticons fa fa-smile-o\'></i>',
            wysiwyg: true,
            onBlurKeyupPaste : function(s, a){
                $scope.showSend();
            },
            onMousedownFocus : function(s, a){
                $scope.showSend();
            },
            onKeyup : function(s, a){
                $scope.closeMenuGalery();
            },
            onBlur : function(s, a){
                $scope.showSend();
            },
            onEnter : function(s, a){
                $scope.sendMessage();
            },
            onClick : function(s, a, state){
                $scope.upDownFooter(state);
            },
            onMouseUp :  function(s, a, state){
                $scope.upDownFooter(state);
            }
        });
    }

    // FUNCTION INIT LIST MESSAGE
    $scope.init = function(){
        SQLService.init($rootScope.me);
        $rootScope.res();                  
        $rootScope.ultimaMsg = 0;
        $scope.initSyncInterval();
        $scope.initScreenInterval();
        $rootScope.initEmojis();
        setTimeout(function() {
            $($(".messages-all")[0]).scrollTop(parseInt(localStorage.getItem("scroll-" + $stateParams.id)));
            $scope.breakScroll();
        }, 1000);
    };

    // FUNCTION INIT SYNC INTERVAL
    $scope.initSyncInterval = function(){
        $scope.syncList();
        clearInterval(window.syncInterval);
        window.syncInterval = setInterval(function(){
            $scope.syncList();
            if($rootScope.channelDetail != ""){
                $rootScope.checkAge($rootScope.channelDetail);
            }
        }, 2000);
    };

    // FUNCTION INIT SCREEN INTERVAL
    $scope.initScreenInterval = function(){
        $scope.screenList();
        clearInterval(window.screenInterval);
        window.screenInterval = setInterval(function(){
            $scope.screenList();
        }, 1000);
    };

    $scope.init();
    $rootScope.atualize = $scope.init;

    // FUNCTION BACK
    $scope.back = function(){
        $state.go('channels');
    };

    // FUNCTION UPDATE MESSAGE LIST
    $scope.updateMessageList = function(id, data){
        for(var i in $scope.messages){
            if($scope.messages[i].internal_id == id){
                if(data.type != 'text'){
                    $scope.messages[i].upload = data.upload;
                    $scope.messages[i].id = data.id;
                }
            }
        }
    };

    // SEND AUDIO
    $scope.sendAudio = function(audio){   
        swal({
            title: '',
            text: "Deseja enviar áudio?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
            closeOnCancel: true
        },function(isConfirm) {
            if (isConfirm) {
                var typeFile = "audio";              
                $scope.file = audio;
                var preview = {
                    channel_id:$stateParams.id,
                    created_at:moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                    id:0,            
                    internal_id:guid(),           
                    type:"audio",
                    upload:"",
                    progress:0,
                    audio: false,
                    open:false,
                    typeFile:'audio',                               
                    user_id:$rootScope.me.id,
                    owner:$rootScope.me.name
                };
                // SQL ADD
                SQLService.add("messages", preview, function(_id, index){
                    $scope.intervalMessages[index] = setInterval(function(){
                        for(var y in $scope.messages){
                            if($scope.messages[y].internal_id == index){
                                clearInterval($scope.intervalMessages[index]);
                                $scope.toBottom();           
                                Upload.upload({
                                    url: $rootScope.urlRoute + "/Message/Send",
                                    data: {'file': audio, 'type': audio.typeFile, 'channel_id':$stateParams.id,'internal_id':index, '_id':_id},
                                    headers:{
                                        'Access-Token':$rootScope.token
                                    }
                                }).then(function (resp) {
                                    var responseAudio = resp.data;
                                    if(responseAudio.status === "success"){
                                        var row = responseAudio.data;
                                        // console.log("responseAudio", responseAudio);
                                        $scope.intervalMessages[resp.config.data.internal_id] = setInterval(function(){
                                            for(var h in $scope.messages){
                                                if($scope.messages[h].internal_id == resp.config.data.internal_id){
                                                    clearInterval($scope.intervalMessages[resp.config.data.internal_id]);
                                                    // console.log("row", row);
                                                    row.id = parseInt(row.id);
                                                    $scope.messages[h].id = row.id;
                                                    $scope.messages[h].upload = row.upload;
                                                    $scope.messages[h].open = true;
                                                    row.open = true;
                                                    row.channel_id = parseInt(row.channel_id);
                                                    // SQL UPDATE
                                                    SQLService.update("messages",row, resp.config.data._id,function(){
                                                        // console.log("update");
                                                    });
                                                }
                                            }
                                        }, 300);
                                    }
                                }, function (resp) {
                                    alert("erro");
                                },function(evt){
                                    for(var t in $scope.messages){
                                        var progressAudio = parseInt(100.0 * evt.loaded / evt.total);
                                        // console.log("param upload",evt.config.data.internal_id);
                                        // console.log("messages",$scope.messages);
                                        if($scope.messages[t].internal_id == evt.config.data.internal_id){
                                            // console.log("progress",$scope.messages[t]);
                                            if($scope.messages[t].progress != 100){
                                                $scope.messages[t].progress =  progressAudio;
                                            }else{
                                                $scope.messages[t].progress = 0;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }, 300);
                }, preview.internal_id);
            }
        });
    };

    /* INICIO - funções icones send, mic, mic-slash campo de mensagem se textarea 
    vazio exibe icone mic senão exibe icone send */
    // FUNCTION SHOW SEND
    $scope.showSend = function(){ 
        // controla icones campo de mensagem
        if($scope.listMessages != ""){
            $scope.iconAudio = false;
            $scope.iconSend = true;
        }else{
            $scope.iconAudio = true;
            $scope.iconSend = false; 
        }
    };

    // FUNCTION CHANGE AUDIO
    $scope.changeAudio = function(){        
        $scope.iconAudio = false;               
        $scope.iconSend = false;
        $scope.startRecording();
    };

    // FUNCTION AUDIO RECORD MESSAGE
    $scope.audioRecordMessage = function() {
        // controla icones campo de mensagem
        $scope.iconAudio = true;
        $scope.audioRecord = false;
        $scope.iconSend = false;
        //stopRecording();
    };

    $scope.closeMenuGalery = function(){
        $scope.stateGalery = false;
        $(".emoji-menu").hide();
    };    

    /* FIM - funções icones send, mic, mic-slash campo de mensagem se textarea 
    vazio exibe icone mic senão exibe icone send */

    $scope.intervalMessages = {};   
    // FUNCTION SEND MSG 
    $scope.sendMessage = function(){
        $(".emoji-wysiwyg-editor").html("");
        if($.trim($scope.listMessages) == ""){
            return false;
        }
        var preview = {
            channel_id: parseInt($stateParams.id),
            created_at: new Date(), 
            updated_at: moment(new Date()).format('LT'),
            id: 0,
            internal_id: guid(),
            message: $scope.listMessages,
            type: "text",
            upload: null,
            user_id: $rootScope.me.id,
            owner: $rootScope.me.name
        };
        preview.message = $scope.listMessages;

        // FORMDATA SEND MESSAGE
        dataParams = new FormData();
        dataParams.append('type', 'text');//
        dataParams.append('channel_id', $stateParams.id);
        dataParams.append('message', $scope.listMessages);
        dataParams.append('uuid', preview.internal_id);

        $scope.listMessages = '';
        var index = preview.internal_id;

        // SQL ADD
        SQLService.add("messages", preview, function(_id, indice){
            $scope.toBottom();

            // SERVICE SEND MESSAGE
            MessageService.sendMessage(dataParams, function(response, internal_id, id_db){
                response.data.data.created_at = new Date(response.data.data.created_at);    
                response.data.data.updated_at = new Date(response.data.data.created_at);            
                if(response.data.status === "success"){
                    $scope.showSend();
                    if($scope.stateGalery == true){
                        $scope.stateGalery = false;
                        $(".emoji-menu").hide();
                    }
                    $(".emoji-wysiwyg-editor").focus();
                    $scope.intervalMessages[internal_id] = setInterval(function(){
                        for(var d in $scope.messages){
                            if($scope.messages[d].internal_id == internal_id){
                                clearInterval($scope.intervalMessages[internal_id]);
                                $scope.messages[d].id = response.data.data.id;
                                var rowSend = response.data.data;
                                rowSend.id = parseInt(rowSend.id);
                                rowSend.channel_id = parseInt(rowSend.channel_id);
                                // update SQL
                                SQLService.update("messages", rowSend, id_db, function(response){
                                    // console.log("fez o update", response);
                                }); 
                            }
                        }
                    }, 300);      
                }
            }, indice, _id); 
        }, index);
    };

    // FUNCTION AUTO SIZE TEXTAREA MESSAGE
    $scope.autosize = function(){ 
        setTimeout(function(){
            var txtMessage = document.getElementById('textarea').scrollHeight;
            $scope.myStyle = {
                'height':'auto',
                '-moz-box-sizing':'content-box',
                'height': txtMessage + 'px'
            };
            if(txtMessage >= 130){
                $scope.myStyle.overflow = "auto";
            }
        }, 0);

        if ($scope.listMessages == "") {
            $scope.myStyle = {};
        }
    };
    if(!localStorage.getItem("secret-channel-" + $rootScope.me.id)){
        localStorage.setItem("secret-channel-" + $rootScope.me.id, "[]");
    }

    // // MOSTRAR ADD PASSWORD AND REMOVE PASSWORD
    // $scope.insertPassword = true;
    // var secretId = JSON.parse(localStorage.getItem('secret-channel-'+$rootScope.me.id));
    // for(var k in secretId){
    //     if($stateParams.id == secretId[k].id){
    //         $scope.insertPassword = false;
    //     } 
    // }
    //ADD PASSWORD

    // FUNCTION ADD NEW PASSWORD
    $scope.addNewPassword = function(){  
        $scope.openMenuMessage();
        swal({
                title: "Deseja tonar esta conversa segura?",
                text: "A senha para acessar está conversa será a mesma senha do seu login",
                type: "warning",
                confirmButtonColor: "#33a8df ",
                confirmButtonText: "Confirmar",
                cancelButtonText: "Cancelar",
                showCancelButton: true,
                closeOnConfirm: false,
                closeOnCancel: true
            },
        function(isConfirm){
            if (isConfirm) {
                // FORMDATA CHANNEL PASSWORD
                var params = new FormData();
                params.append('channel_id', $rootScope.currentId);

                // SERVICE CHANNEL PASSWORD
                MessageService.channelPassword(params, function(response){
                    if(response.status == "success"){
                        $scope.insertPassword = true;
                        swal("Sucesso!", "Foi adicionado senha a esta conversa", "success"); 
                    }else{
                        swal("Erro", "Não foi possível adicionar senha a esta conversa. Tente novamente.","error");
                    }
                });
            }
        });
    };

    // REMOVE PASSWORD
    $scope.removePassword = function(){
        $scope.openMenuMessage();
        swal({
            title: "Remover senha",
            confirmButtonText: "Confirmar",
            confirmButtonColor: "#2a9fd5",
            cancelButtonText: "Cancelar",
            cancelButtonColor: "#000",
            animation: "true",
            type: "warning",
            showCancelButton: true,
            closeOnConfirm: false,
            closeOnCancel: true
        },
        function(isConfirm){
            if(isConfirm){
                // FORMDATA CHANNEL PASSWORD
                var channelPassword = new FormData();
                channelPassword.append('channel_id', $rootScope.currentId);

                // SERVICE CHANNEL PASSWORD
                MessageService.channelPassword(channelPassword, function(response){
                    if(response.status == "success"){
                        $scope.insertPassword = false;
                        swal("Senha removida com sucesso.", "", "success");
                    }
                });         
            }
        });
    };

    $scope.uploadInterval = {};
    // SEND FILE
    $scope.sendFile = function(file){
        var typeFile = "file";               
        if(file != null){            
            if(file.type.indexOf('video') > -1){
                typeFile = "video";                
            }else if(file.type.indexOf('image') > -1){
                typeFile= "image";                
            }else{
                typeFile = "file";                
            }
             
            swal({
                title: "Descrição",
                text: "Digite uma legenda:",
                type: "input",
                showCancelButton: true,
                closeOnConfirm: true,
                animation: "slide-from-top",
                inputPlaceholder: "legenda"
            },
            function(inputValue){
                if(inputValue === false){
                    return false;
                }
                if(inputValue === "") {
                    swal.showInputError("Você precisa escrever algo");
                    return false;
                }
                $scope.file = file;
                var preview = {
                    channel_id:$stateParams.id,
                    created_at:moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                    id:0,
                    extras:inputValue,
                    internal_id:guid(),
                    message:inputValue,
                    type:"file",
                    upload:"",
                    progress:0,
                    open:false,
                    typeFile:file.type,                               
                    user_id:$rootScope.me.id,
                    owner:$rootScope.me.name
                };  
                // SQL ADD         
                SQLService.add("messages",preview, function(_id, internal_id){
                    $scope.toBottom();
                    $scope.uploadInterval[internal_id] = setInterval(function(){
                        for(var l in $scope.messages){
                            if($scope.messages[l].internal_id == internal_id){
                                clearInterval($scope.uploadInterval[internal_id]);
                                Upload.upload({
                                    url: $rootScope.urlRoute + "/Message/Send",
                                    data: {'file': file, 'type': typeFile, 'channel_id':$stateParams.id,'message':inputValue,'internal_id':internal_id, '_id':_id},
                                    headers:{
                                        'Access-Token':$rootScope.token
                                    }
                                }).then(function(resp){
                                    var responseFile = resp.data;
                                    if(responseFile.status === "success"){
                                        $scope.intervalMessages[resp.config.data.internal_id] = setInterval(function(){
                                            for(var h in $scope.messages){
                                                if($scope.messages[h].internal_id == resp.config.data.internal_id){
                                                    clearInterval($scope.intervalMessages[resp.config.data.internal_id]);
                                                    var row = responseFile.data;
                                                    row.id = parseInt(row.id);
                                                    row.channel_id = parseInt(row.channel_id);
                                                    // SQL UPDATE
                                                    SQLService.update("messages", row, resp.config.data._id);
                                                    $scope.updateMessageList(resp.config.data.internal_id, row);
                                                }
                                            }
                                        }, 300);
                                    }
                                }, function (resp) {
                                    alert("erro");
                                }, function (evt) {
                                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                                    // $scope.progress = progressPercentage;
                                    for(var g in $scope.messages){
                                        if($scope.messages[g].internal_id == evt.config.data.internal_id){
                                            if($scope.messages[g].progress != 100){
                                                $scope.messages[g].progress =  progressPercentage;
                                                $scope.messages[g].open =  false;
                                            }else{
                                                $scope.messages[g].open =  true;
                                                $scope.messages[g].progress = 0;
                                            }
                                        }
                                    }
                                    // $scope.updateMessageList(evt.config.data.get("uuID"), "", progressPercentage);
                                });
                            }
                        }
                    }, 300);
                }, preview.internal_id);
            });         
        }
    };

    // UP/DOWN FOOTER
    $scope.upDownFooter = function(state){
        $scope.stateGalery = state;
    };
}).service(
    'MessageService', [
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
        service.sendMessage = function(params, callback, position, id_db){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Message/Send";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                // console.log("response service", response);
                if (typeof callback === 'function'){
                    callback(response, position, id_db);
                    // console.log("response", response);
                    // console.log("position", position);
                    // console.log("id_db", id_db);
                }
            });
        };
        service.listMessage = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Message/List";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){   
               
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };
        service.markOnReadMessage = function(params, callback, data){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Message/MarkOnRead";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response,data);
                }
            });
        };
        service.channelPassword = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Participant/ActivateDesactivatePassword";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };
        service.deleteChannel = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Channel/DeleteChannel";
            service.req.method = 'post';  
            service.req.data = params;              
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response);
                }
            });
        };
        service.removeMessages = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Message/RemoveAllMessages";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };
        service.addMembers = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Participant/Add";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response);
                }
            });
        };
        service.channelDetail = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Channel/DetailChannel";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };
        // SERVICE START CALL FOR CALL VIDEO AND AUDIO 
        // PARAMS = videochat_name, channel_id, stream_type", "video" OR "call" fixed text
        service.startCall = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute +  "/Channel/receivedChatName";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response);
                }
            });
        };
        // SERVICE END CALL FOR CALL VIDEO AND AUDIO  
        // PARAMS = channel_id
        service.endCall = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute +  "/Channel/DesactivateChatName";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response);
                }
            });
        };
        // SERVICE CHANNEL LAST ACCESS - PARAMS = channel_id;
        service.channelLastAccess = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute +  "/Participant/ChannelLastAccess";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response);
                }
            });
        };
    }
]);


