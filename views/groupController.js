lockerweb.controller("CtrlGroup", function($scope, groupService, MessageService, $stateParams, $rootScope, $state, MasterService) {
    console.log("group");

    $scope.dataChangeGroup = {}; 
    $scope.channelDetail = {};
    $scope.showEdit = false;

    // EDIT AVATAR GROUP
    $scope.myImage = "";
    $scope.myCroppedImage = ''; // in this variable you will have dataUrl of cropped area.
    $scope.myFile = ""; 

    $scope.uploadGroup = function(file){    
        $scope.myImage = file;
        $("#myModal").modal('show');        
    };

    $scope.editImageGroup = function(){
        var base64 = $scope.myCroppedImage.split(",");
        var result = base64[base64.length - 1];
        var blob = $rootScope.b64toBlob(result, "image/jpg");
        $scope.myFile = $rootScope.blobToFile(blob, "my-image.jpg");
        $scope.channelDetail.avatar = $scope.myCroppedImage;       
        console.log("$scope.channelDetail.avatar = $scope.myCroppedImage", $scope.channelDetail.avatar = $scope.myCroppedImage);
        // CROPPED IMAGE (FUNCTION IN MASTER CONTROLLER)
    };
    $scope.channelDetail.avatar = $scope.myImage;      

    // FUNCTION EDIT DATA GROUP
    $scope.editGroup = function(){
        // FORMDATA EDIT GROUP
        var formEditGroup = new FormData();    
        formEditGroup.append('id', $scope.channelDetail.id);
        formEditGroup.append('name', $scope.channelDetail.name);
        formEditGroup.append('avatar', $scope.myFile, 'avatar.jpg');  

        // SERVICE EDIT GROUP
        groupService.editGroup(formEditGroup, function(response){
            if(response.status == "success"){               
                swal("", "Dado(s) do grupo atualizado(s) com sucesso!", "success");
            }else{
                swal("", "Ocorreu um erro tente novamente.", "error");
            }
        });
        $scope.showEdit = false;
    };

    // FUNCTION ACTIVE EDIT DATA GROUP
    $scope.clickEditGroup = function(){
        $scope.showEdit = true;
    };

    // MODAL DE TEMPO DE MSG
    $("#modal-time").hide();
    
    // FUNCTION OPEN MODAL TIME EXPIRATION
    $scope.openModalTime = function(){
        $("#modal-time").slideToggle();
    };

    // DETAILS CHANNEL
    var dataParams = new FormData();
    $rootScope.currentId = $stateParams.id;
    dataParams.append("channel_id", $rootScope.currentId);

    $scope.currentAdmin = [];
    $scope.currentId = []; 

    // LIST PARTICIPANTS
    MessageService.channelDetail(dataParams, function(response){
        $scope.channelDetail = response.data;   
        console.log("MessageService.channelDetail", $scope.channelDetail);
        if((response.data.avatar == null || response.data.avatar == "") && response.data.type_chat == "double"){
           $scope.channelDetail.avatar = "assets/img/contact-default.png";
        }
        if((response.data.avatar == null || response.data.avatar == "") && response.data.type_chat == "group"){
           $scope.channelDetail.avatar = "assets/img/group.png";
        }
        $scope.listParticipants = response.data.participants;

        for(var k in $scope.listParticipants){
            if($scope.listParticipants[k].avatar == "" || $scope.listParticipants[k].avatar == null){
                $scope.listParticipants[k].avatar = "assets/img/contact-default.png";
            }     
            if($scope.listParticipants[k].admin == "1"){
                $scope.currentAdmin.push($scope.listParticipants[k]);                             
            }
        }
        $scope.isAdmin = false;
        for(var j in  $scope.currentAdmin){
            if($scope.currentAdmin[j].id == $rootScope.me.id){
                $scope.isAdmin = true;
            }
        }
    });

    // FUNCTION VERIFY MESSAGE EXPIRES FOR CREATE TEXT FORMAT 
    $scope.verifyMessageExpires = function(timer){
        var timer = timer.toString();
        switch (timer){
            case "60":
                    $rootScope.txtTimerExpiration = "1 minuto";
                    break;
            case "600":
                    $rootScope.txtTimerExpiration = "10 minutos";
                    break;
            case "1800":
                    $rootScope.txtTimerExpiration = "30 minutos";
                    break;
            case "3600":
                    $rootScope.txtTimerExpiration = "1 hora";
                    break;
            case "43200":
                    $rootScope.txtTimerExpiration = "12 horas";
                    break;
            case "86400":
                    $rootScope.txtTimerExpiration = "1 dia";
                    break;
            default:
                $rootScope.txtTimerExpiration = 'disabled';
                break;
        }
    };
    if($rootScope.channelDetail.message_expires == null){
        $scope.verifyMessageExpires(0);  
    }else{
        $scope.verifyMessageExpires($rootScope.channelDetail.message_expires);  
    }

    $scope.slide = 0;

    // FUNCTION OPEN OPTIONS PARTICIPANTS GROUP
    $scope.openOptionParticipant = function(idParticipant){
        $scope.slide = idParticipant;
        // OPEN/CLOSE OPTIONS PARTICIPANT GROUP
        $(".option-contacts").animate({width:'toggle'}, 350);                           
    };

    // FUNCTION ADD ADMIN
    $scope.addAdmin = function(participant){
        // OPEN/CLOSE OPTIONS PARTICIPANT GROUP
        $(".option-contacts").animate({width:'toggle'}, 350);   

        // FORMDATA BECOME ADMIN
        var formBecomeAdmin = new FormData();
        formBecomeAdmin.append('channel_id', $rootScope.currentId);
        formBecomeAdmin.append('contact_id', $scope.slide);

        swal({
            title: "Deseja tornar <span style='color: #33a8df; text-transform:capitalize'>" + participant.name + "</span> administrador?",
            type: "warning",
            html: true,
            showCancelButton: true,
            confirmButtonColor: "#2a9fd5",
            confirmButtonText: "Ok",
            cancelButtonText: "Cancelar",
            closeOnConfirm: false,
            closeOnCancel: true
        },function(isConfirm){
            if (isConfirm) {
                // SERVICE BECOME ADMIN 
                groupService.becomeAdmin(formBecomeAdmin, function(response){
                    if(response.status == "success"){
                        swal("", participant.name + " agora é um ADMIN", "success");
                        $scope.slide = 0;
                        $scope.currentAdmin.push(participant);    
                        
                        // SERVICE CHANNEL DETAIL
                        MessageService.channelDetail(formBecomeAdmin, function(response){
                            $scope.listParticipants = response.data.participants;
                            for(var k in $scope.listParticipants){
                                if($scope.listParticipants[k].avatar == "" || $scope.listParticipants[k].avatar == null){
                                    $scope.listParticipants[k].avatar = "assets/img/contact-default.png";
                                }     
                            } 
                        });
                    }else{
                        swal("Erro", "", "error");
                    }
                });            
            }
        });
    };

    // FUNCTION REMOVE PARTICIPANT
    $scope.removeParticipant = function(participant){
        console.log("participant", participant);
        // CLOSE/OPEN OPTIONS PARTICIPANT GROUP
        $(".option-contacts").animate({width:'toggle'}, 350);
        var nameParticipant = "<";
        swal({
              title: "Deseja excluir <span style='color: #33a8df; text-transform:capitalize'>" + participant.name + " </span>do grupo?",
              type: "warning",
              showCancelButton: true,
              html: true,
              confirmButtonColor: "#2a9fd5",
              confirmButtonText: "Excluir",
              cancelButtonText: "Cancelar",
              closeOnConfirm: false,
              closeOnCancel: true
        },function(isConfirm){
              if (isConfirm) {
                // FORMDATA REMOVE PARTICIPANT
                var formRemoveParticipant = new FormData();
                formRemoveParticipant.append('channel_id', $rootScope.currentId);
                formRemoveParticipant.append('participant_id', participant.id);

                // SERVICE REMOVE PARTICPANT
                groupService.removeParticipant(formRemoveParticipant, function(response){
                    console.log("response do PARTICIPANT", response);
                    if(response.status == "success"){
                        console.log('deu sucesso');
                        swal.close();
                        // FORMDATA CHANNEL DETAIL
                        var formChannelDetail = new FormData();
                        formChannelDetail.append('channel_id', $rootScope.currentId);

                        // SERVICE CHANNEL DETAIL
                        MessageService.channelDetail(formChannelDetail, function(response){
                            console.log("response channelDetail", response);
                            $rootScope.channelDetail = response.data;
                            console.log("$rootScope.channelDetail", $rootScope.channelDetail);

                            for(var k in $rootScope.channelDetail.participants){
                                if($rootScope.channelDetail.participants[k].avatar == "" || $rootScope.channelDetail.participants[k].avatar == null || $rootScope.channelDetail.participants[k].avatar == undefined){
                                    $rootScope.channelDetail.participants[k].avatar = "assets/img/contact-default.png";
                                }           
                            } 
                            $scope.listParticipants = $rootScope.channelDetail.participants;
                            console.log("$scope.listParticipants", $scope.listParticipants);
                        });
                    }else{
                        swal("Ops", response.message, "error");
                    }
                   
                });            
            } 
        });
    };

    // FUNCTION EXCLUDE CHANNEL
    $scope.excludeChannel = function(){
        dataParams.append("participant_id", $rootScope.me.id);  
        groupService.removeParticipant(dataParams, function(response){
            if(response.status == 'success'){
               $state.go('messages', {id:0});
               swal({
                    title: "Sucesso",
                    text: "Excluído do grupo com sucesso.",
                    type: "success",
                    confirmButtonText: "Ok",
                    confirmButtonColor: "#2a9fd5"
               });
            }else{
                // code
            }
        });
    };

    // FUNCTION ADD PARTICIPANT
    $scope.addParticipant = function(){
        $state.go("contacts", {addParticipe: "AddParticipe", id:$rootScope.currentId});
    }; 

    // FUNCTION GET OUT GROUP
    $scope.exitChannel = function(){    
        swal({
          title: "Sair do grupo",
          text: "Tem certeza que deseja sair deste grupo?",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#2a9fd5",
          confirmButtonText: "Sair",
          cancelButtonText: "Cancelar",
          closeOnConfirm: false,
          closeOnCancel: false
        },
        function(isConfirm){
            if (isConfirm) {
                dataParams.append("channel_id", $rootScope.currentId); 
                if($scope.currentAdmin.length > 1){
                    // SERVICE EXIT CHANNEL
                    groupService.exitChannel(dataParams, function(response){
                        if(response.status == 'success'){
                           swal.close();
                           $state.go('messages', {id:0});
                        }else{
                            swal.close();
                        }
                    });
                }else{
                    console.log("ID indexado", $scope.currentAdmin[0].id);
                    console.log("ID sem index", $scope.currentAdmin.id);
                    if($scope.currentAdmin[0].id == $rootScope.me.id){
                        console.log("entrou no if do currentAdmin");
                        if ($scope.listParticipants.length > 1) {
                            console.log("entro no listParticipants");
                            swal("Ops", "Antes de sair deste grupo é necessário tornar outro participante admin.", "info");
                        }else{
                            swal({
                                  title: "Excluir o grupo?",
                                  type: "warning",
                                  showCancelButton: true,
                                  html: true,
                                  confirmButtonColor: "#2a9fd5",
                                  confirmButtonText: "Excluir",
                                  cancelButtonText: "Cancelar",
                                  closeOnConfirm: false,
                                  closeOnCancel: true
                            },function(isConfirm){
                                  if (isConfirm) {
                                    console.log("isConfirm");
                                    // FORMDATA DELETE CHANNEL
                                    var formDeleteChannel = new FormData();
                                    console.log("formDeleteChannel");
                                    formDeleteChannel.append('channel_id', $rootScope.currentId);

                                    // SERVICE FORMDATA DELETE CHANNEL
                                    groupService.deleteChannel(formDeleteChannel, function(response){
                                        if(response.status == "success"){
                                            console.log("entrou no if do response.status == success");
                                            swal("Sucesso!", "Grupo deletado com sucesso.", "success");
                                            $state.go('channels');
                                        }else{
                                            swal("Erro!", "Houve um erro ao excluir o grupo. Tente novamente", "error");
                                        }
                                    });     
                                } 
                            });
                        }
                    }else{
                        // SERVICE EXIT CHANNEL
                        groupService.exitChannel(dataParams, function(response){
                            if(response.status == 'success'){
                                swal.close();
                                $state.go('messages', {id:0});
                            }else{
                                swal.close();
                            }
                        });
                    }
                }
            }else{
                swal.close();
            }
        });        
    };

    $rootScope.choiceNewAdmin = function(selectedAdmin){            
        dataParams.append("channel_id", $rootScope.currentId);
        dataParams.append('contact_id', selectedAdmin.id);
        groupService.choiceNewAdminandOwner(dataParams, function(response){
            if(response.status == 'success'){
                $state.go('messages', {id:0});
                 swal({
                    title: "Novo admin cadastrado com sucesso.",
                    type: "success",
                    confirmButtonText: "Ok",
                    confirmButtonColor: "#2a9fd5"
                 });
                  $('#modalNewAdmin').modal('hide');
            }else{
                 swal({
                    title: "Novo admin não pode ser cadastrado.",
                    type: "warning",
                    confirmButtonText: "Ok",
                    confirmButtonColor: "#2a9fd5"
                });
                $('#modalNewAdmin').modal('hide');
            }
        });
    };


    $scope.time = [
        {label: "Desabilitar" , value: 0},
        {label: "1 minuto", value: 60},
        {label: "10 minutos", value: 600},
        {label: "30 minutos", value: 1800},
        {label: "1 hora", value: 3600},
        {label: "12 horas", value: 43200},
        {label: "1 dia", value: 86400}
    ]; 
    $scope.editTimeToExpiration = function(selectedTime){   
        console.log("selectedTime", selectedTime); 
        // PARAMS FORMDATA FOR SERVICE EDITTIMETOEXPIRATION
        var timeParams = new FormData();
        if( selectedTime == null){
            timeParams.append('message_expires', 0);
            $rootScope.channelDetail.message_expires = 0;
        }else{
            $rootScope.channelDetail.message_expires = selectedTime.value;
            timeParams.append('message_expires', $rootScope.channelDetail.message_expires);
        }
        timeParams.append('id', $stateParams.id);

        // SERVICE EDIT TIME TO EXPIRATION
        groupService.editTimeToExpiration(timeParams, function(response){
            if(response.status == 'success'){
                $scope.verifyMessageExpires($rootScope.channelDetail.message_expires);
            }
            $("#modal-time").hide();
        });
    };
}).service(
    'groupService', [
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
        service.listGroup = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Participant/List";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        }; 
        service.choiceNewAdmin = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Participant/BecomeAdmin";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };      
        service.choiceNewAdminandOwner = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/channel/selectNewAdmin";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };          
        service.exitChannel = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Channel/RemoveParticipant";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };               
        service.editTimeToExpiration = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Channel/Edit";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };        
        service.becomeGroup = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Participant/BecomeAdmin";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };
        service.revokeGroup = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Participant/RevokeAdmin";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };
        service.removeGroup = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Participant/Remove";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };        
        // PARAMS = id, name, avatar
        service.editGroup = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Channel/Edit";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };
        service.removeParticipant = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Channel/ExcludeParticipant";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };
        service.becomeAdmin = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Participant/BecomeAdmin";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };
        // PARAMS = channel_id;
        service.deleteChannel = function(params, callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Channel/DeleteChannel";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response.data);
                }
            });
        };  
    }
]);