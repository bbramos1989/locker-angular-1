lockerweb.controller("CtrlConfirmUser", function($state, $scope,ConfirmUserService, $stateParams, $rootScope) {
	$scope.email = $stateParams.user;
	$scope.code = $stateParams.token;

	$scope.confirmed = function(){
		var dataParams = new FormData();
		dataParams.append('activation_code', $scope.code);
		dataParams.append('email', $scope.email);
		ConfirmUserService.confirmUser(dataParams, function(response){
			if(response.status == "success"){	            
	            $state.go("login");    
	        }else{                
	            swal("", "Não foi possível ativar o seu cadastro, tente novamente!", "error");                    
	        }		
		});
	};
}).service(
'ConfirmUserService', [
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
	    service.confirmUser = function(params, callback){
	        service.req.headers['Access-Token'] = $rootScope.token;
	        service.req.url = $rootScope.urlRoute + "/User/Active";
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