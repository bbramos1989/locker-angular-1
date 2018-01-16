lockerweb.controller("CtrlContactDetail", function($state,$scope,$stateParams,$rootScope,ContactDetailService) { 

//PARAMETROS DE ROTA
console.log("$stateParams.contactid", $stateParams.contactid);

//FORMDATA
var dataParams = new FormData();
dataParams.append("contact_id", $stateParams.contactid)

//CONTACT DETAIL
ContactDetailService.detailContact(dataParams, function(response){
	$scope.contactDetail = response.data;
   if(response.data.avatar == null || response.data.avatar == ""){
		$scope.contactDetail.avatar = "assets/img/contact-default.png";
	}
});


//EXCLUIR CONTATO
$scope.removeContact = function(){
	swal({
	  title: "Deletar Contato?",
	  type: "warning",
	  showCancelButton: true,
	  confirmButtonColor: "#2a9fd5",
	  confirmButtonText: "Deletar!",
	  cancelButtonText: "Cancelar",
	  closeOnConfirm: false,
	  closeOnCancel: true
	},
	function(isConfirm){
	  if (isConfirm) {
	  	ContactDetailService.removeContact(dataParams, function(response){
	  		if(response.status == "success"){
	  			$state.go('contacts', {id:$rootScope.currentId});
	  		}
		});
	    swal("Deletado(a)!", "", "success");
	  } else {
	    
	  }
	});	
};

// BLOQUEAR CONTATO
$scope.blockContact = function(){
	swal({
	  title: "Bloquear Contato?",
	  type: "warning",
	  showCancelButton: true,
	  confirmButtonColor: "#2a9fd5",
	  confirmButtonText: "Bloquear!",
	  cancelButtonText: "Cancelar",
	  closeOnConfirm: false,
	  closeOnCancel: true
	},
	function(isConfirm){
	  if (isConfirm) {

	  	var dataFormBlock = new FormData();
	  	dataFormBlock.append('blocked_id', $stateParams.contactid);
	  	ContactDetailService.blockContact(dataFormBlock, function(){
			$state.go('contacts', {id:$rootScope.currentId});
		});
	    swal("Bloqueado(a)!", "", "success");
	  } else {	    
	  }
	});	
};

}).service(
		'ContactDetailService', [
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
			service.listContact = function(params,callback){
				service.req.headers['Access-Token'] = $rootScope.token;
				service.req.url = $rootScope.urlRoute + "/Contact/List";// params = email, password
				service.req.method = 'post';
				service.req.data = params;
				$http(service.req).then(function(response){
					if (typeof callback === 'function'){
						callback(response.data);
					}
				});
			};
			service.detailContact = function(params,callback){
				service.req.headers['Access-Token'] = $rootScope.token;
				service.req.url = $rootScope.urlRoute + "/Contact/ContactPerfil";// params = email, password
				service.req.method = 'post';
				service.req.data = params;
				$http(service.req).then(function(response){
					if (typeof callback === 'function'){
						callback(response.data);
					}
				});
			};
			service.removeContact = function(params,callback){
				service.req.headers['Access-Token'] = $rootScope.token;
				service.req.url = $rootScope.urlRoute + "/Contact/Remove";// params = email, password
				service.req.method = 'post';
				service.req.data = params;
				$http(service.req).then(function(response){
					if (typeof callback === 'function'){
						callback(response.data);
					}
				});
			};
			service.removeChannel = function(params, callback){
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
			service.blockContact = function(params,callback){
				service.req.headers['Access-Token'] = $rootScope.token;
				service.req.url = $rootScope.urlRoute + "/Blacklist/Add";// params = email, password
				service.req.method = 'post';
				service.req.data = params;
				$http(service.req).then(function(response){
					if (typeof callback === 'function'){
						callback(response.data);
					}
				});
			};
			service.unblockedContact = function(params,callback){
				service.req.headers['Access-Token'] = $rootScope.token;
				service.req.url = $rootScope.urlRoute + "/Blacklist/Remove";// params = email, password
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