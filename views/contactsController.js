lockerweb.controller("CtrlContacts", function($rootScope, ContactService, $scope, $state, $stateParams) {	 
	// $rootScope.res();
	$scope.contacts = [];
	$scope.params = $stateParams;
	$scope.createGroup = false;
	$scope.addParticipe = false;
	$scope.avatarGroup = "assets/img/group.png";

	$scope.closeModal = function(){		
		$("#exampleModal").modal('hide');
	};

	// ADD PARTICIPANT GROUP
	if($stateParams.addGroup){
		$scope.viewAdd = true;
		$scope.clickContact = function(){};
	}

	// AVATAR GROUP
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
        $scope.avatarGroup = $scope.myCroppedImage;         
    };

	// ADD PARTICIPANT GROUP
	// $scope.contacts = [];
	$scope.attListContacts = function(){	
		// SERVICE LIST CONTACT	
		ContactService.listContact(function(response){
			$scope.contacts = response.data;			
			$scope.selected = false;
			for(var k in $scope.contacts){
				if($scope.contacts[k].contact.avatar == "" || $scope.contacts[k].contact.avatar == null ){
					$scope.contacts[k].contact.avatar = "assets/img/contact-default.png";
				}
				$scope.contacts[k].blocked = false;
				$scope.contacts[k].selected = false;			
			}				
		});
	};
	$scope.attListContacts();

	// MODAL TRANSPARÊNCIA FULLSCREEN
	$(".modal-fullscreen").on('show.bs.modal', function () {
	  setTimeout( function() {
	    $(".modal-backdrop").addClass("modal-backdrop-fullscreen");
	  }, 0);
	});	

	// FUNCTION OPEN ADD CONTACT
	$scope.openAddContact = function(){
		$("#exampleModal").modal();
		// VERIFY IF CLICK BACK NAVIGATOR
		window.onhashchange = function() {
			$(".modal-backdrop").hide();
		 	$scope.closeModal();
		}
	};

	// MODAL SEARCH CONTACTS
    $scope.searchContacts = function(formSearch){
    	// FORMDATA SEARCH CONTACT
    	var dataForm = new FormData();	
    	dataForm.append('keyword', formSearch);

    	$scope.listSearch = [];

    	// SERVICE SEARCH CONTACT
		ContactService.searchContact(dataForm, function(all){
			$scope.listSearch = all.data;
			for(var f in $scope.listSearch){
				if($scope.listSearch[f].avatar == "" || $scope.listSearch[f].avatar == null){
					$scope.listSearch[f].avatar = "assets/img/contact-default.png";
				}
			}			
		});
	};

	// FUNCTION ADD CONTACT
	$scope.addContact = function(contact){
		swal({
		  title: "Adicionar Contato?",
		  showCancelButton: true,	
		  animation: "slide-from-bottom",	  
		  confirmButtonColor: "#2a9fd5",
		  confirmButtonText: "Adicionar",
		  closeOnConfirm: false
		  },function(isConfirm){
				if (isConfirm) {
					// FORMDATA ADD CONTACT
					var formAddContact = new FormData();
					formAddContact.append('contact_id', contact.id);

					// SERVICE ADD CONTACT
					ContactService.addContact(formAddContact, function(response){
						if(response.status == "success"){
							swal("O contato foi adicionado.", "", "success");
							$scope.attListContacts();
						}else{
							swal("O contato já existe.", "", "error");
						}
						$("#exampleModal").modal('hide');
						$(".modal-backdrop").removeClass();
					});						
				}
			}
		);
	};

	// FUNCTION CLICK CONTACT
    $scope.clickContact = function(currentContact){
		if(!$stateParams.addGroup && !$stateParams.addParticipe){

			// FORMDATA ADD CHANNEL
			var formAddChannel = new FormData();	
			formAddChannel.append('contact_id', currentContact.contact_id);

			// SERVICE ADD CHANNEL
			ContactService.addChannel(formAddChannel, function(response){
				if(response.status == "success"){
					localStorage.setItem("channelId", response.data.id);
					$state.go('messages', {id:response.data.id});
				}else{
					// FORMDATA CHANNEL DETAIL
					var formChannelDetail = new FormData();
				    formChannelDetail.append("channel_id", response.data.id);

				    // SERVICE CHANNEL DETAIL
				    ContactService.channelDetail(formChannelDetail, function(response){
				    	
				    	var currentChannel = response.data;
				    	for(var i in currentChannel.participants){
				            if(currentChannel.participants[i].id == $rootScope.me.id && currentChannel.participants[i].req_pass == "1"){
				                var password = currentChannel.participants[i].password;  
				                $scope.popupPasswordChannel(password, currentChannel);  
				            }
				        }  
				        if(password == undefined){
					    	localStorage.setItem("channelId", currentChannel.id);
					    	$state.go("messages", {id: currentChannel.id});
				        }
				    });
				}
			});
		}else{
			if(currentContact.selected == true){		
				currentContact.selected = false;
				$scope.createGroup = false;
			}else{
				currentContact.selected = true;											
			}
		    // CREATE ARRAY CONTACT SELECTED
			var total = 0; 
			var selecionados = [];
			var namesSelected = [];
			var idSelected = [];

			for (var i in $scope.contacts){
				if($scope.contacts[i].selected){
					total++;
					selecionados.push($scope.contacts[i]);				
				}
			}
			for (var l in selecionados){
				namesSelected.push(selecionados[l].contact.name);
				idSelected.push(selecionados[l].contact.id);
			}
			if($stateParams.addGroup){						
				if(total >= 2){
					$scope.createGroup = true;
				} else{
					$scope.createGroup = false;
				}
			}else{			
				if(total >= 1){
					$scope.addParticipe = true;
				}else{
					$scope.addParticipe = false;
				}
			}
		}


		// FUNCTION CREATE
	    $scope.create = function(){	
			var viewType = "info";
			var viewText = "<span style='color:#ff531a;font-weight:bold;'>Deseja adicionar ao grupo:</span>";
			if($stateParams.addGroup){
				viewType = "input";
				viewText = "<span style='color:#ff531a'>Deseja criar um grupo com:</span>";
			}
			swal({
				title: viewText,
				type: viewType,
				html: true,
				text: namesSelected.join(", "),
				showCancelButton: true,
				closeOnConfirm: true,
				inputPlaceholder: "Nome do grupo"
			},
			function(inputValue){
				if (inputValue === false) return false;
			  
				if (inputValue === "") {
			    	swal.showInputError("Insira um nome para o grupo!");
			    	return false;
				}
				swal({
					title: viewText,
					type: viewType,
					html: true,
					text: namesSelected.join(", "),
					showCancelButton: true,
					closeOnConfirm: false,
					inputPlaceholder: "Nome do grupo"
				});

				$scope.nameGroup = inputValue;

				// FOMRDATA ADD NEW GROUP
				var dataParamsGroup = new FormData();

				for(var j in idSelected){	
			  		dataParamsGroup.append("contact_id["+j+"]", idSelected[j]);
				}

				dataParamsGroup.append("name", $scope.nameGroup);
				dataParamsGroup.append("avatar", $scope.myFile, 'avatar.jpg'); 

				if($stateParams.addGroup){

					// SERVICE ADD NEW GROUP
				  	ContactService.addNewGroup(dataParamsGroup, function(response){
					  	if(response.status == "success"){
					  		swal({
					  			title: "Sucesso!",
					  			html: true,
					  			text: "Grupo:<b> <span style='color:#ff531a;font-weight:bold;'>" + inputValue + "</span></b><br>  foi criado com sucesso",
					  			type: "success"
					  		});
					  		$rootScope.createGroupStatus = false;
					  		$state.go('messages');
					  	}
					});

				}else{
					// FORMDATA ADD NEWS PARTICIPANTS

					for(var k in idSelected){	
						console.log("$rootScope.channelDetail ANTES", $rootScope.channelDetail);
						// FORMDATA NEWS PARTICIPANT
						var formAddParticipant = new FormData();
			  			formAddParticipant.append("channel_id", $rootScope.channelDetail.id);
		  				formAddParticipant.append("uuId", k);
			  			formAddParticipant.append("contact_id", idSelected[k]);

			  			// SERVICE ADD PARTICIPANT
						ContactService.addParticipant(formAddParticipant, function(response){
							console.log("response addParticipant", response);
							console.log("response.data.status addParticipant", response.data.status);
							if(response.data.status == "success"){
							console.log("entrou no if do addParticipant");
								if(response.config.data.get('uuId') == idSelected.length -1){
							  		swal({
							  			title: "Sucesso!",
							  			html: true,
							  			text: "Novo(s) participante(s) adicionado(s) com sucesso.",
							  			type: "success"
							  		}, function(isConfirm){
            							if (isConfirm) {
						  					$state.go("group", {id:$stateParams.id});
            							}
            						});
							  	}
							}else{
							  	swal({
						  			title:"Atenção",
						  			html: true,
						  			text: "Usuário(s) já existe na lista de participante do grupo.",
						  			type: "warning"
					  			});
					  			console.log("$rootScope.channelDetail DEPOIS", $rootScope.channelDetail);
						  	}	
						});										
			  		}
				}
			});		
		};	
    };

    // FUNCTION ACTION POPUP ADD PASSWORD CHANNEL
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
        	console.log("inputValue", inputValue);
            if (inputValue === false) return false;
            if (inputValue === ""){
                swal.showInputError("Este campo é obrigatorio!");
                return false;
            }                   
            var hash = $.md5(inputValue);
            if(hash ==  mePassword){
                localStorage.setItem("channelId", currentChannel.id);
                $state.go("messages", {id: currentChannel.id});
                swal.close();
            }else{
                swal("Senha invalida!", "Tente novamente.", "error");
            }  
        });
    };	

	$scope.badge = false;

	// FUNCTION CONTACTS BLOCKED
	$scope.contactsBlock = function(){
		$scope.badge = true;
		// SERVICE BLOCKED LIST
		ContactService.blockedList(function(response){
			$scope.contacts = response.data;
			for(var k in $scope.contacts){
				if($scope.contacts[k].contact.avatar == "" || $scope.contacts[k].contact.avatar == null ){
					$scope.contacts[k].contact.avatar = "assets/img/contact-default.png";
				}
				$scope.contacts[k].blocked = true;
			}
		});
	};
	
	// FUNCTION CONTACTS NORMAL
	$scope.contactsNormal = function(){
		$scope.badge = false;
		$scope.attListContacts(); 
	};
}).service(
	'ContactService', [
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
		service.listContact = function(callback){
			service.req.headers['Access-Token'] = $rootScope.token;
			service.req.url = $rootScope.urlRoute + "/Contact/List";
			service.req.method = 'post';				
			$http(service.req).then(function(response){
				if (typeof callback === 'function'){
					callback(response.data);
				}
			});
		};
		service.addContact = function(params,callback){
			service.req.headers['Access-Token'] = $rootScope.token;
			service.req.url = $rootScope.urlRoute + "/Contact/Add";
			service.req.method = 'post';
			service.req.data = params;
			$http(service.req).then(function(response){
				if (typeof callback === 'function'){
					callback(response.data);
				}
			});
		};
		service.blockedList = function(callback){
			service.req.headers['Access-Token'] = $rootScope.token;
			service.req.url = $rootScope.urlRoute + "/Blacklist/List";
			service.req.method = 'post';
			$http(service.req).then(function(response){
				if (typeof callback === 'function'){
					callback(response.data);
				}
			});
		};
		service.searchContact = function(params,callback){
			service.req.headers['Access-Token'] = $rootScope.token;
			service.req.url = $rootScope.urlRoute + "/Contact/Search";
			service.req.method = 'post';
			service.req.data = params;
			$http(service.req).then(function(response){
				if (typeof callback === 'function'){
					callback(response.data);
				}
			});
		};
		service.addChannel = function(params,callback){
			service.req.headers['Access-Token'] = $rootScope.token;
			service.req.url = $rootScope.urlRoute + "/Channel/Add";
			service.req.method = 'post';
			service.req.data = params;
			$http(service.req).then(function(response){
				if (typeof callback === 'function'){
					callback(response.data);
				}
			});
		};
		service.addNewGroup = function(params,callback){
			service.req.headers['Access-Token'] = $rootScope.token;
			service.req.url = $rootScope.urlRoute + "/Channel/AddNewGroup";
			service.req.method = 'post';
			service.req.data = params;
			$http(service.req).then(function(response){
				if (typeof callback === 'function'){
					callback(response.data);
				}
			});
		};
		service.addParticipant = function(params,callback){
            service.req.headers['Access-Token'] = $rootScope.token;
            service.req.url = $rootScope.urlRoute + "/Channel/AddParticipant";
            service.req.method = 'post';
            service.req.data = params;
            $http(service.req).then(function(response){
                if (typeof callback === 'function'){
                    callback(response);
                }
            });
   		};
   		// params = email, password
		service.unblockedContact = function(params,callback){
			service.req.headers['Access-Token'] = $rootScope.token;
			service.req.url = $rootScope.urlRoute + "/Blacklist/Remove";
			service.req.method = 'post';
			service.req.data = params;
			$http(service.req).then(function(response){
				if (typeof callback === 'function'){
					callback(response.data);
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
	}
]);
