lockerweb.controller("CtrlRecover", function($state, $scope,RecoverService, $stateParams, $rootScope) {
	$scope.formRecover = function(){
		var dataParams = new FormData();		
		dataParams.append('email', $scope.email);
		RecoverService.recover(dataParams, function(response){
			if(response.status == "success"){
	            swal({
	                  title: "",
	                  text: "Um link foi enviado para o seu e-mail cadastrado!",
	                  type: "success",
	                  confirmButtonText: "Ok",
	                  confirmButtonColor: "#2a9fd5"
	                });
	            $state.go("login");    
	        }else{                
	            swal("", "E-mail não encontrado ou não existe em nosso banco de dados!", "error");                    
	        }		
		});
	};
}).service(
'RecoverService', [
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
	    service.recover = function(params, callback){
	        service.req.headers['Access-Token'] = $rootScope.token;
	        service.req.url = $rootScope.urlRoute + "/User/SolicitRedefinesPassword";
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